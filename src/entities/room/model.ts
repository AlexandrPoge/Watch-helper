export type RoomMode = 'couple' | 'group'

export type RoomMember = {
  id: string
  name: string
  isHost: boolean
  joinedAt: string
}

export type Room = {
  id: string
  title: string
  mode: RoomMode
  createdAt: string
  members: RoomMember[]
}

export type CreateRoomInput = {
  title: string
  mode: RoomMode
  hostName: string
}
