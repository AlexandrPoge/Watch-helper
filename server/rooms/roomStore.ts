import { randomBytes, randomUUID } from 'node:crypto'
import type { CreateRoomInput, Room, RoomMember, RoomMovie, Vote } from './types'

const rooms = new Map<string, Room>()

export const roomStore = {
  create(input: CreateRoomInput) {
    const now = new Date().toISOString()
    const room: Room = {
      id: createRoomId(),
      title: input.title,
      mode: input.mode,
      createdAt: now,
      members: [{ id: randomUUID(), name: input.hostName, isHost: true, joinedAt: now }],
      candidates: [],
      votes: [],
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
  startVoting(roomId: string, candidates: RoomMovie[] = roomCandidates) {
    const room = rooms.get(roomId)
    if (!room) throw new Error('ROOM_NOT_FOUND')
    if (room.mode === 'couple' && room.members.length < 2) throw new Error('ROOM_WAITING_PARTNER')
    if (room.candidates.length === 0) room.candidates = candidates.length ? candidates : roomCandidates
    return room
  },
  vote(roomId: string, vote: Vote) {
    const room = rooms.get(roomId)
    if (!room) throw new Error('ROOM_NOT_FOUND')
    if (!room.members.some((member) => member.id === vote.memberId)) throw new Error('MEMBER_NOT_FOUND')
    if (!room.candidates.some((movie) => movie.id === vote.movieId)) throw new Error('MOVIE_NOT_FOUND')
    room.votes = [...room.votes.filter((item) => item.memberId !== vote.memberId || item.movieId !== vote.movieId), vote]
    room.winnerId = pickWinner(room)
    if (room.winnerId) room.completedAt = new Date().toISOString()
    return room
  },
}

function createRoomId() {
  let id = ''
  do id = randomBytes(5).toString('hex').slice(0, 8).toUpperCase()
  while (rooms.has(id))
  return id
}

function getMemberLimit(mode: Room['mode']) {
  return mode === 'couple' ? 2 : 8
}

function pickWinner(room: Room) {
  if (room.mode === 'couple') {
    return room.candidates.find((movie) => room.members.every((member) => room.votes.some((vote) => vote.memberId === member.id && vote.movieId === movie.id && vote.value === 'up')))?.id
  }
  const scores = new Map(room.candidates.map((movie) => [movie.id, 0]))
  room.votes.filter((vote) => vote.value === 'up').forEach((vote) => scores.set(vote.movieId, (scores.get(vote.movieId) ?? 0) + 1))
  const leader = [...scores.entries()].sort((first, second) => second[1] - first[1])[0]
  return leader && leader[1] > 0 ? leader[0] : undefined
}

const roomCandidates: RoomMovie[] = [
  { id: 'tmdb:movie:693134', title: 'Дюна: Часть вторая', year: 2024, posterUrl: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg' },
  { id: 'tmdb:movie:792307', title: 'Бедные-несчастные', year: 2023, posterUrl: 'https://image.tmdb.org/t/p/w500/kCGlIMHnOm8JPXq3rXM6c5wMxcT.jpg' },
  { id: 'tmdb:movie:496243', title: 'Паразиты', year: 2019, posterUrl: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg' },
]
