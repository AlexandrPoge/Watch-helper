export type RoomMode = 'couple' | 'group'
export type VoteValue = 'up' | 'skip'
export type Mood = { genre?: string; maxRuntime?: number }
export type MovieCandidate = { id: string; title: string; year: number; posterUrl: string; rating?: number; overview?: string }
export type Member = { id: string; name: string; isHost: boolean }
export type Round = {
  id: string
  ordinal: number
  status: 'active' | 'completed' | 'cancelled'
  mood: Mood
  candidates: MovieCandidate[]
  myVotes: { movieId: string; value: VoteValue }[]
  voteCount: number
  totalVotes: number
  winners: string[]
  eligible: boolean
}
export type RoomView = {
  id: string
  title: string
  mode: RoomMode
  status: 'open' | 'closed'
  me?: { id: string; isHost: boolean }
  members: Member[]
  round?: Round
  history: Pick<Round, 'id' | 'ordinal' | 'status' | 'winners' | 'candidates'>[]
}
