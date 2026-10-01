import type { CreateRoomInput, Mood, Room, VoteValue } from '../../../entities/room/model'

export const createRoom = (input: CreateRoomInput) => requestRoom('/api/rooms', { method: 'POST', body: JSON.stringify(input) })
export const getRoom = (id: string) => requestRoom(`/api/rooms/${id}`)
export const joinRoom = (id: string, name: string) => requestRoom(`/api/rooms/${id}/join`, { method: 'POST', body: JSON.stringify({ name }) })
export const startRound = (id: string, mood: Mood) => requestRoom(`/api/rooms/${id}/rounds`, { method: 'POST', body: JSON.stringify(mood) })
export const cancelRound = (id: string) => requestRoom(`/api/rooms/${id}/rounds/current`, { method: 'DELETE' })
export const closeRoom = (id: string) => requestRoom(`/api/rooms/${id}/close`, { method: 'POST' })
export const removeMember = (id: string, memberId: string) => requestRoom(`/api/rooms/${id}/members/${memberId}`, { method: 'DELETE' })
export const voteForMovie = (id: string, movieId: string, value: VoteValue) => requestRoom(`/api/rooms/${id}/votes`, { method: 'POST', body: JSON.stringify({ movieId, value }) })

export async function getShareInfo() {
  const response = await fetch('/api/network/share')
  if (!response.ok) throw new Error('Не удалось определить адрес для приглашения.')
  return response.json() as Promise<{ urls: string[]; scope: 'public' | 'local-network' }>
}

async function requestRoom(path: string, options?: RequestInit): Promise<Room> {
  const response = await fetch(path, { ...options, credentials: 'same-origin', headers: { 'Content-Type': 'application/json', ...options?.headers } })
  const data = await response.json() as { room?: Room; message?: string }
  if (!response.ok || !data.room) throw new Error(data.message ?? 'Не удалось обновить комнату.')
  return data.room
}
