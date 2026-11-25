import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { io, type Socket } from 'socket.io-client'
import type { Server } from 'node:http'
import { app } from '../app'
import { migrate } from '../db/migrate'
import { pool } from '../db/pool'
import { startSocketHub } from './socketHub'
import { getMovieDetails } from '../catalog/movieDetailsService'

const run = process.env.RUN_DB_TESTS === '1' ? describe : describe.skip
const movies = [
  { id: 'tmdb:movie:101', title: 'Первый', year: 2024, posterUrl: 'https://example.test/one.jpg' },
  { id: 'tmdb:movie:102', title: 'Второй', year: 2023, posterUrl: 'https://example.test/two.jpg' },
]
vi.mock('../catalog/movieDetailsService', () => ({ getMovieDetails: vi.fn() }))
vi.mocked(getMovieDetails).mockImplementation(async id => {
  const movie = movies.find(item => item.id === id)
  return movie ? { ...movie, kind: 'movie', match: 80, sourceNames: ['TMDB'], watchOptions: [], externalLinks: [], cast: [], similar: [] } : null
})
let server: Server
let base = ''
let roomId = ''
let hostCookie = ''
let guestCookie = ''
const sockets: Socket[] = []

async function request(path: string, method = 'GET', cookie = '', body?: unknown) {
  const response = await fetch(`${base}${path}`, {
    method, headers: { ...(cookie ? { cookie } : {}), ...(body ? { 'content-type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  })
  return { response, data: await response.json() }
}

async function connect(cookie: string) {
  const socket = io(base, { transports: ['websocket'], extraHeaders: { cookie }, autoConnect: false })
  sockets.push(socket)
  await new Promise<void>((resolve, reject) => {
    socket.once('connect', resolve)
    socket.once('connect_error', reject)
    socket.connect()
  })
  const allowed = await new Promise<boolean>((resolve) => socket.emit('room:subscribe', roomId, resolve))
  expect(allowed).toBe(true)
  return socket
}

run('room HTTP and live events', () => {
  beforeAll(async () => {
    await migrate()
    server = app.listen(0)
    startSocketHub(server)
    const address = server.address()
    if (!address || typeof address === 'string') throw new Error('Test server unavailable')
    base = `http://127.0.0.1:${address.port}`
  })

  afterAll(async () => {
    sockets.forEach((socket) => socket.disconnect())
    if (server) await new Promise<void>((resolve) => server.close(() => resolve()))
    if (roomId) {
      const hashes = (await pool.query('SELECT session_hash FROM room_members WHERE room_id=$1', [roomId])).rows.map((row) => row.session_hash)
      const rounds = (await pool.query('SELECT id FROM room_rounds WHERE room_id=$1', [roomId])).rows.map((row) => row.id)
      await pool.query('DELETE FROM round_votes WHERE round_id=ANY($1)', [rounds])
      await pool.query('DELETE FROM round_candidates WHERE round_id=ANY($1)', [rounds])
      await pool.query('DELETE FROM round_participants WHERE round_id=ANY($1)', [rounds])
      await pool.query('DELETE FROM room_rounds WHERE room_id=$1', [roomId])
      await pool.query('DELETE FROM room_members WHERE room_id=$1', [roomId])
      await pool.query('DELETE FROM rooms WHERE id=$1', [roomId])
      await pool.query('DELETE FROM guest_sessions WHERE token_hash=ANY($1)', [hashes])
    }
    await pool.end()
  })

  it('lets the host start a blind round from a shortlist and restores the room after reconnect', async () => {
    const created = await request('/api/rooms', 'POST', '', { title: 'Тестовая комната', mode: 'couple', hostName: 'Хост' })
    expect(created.response.status).toBe(201)
    roomId = created.data.room.id
    hostCookie = created.response.headers.get('set-cookie')?.split(';')[0] ?? ''
    expect(created.response.headers.get('set-cookie')).toContain('HttpOnly')
    const joined = await request(`/api/rooms/${roomId}/join`, 'POST', '', { name: 'Гость' })
    expect(joined.response.status).toBe(200)
    guestCookie = joined.response.headers.get('set-cookie')?.split(';')[0] ?? ''
    expect((await request('/api/rooms')).data.items).toEqual([])
    expect((await request('/api/rooms', 'GET', guestCookie)).data.items[0].id).toBe(roomId)
    expect(joined.data.room.me.id).not.toBe(created.data.room.me.id)
    const hostSocket = await connect(hostCookie)
    const guestSocket = await connect(guestCookie)
    const path = `/api/rooms/${roomId}/rounds`
    const candidateIds = movies.map(movie => movie.id)
    expect((await request(path, 'POST', guestCookie, { candidateIds })).response.status).toBe(403)
    expect((await request(path, 'POST', hostCookie, { candidateIds: [candidateIds[0], candidateIds[0]] })).response.status).toBe(400)
    expect((await request(path, 'POST', hostCookie, { candidateIds: [candidateIds[0], 'tmdb:movie:999'] })).response.status).toBe(422)
    const changed = new Promise<void>((resolve) => guestSocket.once('room:changed', resolve))
    const started = await request(path, 'POST', hostCookie, { candidateIds, blind: true, maxRuntime: 90 })
    expect(started.response.status).toBe(200)
    const round = started.data.room.round
    const roundId = round.id
    expect(round.candidates).toHaveLength(2)
    expect(round.mood).toEqual({})
    expect(JSON.stringify(round)).not.toContain(movies[0].id)
    expect(JSON.stringify(round)).not.toContain(movies[1].title)
    await changed
    const vote = { movieId: round.candidates[0].id, value: 'up' }
    const staleVote = await request(`/api/rooms/${roomId}/votes`, 'POST', guestCookie, { ...vote, roundId: '00000000-0000-0000-0000-000000000000' })
    expect(staleVote.response.status).toBe(409)
    expect(staleVote.data.message).toBe('ROUND_CHANGED')
    const guestVote = await request(`/api/rooms/${roomId}/votes`, 'POST', guestCookie, { ...vote, roundId })
    expect(guestVote.response.status).toBe(200)
    const hostView = await request(`/api/rooms/${roomId}`, 'GET', hostCookie)
    expect(hostView.data.room.round.myVotes).toEqual([])
    hostSocket.disconnect()
    const restored = await connect(hostCookie)
    expect(restored.connected).toBe(true)
    const hostVote = await request(`/api/rooms/${roomId}/votes`, 'POST', hostCookie, vote)
    expect(hostVote.data.room.round.candidates.map((movie: { id: string }) => movie.id)).toEqual(expect.arrayContaining(candidateIds))
    expect(hostVote.data.room.round.winners).toEqual([hostVote.data.room.round.candidates[0].id])
    const history = await request(`/api/rooms/${roomId}/history`, 'GET', guestCookie)
    expect(history.data.items).toHaveLength(1)
    const revoked = new Promise<void>((resolve) => guestSocket.once('room:revoked', resolve))
    const removed = await request(`/api/rooms/${roomId}/members/${joined.data.room.me.id}`, 'DELETE', hostCookie)
    expect(removed.response.status).toBe(200)
    await revoked
    expect((await request('/api/rooms', 'GET', guestCookie)).data.items).toEqual([])
    expect((await request(`/api/rooms/${roomId}`, 'GET', guestCookie)).data.room.me).toBeUndefined()
  })
})
