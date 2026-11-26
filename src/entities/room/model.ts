export type RoomMode = 'couple' | 'group'
export type VoteValue = 'up' | 'skip'
export type Mood = { genre?: string; maxRuntime?: number }
export type RoundSetup = Mood & { blind?: boolean; candidateIds?: string[] }
export type RoomMovie = { id: string; title: string; year: number; posterUrl: string; rating?: number; overview?: string }
export type RoomProposal = { movie: RoomMovie; memberId: string; memberName: string }
export type RoomMember = { id: string; name: string; isHost: boolean }
export type RoomRound = {
  id: string
  ordinal: number
  status: 'active' | 'completed' | 'cancelled'
  blind: boolean
  mood: Mood
  candidates: RoomMovie[]
  myVotes: { movieId: string; value: VoteValue }[]
  voteCount: number
  totalVotes: number
  winners: string[]
  tieBreakWinnerId?: string
  eligible: boolean
}
export type Room = {
  id: string
  title: string
  mode: RoomMode
  status: 'open' | 'closed'
  me?: { id: string; isHost: boolean }
  members: RoomMember[]
  proposals?: RoomProposal[]
  round?: RoomRound
  tieBreakAvailable?: boolean
  history: Pick<RoomRound, 'id' | 'ordinal' | 'status' | 'blind' | 'winners' | 'candidates' | 'tieBreakWinnerId'>[]
}
export type CreateRoomInput = { title: string; mode: RoomMode; hostName: string }

export function getRoundResultMovies(round: Pick<RoomRound, 'candidates' | 'winners' | 'tieBreakWinnerId'>) {
  const ids = round.tieBreakWinnerId ? [round.tieBreakWinnerId] : round.winners
  return round.candidates.filter(movie => ids.includes(movie.id))
}
