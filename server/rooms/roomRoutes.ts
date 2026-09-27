import { Router } from 'express'
import { roomStore } from './roomStore'
import type { CreateRoomInput, RoomMode, Vote } from './types'

export const roomRouter = Router()

roomRouter.post('/api/rooms', (request, response) => {
  const input = parseRoomInput(request.body)
  if (!input) return response.status(400).json({ message: 'Invalid room data.' })
  const room = roomStore.create(input)
  return response.status(201).json({ room })
})

roomRouter.get('/api/rooms/:roomId', (request, response) => {
  const room = roomStore.get(request.params.roomId)
  if (!room) return response.status(404).json({ message: 'Room not found.' })
  return response.json({ room })
})

roomRouter.post('/api/rooms/:roomId/members', (request, response) => {
  const name = getName(request.body)
  if (!name) return response.status(400).json({ message: 'A name is required.' })
  try {
    return response.json({ room: roomStore.join(request.params.roomId, name) })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'UNKNOWN_ERROR'
    return response.status(message === 'ROOM_NOT_FOUND' ? 404 : 409).json({ message })
  }
})

roomRouter.post('/api/rooms/:roomId/voting/start', (request, response) => {
  try {
    return response.json({ room: roomStore.startVoting(request.params.roomId) })
  } catch {
    return response.status(404).json({ message: 'Room not found.' })
  }
})

roomRouter.post('/api/rooms/:roomId/votes', (request, response) => {
  const vote = parseVote(request.body)
  if (!vote) return response.status(400).json({ message: 'Invalid vote data.' })
  try {
    return response.json({ room: roomStore.vote(request.params.roomId, vote) })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'UNKNOWN_ERROR'
    return response.status(message === 'ROOM_NOT_FOUND' ? 404 : 400).json({ message })
  }
})

function parseRoomInput(body: unknown): CreateRoomInput | undefined {
  if (!body || typeof body !== 'object') return undefined
  const { title, mode, hostName } = body as Record<string, unknown>
  const normalizedTitle = normalizeText(title, 48)
  const normalizedName = normalizeText(hostName, 24)
  return normalizedTitle && normalizedName && isRoomMode(mode) ? { title: normalizedTitle, mode, hostName: normalizedName } : undefined
}

function getName(body: unknown) {
  return body && typeof body === 'object' ? normalizeText((body as Record<string, unknown>).name, 24) : undefined
}

function normalizeText(value: unknown, maxLength: number) {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim().slice(0, maxLength) : undefined
}

function isRoomMode(value: unknown): value is RoomMode {
  return value === 'couple' || value === 'group'
}

function parseVote(body: unknown): Vote | undefined {
  if (!body || typeof body !== 'object') return undefined
  const { memberId, movieId, value } = body as Record<string, unknown>
  return typeof memberId === 'string' && typeof movieId === 'string' && (value === 'up' || value === 'skip') ? { memberId, movieId, value } : undefined
}
