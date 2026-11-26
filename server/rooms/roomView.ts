import { transaction } from '../db/pool'
import { getWinners } from './roundResults'
import { presentRound } from './blindRound'
import { listProposals } from './proposalRepository'
import type { MovieCandidate, RoomView, Round, VoteValue } from './types'

type DbRound = { id: string; ordinal: number; status: Round['status']; genre: string | null; max_runtime: number | null; blind: boolean; drawn_movie_id: string | null }
type DbVote = { round_id: string; member_id: string; movie_id: string; value: VoteValue }

export async function getRoomView(roomId: string, guest?: string): Promise<RoomView | undefined> {
  return transaction(async (client) => {
    await client.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY')
    const room = (await client.query('SELECT id,title,mode,status FROM rooms WHERE id=$1', [roomId])).rows[0]
    if (!room) return undefined
    const members = (await client.query('SELECT id,name,is_host,session_hash FROM room_members WHERE room_id=$1 AND removed_at IS NULL ORDER BY joined_at', [roomId])).rows
    const me = members.find((item) => item.session_hash === guest)
    const view: RoomView = {
      id: room.id, title: room.title, mode: room.mode, status: room.status,
      me: me ? { id: me.id, isHost: me.is_host } : undefined,
      members: members.map((item) => ({ id: item.id, name: item.name, isHost: item.is_host })),
      history: [],
    }
    if (!me) return view
    const { rows: rounds } = await client.query<DbRound>(`
      SELECT r.id,r.ordinal,r.status,r.genre,r.max_runtime,r.blind,t.movie_id AS drawn_movie_id
      FROM room_rounds r LEFT JOIN round_tie_breaks t ON t.round_id=r.id
      WHERE r.room_id=$1 ORDER BY r.ordinal DESC LIMIT 20
    `, [roomId])
    if (room.status === 'open' && !rounds.some(round => round.status === 'active')) {
      view.proposals = await listProposals(client, roomId)
    }
    if (!rounds.length) return view
    const roundIds = rounds.map((item) => item.id)
    const candidates = (await client.query('SELECT round_id,movie_id,vote_id,position,title,year,poster_url,rating,overview FROM round_candidates WHERE round_id=ANY($1) ORDER BY position', [roundIds])).rows
    const votes = (await client.query('SELECT round_id,member_id,movie_id,value FROM round_votes WHERE round_id=ANY($1)', [roundIds])).rows as DbVote[]
    const participants = (await client.query('SELECT round_id,member_id FROM round_participants WHERE round_id=ANY($1)', [roundIds])).rows
    const details = rounds.map((round) => {
      const movies: MovieCandidate[] = candidates.filter((item) => item.round_id === round.id).map((item) => ({ id: item.movie_id, title: item.title, year: item.year, posterUrl: item.poster_url, rating: item.rating == null ? undefined : Number(item.rating), overview: item.overview ?? undefined }))
      const roundVotes = votes.filter((item) => item.round_id === round.id)
      const memberIds = participants.filter((item) => item.round_id === round.id).map((item) => item.member_id as string)
      const tieBreakWinnerId = round.status === 'completed' ? round.drawn_movie_id ?? undefined : undefined
      const leaders = round.status === 'completed' ? getWinners(room.mode, movies.map(movie => movie.id), memberIds, roundVotes) : []
      const details: Round = {
        id: round.id, ordinal: round.ordinal, status: round.status, blind: round.blind,
        mood: { genre: round.genre ?? undefined, maxRuntime: round.max_runtime ?? undefined },
        candidates: movies,
        myVotes: roundVotes.filter((vote) => vote.member_id === me.id).map((vote) => ({ movieId: vote.movie_id, value: vote.value })),
        voteCount: roundVotes.length, totalVotes: memberIds.length * movies.length,
        winners: leaders, tieBreakWinnerId,
        eligible: memberIds.includes(me.id),
      }
      const voteIds = new Map(candidates.filter((item) => item.round_id === round.id).map((item) => [item.movie_id as string, item.vote_id as string]))
      return presentRound(details, voteIds)
    })
    view.round = details.find((round) => round.status === 'active') ?? details.find((round) => round.status === 'completed')
    const latest = details[0]
    if (room.status === 'open' && room.mode === 'group' && latest.status === 'completed' && latest.winners.length > 1 && !latest.tieBreakWinnerId) {
      view.tieBreakAvailable = true
    }
    view.history = details.filter((round) => round.status === 'completed').map(({ id, ordinal, status, blind, winners, candidates, tieBreakWinnerId }) => ({ id, ordinal, status, blind, winners, candidates, tieBreakWinnerId }))
    return view
  })
}
