export type RoomMode = 'couple' | 'group'
export type VoteValue = 'up' | 'skip'
export type Mood = { genre?: string; maxRuntime?: number }
export type RoomMovie = { id: string; title: string; year: number; posterUrl: string; rating?: number; overview?: string }
export type RoomMember = { id: string; name: string; isHost: boolean }
export type RoomRound = {
  id: string
  ordinal: number
  status: 'active' | 'completed' | 'cancelled'
  mood: Mood
  candidates: RoomMovie[]
  myVotes: { movieId: string; value: VoteValue }[]
  voteCount: number
  totalVotes: number
  winners: string[]
  eligible: boolean
}
export type Room = {
  id: string
  title: string
  mode: RoomMode
  status: 'open' | 'closed'
  me?: { id: string; isHost: boolean }
  members: RoomMember[]
  round?: RoomRound
  history: Pick<RoomRound, 'id' | 'ordinal' | 'status' | 'winners' | 'candidates'>[]
}
export type CreateRoomInput = { title: string; mode: RoomMode; hostName: string }
