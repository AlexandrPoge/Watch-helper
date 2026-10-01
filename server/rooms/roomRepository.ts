import { randomBytes, randomUUID } from 'node:crypto'
import { pool, transaction } from '../db/pool'
import { RoomError } from './roomErrors'
import type { RoomMode } from './types'

export async function createRoom(input: { title: string; mode: RoomMode; hostName: string }, guest: string) {
  return transaction(async (client) => {
    await client.query('INSERT INTO guest_sessions(token_hash) VALUES($1) ON CONFLICT DO NOTHING', [guest])
    for (let attempt = 0; attempt < 3; attempt++) {
      const id = randomBytes(5).toString('hex').toUpperCase()
      const exists = await client.query('SELECT 1 FROM rooms WHERE id=$1', [id])
      if (exists.rowCount) continue
      await client.query('INSERT INTO rooms(id,title,mode) VALUES($1,$2,$3)', [id, input.title, input.mode])
      await client.query('INSERT INTO room_members(id,room_id,session_hash,name,is_host) VALUES($1,$2,$3,$4,true)', [randomUUID(), id, guest, input.hostName])
      return id
    }
    throw new RoomError('ROOM_ID_FAILED', 500)
  })
}

export async function joinRoom(roomId: string, name: string, guest: string) {
  return transaction(async (client) => {
    const room = await client.query('SELECT mode,status FROM rooms WHERE id=$1 FOR UPDATE', [roomId])
    if (!room.rows[0]) throw new RoomError('ROOM_NOT_FOUND', 404)
    if (room.rows[0].status !== 'open') throw new RoomError('ROOM_CLOSED', 409)
    const existing = await client.query('SELECT removed_at FROM room_members WHERE room_id=$1 AND session_hash=$2', [roomId, guest])
    if (existing.rows[0]) {
      if (existing.rows[0].removed_at) throw new RoomError('MEMBER_REMOVED', 403)
      return
    }
    const count = await client.query('SELECT count(*)::int AS total FROM room_members WHERE room_id=$1 AND removed_at IS NULL', [roomId])
    if (count.rows[0].total >= (room.rows[0].mode === 'couple' ? 2 : 8)) throw new RoomError('ROOM_IS_FULL', 409)
    const duplicate = await client.query('SELECT 1 FROM room_members WHERE room_id=$1 AND lower(name)=lower($2) AND removed_at IS NULL', [roomId, name])
    if (duplicate.rowCount) throw new RoomError('NAME_TAKEN', 409)
    await client.query('INSERT INTO guest_sessions(token_hash) VALUES($1) ON CONFLICT DO NOTHING', [guest])
    await client.query('INSERT INTO room_members(id,room_id,session_hash,name) VALUES($1,$2,$3,$4)', [randomUUID(), roomId, guest, name])
  })
}

export async function getMembership(roomId: string, guest?: string) {
  if (!guest) return undefined
  const result = await pool.query('SELECT id,is_host FROM room_members WHERE room_id=$1 AND session_hash=$2 AND removed_at IS NULL', [roomId, guest])
  return result.rows[0] as { id: string; is_host: boolean } | undefined
}

export async function requireHost(roomId: string, guest?: string) {
  const member = await getMembership(roomId, guest)
  if (!member?.is_host) throw new RoomError('HOST_REQUIRED', 403)
  return member
}

export async function removeMember(roomId: string, memberId: string, guest?: string) {
  await transaction(async (client) => {
    const room = await client.query('SELECT status FROM rooms WHERE id=$1 FOR UPDATE', [roomId])
    if (room.rows[0]?.status !== 'open') throw new RoomError('ROOM_CLOSED', 409)
    const host = await client.query('SELECT 1 FROM room_members WHERE room_id=$1 AND session_hash=$2 AND is_host=true AND removed_at IS NULL', [roomId, guest])
    if (!host.rowCount) throw new RoomError('HOST_REQUIRED', 403)
    const active = await client.query("SELECT 1 FROM room_rounds WHERE room_id=$1 AND status='active'", [roomId])
    if (active.rowCount) throw new RoomError('ROUND_ACTIVE', 409)
    const result = await client.query('UPDATE room_members SET removed_at=now() WHERE room_id=$1 AND id=$2 AND is_host=false AND removed_at IS NULL RETURNING id', [roomId, memberId])
    if (!result.rowCount) throw new RoomError('MEMBER_NOT_FOUND', 404)
  })
}

export async function closeRoom(roomId: string, guest?: string) {
  await transaction(async (client) => {
    await client.query('SELECT 1 FROM rooms WHERE id=$1 FOR UPDATE', [roomId])
    const host = await client.query('SELECT 1 FROM room_members WHERE room_id=$1 AND session_hash=$2 AND is_host=true AND removed_at IS NULL', [roomId, guest])
    if (!host.rowCount) throw new RoomError('HOST_REQUIRED', 403)
    await client.query("UPDATE room_rounds SET status='cancelled',completed_at=now() WHERE room_id=$1 AND status='active'", [roomId])
    await client.query("UPDATE rooms SET status='closed',closed_at=now() WHERE id=$1", [roomId])
  })
}
