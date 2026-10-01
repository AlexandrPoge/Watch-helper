import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { io, type Socket } from 'socket.io-client'
import type { Server } from 'node:http'
import { app } from '../app'
import { migrate } from '../db/migrate'
import { pool } from '../db/pool'
import { startSocketHub } from './socketHub'
import { startRound } from './roundRepository'
import { notifyRoom } from './socketHub'

const run = process.env.RUN_DB_TESTS === '1' ? describe : describe.skip
const movies = [{ id: 'test:one', title: 'Первый', year: 2024, posterUrl: 'https://example.test/one.jpg' }]
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

  it('separates guests, publishes changes and restores the room after reconnect', async () => {
    const created = await request('/api/rooms', 'POST', '', { title: 'Тестовая комната', mode: 'couple', hostName: 'Хост' })
    expect(created.response.status).toBe(201)
    roomId = created.data.room.id
    hostCookie = created.response.headers.get('set-cookie')?.split(';')[0] ?? ''
    expect(created.response.headers.get('set-cookie')).toContain('HttpOnly')
    const joined = await request(`/api/rooms/${roomId}/join`, 'POST', '', { name: 'Гость' })
    expect(joined.response.status).toBe(200)
    guestCookie = joined.response.headers.get('set-cookie')?.split(';')[0] ?? ''
    expect(joined.data.room.me.id).not.toBe(created.data.room.me.id)
    const hostSocket = await connect(hostCookie)
    const guestSocket = await connect(guestCookie)
    await startRound(roomId, (await pool.query('SELECT session_hash FROM room_members WHERE room_id=$1 AND is_host=true', [roomId])).rows[0].session_hash, {}, movies)
    const changed = new Promise<void>((resolve) => guestSocket.once('room:changed', resolve))
    notifyRoom(roomId)
    await changed
    const guestVote = await request(`/api/rooms/${roomId}/votes`, 'POST', guestCookie, { movieId: movies[0].id, value: 'up' })
    expect(guestVote.response.status).toBe(200)
    const hostView = await request(`/api/rooms/${roomId}`, 'GET', hostCookie)
    expect(hostView.data.room.round.myVotes).toEqual([])
    hostSocket.disconnect()
    const restored = await connect(hostCookie)
    expect(restored.connected).toBe(true)
    const hostVote = await request(`/api/rooms/${roomId}/votes`, 'POST', hostCookie, { movieId: movies[0].id, value: 'up' })
    expect(hostVote.data.room.round.winners).toEqual([movies[0].id])
    const history = await request(`/api/rooms/${roomId}/history`, 'GET', guestCookie)
    expect(history.data.items).toHaveLength(1)
    const revoked = new Promise<void>((resolve) => guestSocket.once('room:revoked', resolve))
    const removed = await request(`/api/rooms/${roomId}/members/${joined.data.room.me.id}`, 'DELETE', hostCookie)
    expect(removed.response.status).toBe(200)
    await revoked
    expect((await request(`/api/rooms/${roomId}`, 'GET', guestCookie)).data.room.me).toBeUndefined()
  })
})
