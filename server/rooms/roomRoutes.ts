import { Router, type Request, type Response } from 'express'
import { createGuest, readGuest } from './guestSession'
import { roomError, RoomError } from './roomErrors'
import { closeRoom, createRoom, joinRoom, removeMember, requireHost } from './roomRepository'
import { cancelRound, startRound, vote } from './roundRepository'
import { getRoomView } from './roomView'
import { evictMember, notifyRoom } from './socketHub'
import { getVotingMovies } from '../catalog/randomMovieService'
import type { RoomMode, RoundSetup, VoteValue } from './types'

export const roomRouter = Router()
type Handler = (request: Request<{ roomId: string; memberId: string }>, response: Response) => Promise<void>
const handle = (fn: Handler) => (request: Request, response: Response) => {
  void fn(request as Request<{ roomId: string; memberId: string }>, response).catch((error: unknown) => {
    const failure = roomError(error)
    if (failure.status === 500) console.error('Room request failed', error)
    response.status(failure.status).json({ message: failure.message })
  })
}
const view = async (roomId: string, guest?: string) => {
  const room = await getRoomView(roomId, guest)
  if (!room) throw new RoomError('ROOM_NOT_FOUND', 404)
  return room
}

roomRouter.post('/api/rooms', handle(async (request, response) => {
  const title = cleanText(request.body?.title, 48)
  const hostName = cleanText(request.body?.hostName, 24)
  const mode = request.body?.mode as RoomMode
  if (!title || !hostName || !['couple', 'group'].includes(mode)) throw new RoomError('INVALID_ROOM')
  const guest = readGuest(request) ?? createGuest(response)
  const id = await createRoom({ title, hostName, mode }, guest)
  response.status(201).json({ room: await view(id, guest) })
}))

roomRouter.get('/api/rooms/:roomId', handle(async (request, response) => {
  response.json({ room: await view(request.params.roomId, readGuest(request)) })
}))

roomRouter.post('/api/rooms/:roomId/join', handle(async (request, response) => {
  const name = cleanText(request.body?.name, 24)
  if (!name) throw new RoomError('INVALID_NAME')
  const guest = readGuest(request) ?? createGuest(response)
  await joinRoom(request.params.roomId, name, guest)
  notifyRoom(request.params.roomId)
  response.json({ room: await view(request.params.roomId, guest) })
}))

roomRouter.post('/api/rooms/:roomId/rounds', handle(async (request, response) => {
  const setup = parseSetup(request.body)
  await requireHost(request.params.roomId, readGuest(request))
  const movies = await getVotingMovies(12, setup).catch(() => { throw new RoomError('NO_CANDIDATES', 502) })
  const candidates = movies.flatMap((movie) => movie.posterUrl ? [{ id: movie.id, title: movie.title, year: movie.year ?? 0, posterUrl: movie.posterUrl, rating: movie.rating, overview: setup.blind ? `${movie.genres?.slice(0, 2).join(' / ') || 'Кино'} · ${movie.overview ?? ''}` : movie.overview }] : [])
  await startRound(request.params.roomId, readGuest(request), setup, candidates)
  notifyRoom(request.params.roomId)
  response.json({ room: await view(request.params.roomId, readGuest(request)) })
}))

roomRouter.post('/api/rooms/:roomId/votes', handle(async (request, response) => {
  const { movieId, value } = request.body ?? {}
  if (typeof movieId !== 'string' || !['up', 'skip'].includes(value)) throw new RoomError('INVALID_VOTE')
  await vote(request.params.roomId, readGuest(request), movieId, value as VoteValue)
  notifyRoom(request.params.roomId)
  response.json({ room: await view(request.params.roomId, readGuest(request)) })
}))

roomRouter.delete('/api/rooms/:roomId/rounds/current', handle(async (request, response) => {
  await cancelRound(request.params.roomId, readGuest(request))
  notifyRoom(request.params.roomId)
  response.json({ room: await view(request.params.roomId, readGuest(request)) })
}))

roomRouter.delete('/api/rooms/:roomId/members/:memberId', handle(async (request, response) => {
  await removeMember(request.params.roomId, request.params.memberId, readGuest(request))
  await evictMember(request.params.roomId, request.params.memberId).catch(console.error)
  notifyRoom(request.params.roomId)
  response.json({ room: await view(request.params.roomId, readGuest(request)) })
}))

roomRouter.post('/api/rooms/:roomId/close', handle(async (request, response) => {
  await closeRoom(request.params.roomId, readGuest(request))
  notifyRoom(request.params.roomId)
  response.json({ room: await view(request.params.roomId, readGuest(request)) })
}))

roomRouter.get('/api/rooms/:roomId/history', handle(async (request, response) => {
  const room = await view(request.params.roomId, readGuest(request))
  if (!room.me) throw new RoomError('MEMBER_REQUIRED', 403)
  response.json({ items: room.history })
}))

function cleanText(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().slice(0, max) || undefined : undefined
}

function parseSetup(value: unknown): RoundSetup {
  const input = value && typeof value === 'object' ? value as Record<string, unknown> : {}
  const allowed = ['action', 'comedy', 'drama', 'fantasy', 'horror', 'romance', 'sciFi', 'thriller']
  const genre = typeof input.genre === 'string' && allowed.includes(input.genre) ? input.genre : undefined
  const maxRuntime = [90, 120, 150].includes(Number(input.maxRuntime)) ? Number(input.maxRuntime) : undefined
  return { genre, maxRuntime, blind: input.blind === true }
}
