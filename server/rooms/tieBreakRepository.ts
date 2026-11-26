import { randomInt } from 'node:crypto'
import { transaction } from '../db/pool'
import { RoomError } from './roomErrors'
import { getWinners } from './roundResults'
import type { RoomMode, VoteValue } from './types'

export async function drawTieBreak(roomId: string, roundId: string, guest?: string) {
  return transaction(async client => {
    const { rows: [room] } = await client.query<{ mode: RoomMode; status: string; is_host: boolean }>(`
      SELECT r.mode, r.status, EXISTS (
        SELECT 1 FROM room_members m WHERE m.room_id=r.id AND m.session_hash=$2
          AND m.is_host=true AND m.removed_at IS NULL
      ) AS is_host FROM rooms r WHERE r.id=$1 FOR UPDATE OF r
    `, [roomId, guest])
    if (!room?.is_host) throw new RoomError('HOST_REQUIRED', 403)
    if (room.status !== 'open') throw new RoomError('ROOM_CLOSED', 409)

    const { rows: [round] } = await client.query<{ id: string; status: string; drawn_movie_id: string | null }>(`
      SELECT r.id, r.status, t.movie_id AS drawn_movie_id
      FROM room_rounds r LEFT JOIN round_tie_breaks t ON t.round_id=r.id
      WHERE r.room_id=$1 ORDER BY r.ordinal DESC LIMIT 1
    `, [roomId])
    if (round?.id !== roundId || round.status !== 'completed') throw new RoomError('ROUND_CHANGED', 409)
    if (round.drawn_movie_id) return round.drawn_movie_id
    if (room.mode !== 'group') throw new RoomError('TIE_BREAK_UNAVAILABLE', 409)

    const candidates = await client.query<{ movie_id: string }>('SELECT movie_id FROM round_candidates WHERE round_id=$1 ORDER BY position', [roundId])
    const participants = await client.query<{ member_id: string }>('SELECT member_id FROM round_participants WHERE round_id=$1', [roundId])
    const votes = await client.query<{ member_id: string; movie_id: string; value: VoteValue }>(
      'SELECT member_id,movie_id,value FROM round_votes WHERE round_id=$1', [roundId],
    )
    const leaders = getWinners(room.mode, candidates.rows.map(item => item.movie_id), participants.rows.map(item => item.member_id), votes.rows)
    if (leaders.length < 2) throw new RoomError('TIE_BREAK_UNAVAILABLE', 409)
    const winner = leaders[randomInt(leaders.length)]
    await client.query('INSERT INTO round_tie_breaks(round_id,movie_id) VALUES($1,$2)', [roundId, winner])
    return winner
  })
}
