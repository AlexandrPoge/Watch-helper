import { randomUUID } from 'node:crypto'
import { transaction } from '../db/pool'
import { RoomError } from './roomErrors'
import { getMembership } from './roomRepository'
import { isRoundDone } from './roundResults'
import type { Mood, MovieCandidate, VoteValue } from './types'

export async function startRound(roomId: string, guest: string | undefined, mood: Mood, movies: MovieCandidate[]) {
  if (!movies.length) throw new RoomError('NO_CANDIDATES', 502)
  return transaction(async (client) => {
    const roomResult = await client.query('SELECT mode,status FROM rooms WHERE id=$1 FOR UPDATE', [roomId])
    const room = roomResult.rows[0] as { mode: 'couple' | 'group'; status: string } | undefined
    if (!room) throw new RoomError('ROOM_NOT_FOUND', 404)
    if (room.status !== 'open') throw new RoomError('ROOM_CLOSED', 409)
    const host = await client.query('SELECT id FROM room_members WHERE room_id=$1 AND session_hash=$2 AND is_host=true AND removed_at IS NULL', [roomId, guest])
    if (!host.rowCount) throw new RoomError('HOST_REQUIRED', 403)
    const active = await client.query("SELECT 1 FROM room_rounds WHERE room_id=$1 AND status='active'", [roomId])
    if (active.rowCount) throw new RoomError('ROUND_ACTIVE', 409)
    const participants = await client.query('SELECT id FROM room_members WHERE room_id=$1 AND removed_at IS NULL', [roomId])
    if (room.mode === 'couple' && participants.rowCount !== 2) throw new RoomError('ROOM_WAITING_PARTNER', 409)
    const next = await client.query('SELECT coalesce(max(ordinal),0)+1 AS ordinal FROM room_rounds WHERE room_id=$1', [roomId])
    const roundId = randomUUID()
    await client.query("INSERT INTO room_rounds(id,room_id,ordinal,status,genre,max_runtime) VALUES($1,$2,$3,'active',$4,$5)", [roundId, roomId, next.rows[0].ordinal, mood.genre ?? null, mood.maxRuntime ?? null])
    for (const member of participants.rows) await client.query('INSERT INTO round_participants(round_id,member_id) VALUES($1,$2)', [roundId, member.id])
    for (const [index, movie] of movies.entries()) await client.query('INSERT INTO round_candidates(round_id,movie_id,position,title,year,poster_url,rating,overview) VALUES($1,$2,$3,$4,$5,$6,$7,$8)', [roundId, movie.id, index, movie.title, movie.year, movie.posterUrl, movie.rating ?? null, movie.overview ?? null])
    return roundId
  })
}

export async function cancelRound(roomId: string, guest?: string) {
  return transaction(async (client) => {
    const room = await client.query('SELECT status FROM rooms WHERE id=$1 FOR UPDATE', [roomId])
    if (room.rows[0]?.status !== 'open') throw new RoomError('ROOM_CLOSED', 409)
    const host = await client.query('SELECT 1 FROM room_members WHERE room_id=$1 AND session_hash=$2 AND is_host=true AND removed_at IS NULL', [roomId, guest])
    if (!host.rowCount) throw new RoomError('HOST_REQUIRED', 403)
    const result = await client.query("UPDATE room_rounds SET status='cancelled',completed_at=now() WHERE room_id=$1 AND status='active' RETURNING id", [roomId])
    if (!result.rowCount) throw new RoomError('NO_ACTIVE_ROUND', 409)
  })
}

export async function vote(roomId: string, guest: string | undefined, movieId: string, value: VoteValue) {
  const member = await getMembership(roomId, guest)
  if (!member) throw new RoomError('MEMBER_REQUIRED', 403)
  return transaction(async (client) => {
    const room = await client.query('SELECT mode,status FROM rooms WHERE id=$1 FOR UPDATE', [roomId])
    if (room.rows[0]?.status !== 'open') throw new RoomError('ROOM_CLOSED', 409)
    const round = await client.query("SELECT id FROM room_rounds WHERE room_id=$1 AND status='active' FOR UPDATE", [roomId])
    const roundId = round.rows[0]?.id as string | undefined
    if (!roundId) throw new RoomError('NO_ACTIVE_ROUND', 409)
    const eligible = await client.query('SELECT 1 FROM round_participants WHERE round_id=$1 AND member_id=$2', [roundId, member.id])
    if (!eligible.rowCount) throw new RoomError('NEXT_ROUND_ONLY', 403)
    const candidate = await client.query('SELECT 1 FROM round_candidates WHERE round_id=$1 AND movie_id=$2', [roundId, movieId])
    if (!candidate.rowCount) throw new RoomError('MOVIE_NOT_FOUND', 404)
    await client.query('INSERT INTO round_votes(round_id,member_id,movie_id,value) VALUES($1,$2,$3,$4) ON CONFLICT(round_id,member_id,movie_id) DO UPDATE SET value=excluded.value,updated_at=now()', [roundId, member.id, movieId, value])
    const ids = (await client.query('SELECT movie_id FROM round_candidates WHERE round_id=$1 ORDER BY position', [roundId])).rows.map((row) => row.movie_id as string)
    const members = (await client.query('SELECT member_id FROM round_participants WHERE round_id=$1', [roundId])).rows.map((row) => row.member_id as string)
    const votes = (await client.query('SELECT member_id,movie_id,value FROM round_votes WHERE round_id=$1', [roundId])).rows
    if (isRoundDone(room.rows[0].mode, ids, members, votes)) await client.query("UPDATE room_rounds SET status='completed',completed_at=now() WHERE id=$1", [roundId])
  })
}
