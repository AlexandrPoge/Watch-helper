import { randomUUID } from 'node:crypto'
import type { CreateRoomInput, Room, RoomMember } from './types'

const rooms = new Map<string, Room>()

export const roomStore = {
  create(input: CreateRoomInput) {
    const now = new Date().toISOString()
    const room: Room = {
      id: randomUUID(),
      title: input.title,
      mode: input.mode,
      createdAt: now,
      members: [{ id: randomUUID(), name: input.hostName, isHost: true, joinedAt: now }],
    }
    rooms.set(room.id, room)
    return room
  },
  get(roomId: string) {
    return rooms.get(roomId)
  },
  join(roomId: string, name: string) {
    const room = rooms.get(roomId)
    if (!room) throw new Error('ROOM_NOT_FOUND')
    if (room.members.some((member) => member.name.toLocaleLowerCase() === name.toLocaleLowerCase())) return room
    if (room.members.length >= getMemberLimit(room.mode)) throw new Error('ROOM_IS_FULL')
    const member: RoomMember = { id: randomUUID(), name, isHost: false, joinedAt: new Date().toISOString() }
    room.members.push(member)
    return room
  },
}

function getMemberLimit(mode: Room['mode']) {
  return mode === 'couple' ? 2 : 8
}
