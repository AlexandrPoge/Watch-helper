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

async function requestRoom(path: string, options?: RequestInit) {
  const response = await fetch(path, { ...options, headers: { 'Content-Type': 'application/json', ...options?.headers } })
  const data = await response.json() as { room?: Room; message?: string }
  if (!response.ok || !data.room) throw new Error(data.message ?? 'Не удалось обновить комнату.')
  return data.room
}
