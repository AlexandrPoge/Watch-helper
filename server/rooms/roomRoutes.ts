import { Router, type Request, type Response } from 'express'
import { createGuest, readGuest } from './guestSession'
import { roomError, RoomError } from './roomErrors'
import { closeRoom, createRoom, getMembership, joinRoom, recentRooms, removeMember, requireHost } from './roomRepository'
import { cancelRound, startRound, vote } from './roundRepository'
import { getRoomView } from './roomView'
import { evictMember, notifyRoom } from './socketHub'
import { isCandidateId, resolveMovieCandidate, resolveRoundCandidates } from './roundCandidates'
import { addProposal, proposedMovies, removeProposal } from './proposalRepository'
import { drawTieBreak } from './tieBreakRepository'
import type { RoomMode, RoundSetup, VoteValue } from './types'

export const roomRouter = Router()
const uuidPattern = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i
type RoomParams = { roomId: string; memberId: string; movieId: string; roundId: string }
type Handler = (request: Request<RoomParams>, response: Response) => Promise<void>
const handle = (fn: Handler) => (request: Request, response: Response) => {
  void fn(request as Request<RoomParams>, response).catch((error: unknown) => {
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

roomRouter.use('/api/rooms', (_, response, next) => {
  response.set('Cache-Control', 'private, no-store')
  next()
})
roomRouter.get('/api/rooms', handle(async (request, response) => {
  response.json({ items: await recentRooms(readGuest(request)) })
}))
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
  const selection: unknown = request.body?.candidateIds
  const { blind, ...mood } = parseSetup(request.body)
  const setup = selection === undefined ? { ...mood, blind } : { blind }
  const guest = readGuest(request)
  await requireHost(request.params.roomId, guest)
  const proposed = selection === undefined ? [] : await proposedMovies(request.params.roomId)
  const candidates = await resolveRoundCandidates(setup, selection, proposed)
  await startRound(request.params.roomId, guest, setup, candidates)
  notifyRoom(request.params.roomId)
  response.json({ room: await view(request.params.roomId, guest) })
}))

roomRouter.post('/api/rooms/:roomId/votes', handle(async (request, response) => {
  const { movieId, value, roundId } = request.body ?? {}
  if (typeof movieId !== 'string' || !['up', 'skip'].includes(value)) throw new RoomError('INVALID_VOTE')
  if (roundId !== undefined && (typeof roundId !== 'string' || !uuidPattern.test(roundId))) throw new RoomError('INVALID_VOTE')
  await vote(request.params.roomId, readGuest(request), movieId, value as VoteValue, roundId)
  notifyRoom(request.params.roomId)
  response.json({ room: await view(request.params.roomId, readGuest(request)) })
}))

roomRouter.post('/api/rooms/:roomId/rounds/:roundId/tie-break', handle(async (request, response) => {
  const { roomId, roundId } = request.params
  if (!uuidPattern.test(roundId)) throw new RoomError('INVALID_ROUND')
  const guest = readGuest(request)
  await drawTieBreak(roomId, roundId, guest)
  notifyRoom(roomId)
  response.json({ room: await view(roomId, guest) })
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

roomRouter.post('/api/rooms/:roomId/proposals', handle(async (request, response) => {
  const { roomId } = request.params
  const guest = readGuest(request)
  const movieId: unknown = request.body?.movieId
  if (!isCandidateId(movieId)) throw new RoomError('INVALID_MOVIE_SELECTION')
  if (!await getMembership(roomId, guest)) throw new RoomError('MEMBER_REQUIRED', 403)
  await addProposal(roomId, guest, await resolveMovieCandidate(movieId))
  notifyRoom(roomId)
  response.json({ room: await view(roomId, guest) })
}))

roomRouter.delete('/api/rooms/:roomId/proposals/:movieId', handle(async (request, response) => {
  const { roomId, movieId } = request.params
  const guest = readGuest(request)
  if (!isCandidateId(movieId)) throw new RoomError('INVALID_MOVIE_SELECTION')
  await removeProposal(roomId, guest, movieId)
  notifyRoom(roomId)
  response.json({ room: await view(roomId, guest) })
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
