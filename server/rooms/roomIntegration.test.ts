import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import pg from 'pg'
import { pool } from '../db/pool'
import { migrate } from '../db/migrate'
import { createRoom, joinRoom, closeRoom, removeMember } from './roomRepository'
import { cancelRound, startRound, vote } from './roundRepository'
import { getRoomView } from './roomView'
import { drawTieBreak } from './tieBreakRepository'

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
    const roundId = await startRound(roomId, host, { genre: 'drama' }, movies)
    await expect(vote(roomId, stranger, movies[0].id, 'up')).rejects.toThrow('MEMBER_REQUIRED')
    await vote(roomId, guest, movies[0].id, 'up')
    await vote(roomId, guest, movies[0].id, 'up')
    expect((await getRoomView(roomId, host))?.round?.myVotes).toEqual([])
    expect((await getRoomView(roomId, host))?.round?.voteCount).toBe(1)
    await vote(roomId, host, movies[0].id, 'up')
    expect((await getRoomView(roomId, host))?.round?.winners).toEqual([movies[0].id])
    await expect(drawTieBreak(roomId, roundId, host)).rejects.toThrow('TIE_BREAK_UNAVAILABLE')
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
    const roundId = await startRound(roomId, host, { maxRuntime: 120 }, movies)
    await expect(drawTieBreak(roomId, roundId, host)).rejects.toThrow('ROUND_CHANGED')
    const guestId = (await getRoomView(roomId, guest))?.me?.id ?? ''
    await expect(removeMember(roomId, guestId, host)).rejects.toThrow('ROUND_ACTIVE')
    await Promise.all([vote(roomId, host, movies[0].id, 'up'), vote(roomId, guest, movies[1].id, 'up')])
    await vote(roomId, host, movies[0].id, 'up')
    await Promise.all([vote(roomId, host, movies[1].id, 'skip'), vote(roomId, guest, movies[0].id, 'skip')])
    const leaders = movies.map((movie) => movie.id)
    expect(await getRoomView(roomId, host)).toMatchObject({ tieBreakAvailable: true, round: { winners: leaders } })
    await expect(drawTieBreak(roomId, roundId, guest)).rejects.toThrow('HOST_REQUIRED')
    const [drawn, repeated] = await Promise.all([drawTieBreak(roomId, roundId, host), drawTieBreak(roomId, roundId, host)])
    expect(leaders).toContain(drawn)
    expect(repeated).toBe(drawn)
    const guestView = await getRoomView(roomId, guest)
    expect(guestView?.tieBreakAvailable).toBeUndefined()
    expect(guestView?.round).toMatchObject({ tieBreakWinnerId: drawn, winners: leaders })
    expect(guestView?.round?.voteCount).toBe(4)
    expect(guestView?.history[0]).toMatchObject({ tieBreakWinnerId: drawn, winners: leaders })
    const nextRound = await startRound(roomId, host, {}, movies)
    await expect(drawTieBreak(roomId, roundId, host)).rejects.toThrow('ROUND_CHANGED')
    for (const member of [host, guest]) {
      for (const movie of movies) await vote(roomId, member, movie.id, 'skip', nextRound)
    }
    expect((await getRoomView(roomId, guest))?.round?.winners).toEqual([])
    await expect(drawTieBreak(roomId, nextRound, host)).rejects.toThrow('TIE_BREAK_UNAVAILABLE')
    expect((await getRoomView(roomId, stranger))?.round).toBeUndefined()
    await expect(removeMember(roomId, guestId, guest)).rejects.toThrow('HOST_REQUIRED')
    await removeMember(roomId, guestId, host)
    await expect(joinRoom(roomId, 'Макс', guest)).rejects.toThrow('MEMBER_REMOVED')
    for (let index = 0; index < 7; index++) await joinRoom(roomId, `Новый ${index}`, `test-extra-${index}`)
    await expect(joinRoom(roomId, 'Лишний', stranger)).rejects.toThrow('ROOM_IS_FULL')
    await closeRoom(roomId, host)
  })

  it('limits the draw to tied leaders and rejects a round with one winner', async () => {
    const candidates = [...movies, { id: 'test:three', title: 'Третий', year: 2026, posterUrl: 'https://example.test/three.jpg' }]
    const roomId = await createRoom({ title: 'Три фильма', mode: 'group', hostName: 'Аня' }, host)
    roomIds.push(roomId)
    await joinRoom(roomId, 'Макс', guest)
    const leaders = movies.map((movie) => movie.id)
    const tie = await startRound(roomId, host, {}, candidates)
    for (const member of [host, guest]) {
      for (const movie of candidates) {
        await vote(roomId, member, movie.id, member === host || leaders.includes(movie.id) ? 'up' : 'skip', tie)
      }
    }
    expect((await getRoomView(roomId, host))?.round?.winners).toEqual(leaders)
    expect(leaders).toContain(await drawTieBreak(roomId, tie, host))

    const singleWinner = await startRound(roomId, host, {}, candidates)
    for (const member of [host, guest]) {
      for (const movie of candidates) {
        await vote(roomId, member, movie.id, movie.id === leaders[0] ? 'up' : 'skip', singleWinner)
      }
    }
    expect((await getRoomView(roomId, host))?.round?.winners).toEqual([leaders[0]])
    await expect(drawTieBreak(roomId, singleWinner, host)).rejects.toThrow('TIE_BREAK_UNAVAILABLE')

    const abandonedTie = await startRound(roomId, host, {}, movies)
    for (const member of [host, guest]) {
      for (const movie of movies) await vote(roomId, member, movie.id, 'up', abandonedTie)
    }
    expect((await getRoomView(roomId, host))?.tieBreakAvailable).toBe(true)
    await startRound(roomId, host, {}, movies)
    await cancelRound(roomId, host)
    const previous = await getRoomView(roomId, host)
    expect(previous?.round?.id).toBe(abandonedTie)
    expect(previous?.tieBreakAvailable).toBeUndefined()
    await expect(drawTieBreak(roomId, abandonedTie, host)).rejects.toThrow('ROUND_CHANGED')
  })

  it('keeps blind candidate identities private until the result and restores secret votes', async () => {
    const roomId = await createRoom({ title: 'Слепой сеанс', mode: 'couple', hostName: 'Аня' }, host)
    roomIds.push(roomId)
    await joinRoom(roomId, 'Макс', guest)
    await startRound(roomId, host, { blind: true }, movies)
    const hostRound = (await getRoomView(roomId, host))?.round
    const guestRound = (await getRoomView(roomId, guest))?.round
    expect(hostRound?.blind).toBe(true)
    expect(hostRound?.candidates).toEqual(guestRound?.candidates)
    expect(JSON.stringify(hostRound)).not.toContain(movies[0].id)
    expect(JSON.stringify(hostRound)).not.toContain(movies[0].title)
    const voteId = hostRound?.candidates[0].id ?? ''
    await expect(vote(roomId, host, movies[0].id, 'up')).rejects.toThrow('MOVIE_NOT_FOUND')
    await vote(roomId, host, voteId, 'up')
    expect((await getRoomView(roomId, host))?.round?.myVotes[0].movieId).toBe(voteId)
    expect((await getRoomView(roomId, guest))?.round?.myVotes).toEqual([])
    await vote(roomId, guest, voteId, 'up')
    const result = (await getRoomView(roomId, guest))?.round
    expect(result?.status).toBe('completed')
    expect(result?.candidates[0].id).toBe(movies[0].id)
    expect(result?.winners).toEqual([movies[0].id])
  })
})
