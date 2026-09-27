export type RoomMode = 'couple' | 'group'

export type RoomMember = {
  id: string
  name: string
  isHost: boolean
  joinedAt: string
}

export type RoomMovie = {
  id: string
  title: string
  year: number
  posterUrl: string
}

export type Vote = {
  memberId: string
  movieId: string
  value: 'up' | 'skip'
}

export type Room = {
  id: string
  title: string
  mode: RoomMode
  createdAt: string
  members: RoomMember[]
  candidates: RoomMovie[]
  votes: Vote[]
  winnerId?: string
}

export type CreateRoomInput = {
  title: string
  mode: RoomMode
  hostName: string
}
