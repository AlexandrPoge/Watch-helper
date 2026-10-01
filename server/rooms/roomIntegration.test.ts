import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import pg from 'pg'
import { pool } from '../db/pool'
import { migrate } from '../db/migrate'
import { createRoom, joinRoom, closeRoom, removeMember } from './roomRepository'
import { startRound, vote } from './roundRepository'
import { getRoomView } from './roomView'

const run = process.env.RUN_DB_TESTS === '1' ? describe : describe.skip
const host = 'test-host-session'
const guest = 'test-guest-session'
const stranger = 'test-stranger-session'
const roomIds: string[] = []
const movies = [{ id: 'test:one', title: 'Первый', year: 2024, posterUrl: 'https://example.test/one.jpg' }, { id: 'test:two', title: 'Второй', year: 2025, posterUrl: 'https://example.test/two.jpg' }]

run('persistent room integration', () => {
  beforeAll(async () => { await migrate() })
  afterAll(async () => {
    const sessionHashes = new Set<string>()
    for (const roomId of roomIds) {
      const hashes = (await pool.query('SELECT session_hash FROM room_members WHERE room_id=$1', [roomId])).rows.map((row) => row.session_hash)
      hashes.forEach((hash) => sessionHashes.add(hash))
      const rounds = (await pool.query('SELECT id FROM room_rounds WHERE room_id=$1', [roomId])).rows.map((row) => row.id)
      await pool.query('DELETE FROM round_votes WHERE round_id=ANY($1)', [rounds])
      await pool.query('DELETE FROM round_candidates WHERE round_id=ANY($1)', [rounds])
      await pool.query('DELETE FROM round_participants WHERE round_id=ANY($1)', [rounds])
      await pool.query('DELETE FROM room_rounds WHERE room_id=$1', [roomId])
      await pool.query('DELETE FROM room_members WHERE room_id=$1', [roomId])
      await pool.query('DELETE FROM rooms WHERE id=$1', [roomId])
    }
    await pool.query('DELETE FROM guest_sessions WHERE token_hash=ANY($1)', [[...sessionHashes]])
    await pool.end()
  })
  it('preserves membership, keeps pair votes private and survives a new connection', async () => {
    const roomId = await createRoom({ title: 'Тестовая пара', mode: 'couple', hostName: 'Аня' }, host)
    roomIds.push(roomId)
    await joinRoom(roomId, 'Макс', guest)
    expect((await getRoomView(roomId, stranger))?.me).toBeUndefined()
    expect((await getRoomView(roomId, stranger))?.round).toBeUndefined()
    await startRound(roomId, host, { genre: 'drama' }, movies)
    await expect(vote(roomId, stranger, movies[0].id, 'up')).rejects.toThrow('MEMBER_REQUIRED')
    await vote(roomId, guest, movies[0].id, 'up')
    await vote(roomId, guest, movies[0].id, 'up')
    expect((await getRoomView(roomId, host))?.round?.myVotes).toEqual([])
    expect((await getRoomView(roomId, host))?.round?.voteCount).toBe(1)
    await vote(roomId, host, movies[0].id, 'up')
    expect((await getRoomView(roomId, host))?.round?.winners).toEqual([movies[0].id])
    const anotherPool = new pg.Pool({ connectionString: process.env.DATABASE_URL ?? 'postgres://watch_helper:watch_helper_local@127.0.0.1:5433/watch_helper' })
    try { expect((await anotherPool.query('SELECT count(*)::int AS total FROM room_rounds WHERE room_id=$1', [roomId])).rows[0].total).toBe(1) }
    finally { await anotherPool.end() }
    await closeRoom(roomId, host)
    await expect(joinRoom(roomId, 'Ира', stranger)).rejects.toThrow('ROOM_CLOSED')
  })

  it('serializes concurrent votes, handles ties and enforces host and capacity rules', async () => {
    const roomId = await createRoom({ title: 'Тестовая группа', mode: 'group', hostName: 'Аня' }, host)
    roomIds.push(roomId)
    await joinRoom(roomId, 'Макс', guest)
    await expect(startRound(roomId, guest, {}, movies)).rejects.toThrow('HOST_REQUIRED')
    await startRound(roomId, host, { maxRuntime: 120 }, movies)
    const guestId = (await getRoomView(roomId, guest))?.me?.id ?? ''
    await expect(removeMember(roomId, guestId, host)).rejects.toThrow('ROUND_ACTIVE')
    await Promise.all([vote(roomId, host, movies[0].id, 'up'), vote(roomId, guest, movies[1].id, 'up')])
    await vote(roomId, host, movies[0].id, 'up')
    await Promise.all([vote(roomId, host, movies[1].id, 'skip'), vote(roomId, guest, movies[0].id, 'skip')])
    expect((await getRoomView(roomId, host))?.round?.winners).toEqual(movies.map((movie) => movie.id))
    expect((await getRoomView(roomId, stranger))?.round).toBeUndefined()
    await expect(removeMember(roomId, guestId, guest)).rejects.toThrow('HOST_REQUIRED')
    await removeMember(roomId, guestId, host)
    await expect(joinRoom(roomId, 'Макс', guest)).rejects.toThrow('MEMBER_REMOVED')
    for (let index = 0; index < 7; index++) await joinRoom(roomId, `Новый ${index}`, `test-extra-${index}`)
    await expect(joinRoom(roomId, 'Лишний', stranger)).rejects.toThrow('ROOM_IS_FULL')
    await closeRoom(roomId, host)
  })
})
