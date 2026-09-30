import type { CreateRoomInput, Room } from '../../../entities/room/model'

export async function createRoom(input: CreateRoomInput) {
  return requestRoom('/api/rooms', { method: 'POST', body: JSON.stringify(input) })
}

export async function getRoom(roomId: string) {
  return requestRoom(`/api/rooms/${roomId}`)
}

export async function joinRoom(roomId: string, name: string) {
  return requestRoom(`/api/rooms/${roomId}/members`, { method: 'POST', body: JSON.stringify({ name }) })
}

export async function startVoting(roomId: string) {
  return requestRoom(`/api/rooms/${roomId}/voting/start`, { method: 'POST' })
}

export async function voteForMovie(roomId: string, memberId: string, movieId: string, value: 'up' | 'skip') {
  return requestRoom(`/api/rooms/${roomId}/votes`, { method: 'POST', body: JSON.stringify({ memberId, movieId, value }) })
}

export async function getShareInfo() {
  const response = await fetch('/api/network/share')
  if (!response.ok) throw new Error('Не удалось определить адрес для приглашения.')
  return response.json() as Promise<{ urls: string[]; scope: 'public' | 'local-network' }>
}

async function requestRoom(path: string, options?: RequestInit) {
  const response = await fetch(path, { ...options, headers: { 'Content-Type': 'application/json', ...options?.headers } })
  const data = await response.json() as { room?: Room; message?: string }
  if (!response.ok || !data.room) throw new Error(data.message ?? 'Не удалось обновить комнату.')
  return data.room
}
