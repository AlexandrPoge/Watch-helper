import type { PoolClient } from 'pg'
import { pool, transaction } from '../db/pool'
import { RoomError } from './roomErrors'
import type { MovieCandidate, RoomProposal } from './types'
import { maxRoomProposals } from '../../src/entities/room/roundLimits'

export async function listProposals(client: Pick<PoolClient, 'query'>, roomId: string) {
  const result = await client.query<RoomProposal>(
    `SELECT p.movie, m.id AS "memberId", m.name AS "memberName"
     FROM room_proposals p JOIN room_members m ON m.id=p.member_id AND m.room_id=p.room_id
     WHERE p.room_id=$1 AND m.removed_at IS NULL ORDER BY p.proposed_at, p.movie_id`, [roomId],
  )
  return result.rows
}

export async function proposedMovies(roomId: string) {
  return (await listProposals(pool, roomId)).map(item => item.movie)
}

export async function addProposal(roomId: string, guest: string | undefined, movie: MovieCandidate) {
  return transaction(async client => {
    const member = await lockProposalRoom(client, roomId, guest)
    const proposals = await listProposals(client, roomId)
    if (proposals.some(item => item.movie.id === movie.id)) return
    if (proposals.length >= maxRoomProposals) throw new RoomError('PROPOSAL_LIMIT', 409)
    await client.query(
      'INSERT INTO room_proposals(room_id,member_id,movie_id,movie) VALUES($1,$2,$3,$4)',
      [roomId, member.id, movie.id, movie],
    )
  })
}

export async function removeProposal(roomId: string, guest: string | undefined, movieId: string) {
  return transaction(async client => {
    const member = await lockProposalRoom(client, roomId, guest)
    const result = await client.query(
      'DELETE FROM room_proposals WHERE room_id=$1 AND movie_id=$2 AND (member_id=$3 OR $4) RETURNING movie_id',
      [roomId, movieId, member.id, member.is_host],
    )
    if (!result.rowCount) throw new RoomError('PROPOSAL_NOT_FOUND', 404)
  })
}

async function lockProposalRoom(client: PoolClient, roomId: string, guest?: string) {
  const room = await client.query('SELECT status FROM rooms WHERE id=$1 FOR UPDATE', [roomId])
  if (!room.rowCount) throw new RoomError('ROOM_NOT_FOUND', 404)
  if (room.rows[0].status !== 'open') throw new RoomError('ROOM_CLOSED', 409)
  const member = await client.query<{ id: string; is_host: boolean }>(
    'SELECT id,is_host FROM room_members WHERE room_id=$1 AND session_hash=$2 AND removed_at IS NULL', [roomId, guest],
  )
  if (!member.rowCount) throw new RoomError('MEMBER_REQUIRED', 403)
  const round = await client.query("SELECT 1 FROM room_rounds WHERE room_id=$1 AND status='active'", [roomId])
  if (round.rowCount) throw new RoomError('ROUND_ACTIVE', 409)
  return member.rows[0]
}
