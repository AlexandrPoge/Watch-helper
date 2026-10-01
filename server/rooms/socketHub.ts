import type { Server as HttpServer } from 'node:http'
import { Server } from 'socket.io'
import { guestFromCookie } from './guestSession'
import { getMembership } from './roomRepository'

let io: Server | undefined

export function startSocketHub(server: HttpServer) {
  io = new Server(server, { path: '/socket.io' })
  io.on('connection', (socket) => {
    socket.on('room:subscribe', async (roomId: unknown, acknowledge?: (allowed: boolean) => void) => {
      try {
        const guest = guestFromCookie(socket.handshake.headers.cookie)
        const member = typeof roomId === 'string' ? await getMembership(roomId, guest) : undefined
        if (!member || typeof roomId !== 'string') return acknowledge?.(false)
        const previous = socket.data.roomId as string | undefined
        if (previous && previous !== roomId) await socket.leave(previous)
        await socket.join(roomId)
        socket.data.roomId = roomId
        socket.data.memberId = member.id
        acknowledge?.(true)
        if (previous && previous !== roomId) void publishPresence(previous).catch(console.error)
        void publishPresence(roomId).catch(console.error)
      } catch (error) {
        console.error('Room subscription failed', error)
        acknowledge?.(false)
      }
    })
    socket.on('disconnect', () => {
      if (socket.data.roomId) void publishPresence(socket.data.roomId).catch(console.error)
    })
  })
  return io
}

export function notifyRoom(roomId: string) {
  io?.to(roomId).emit('room:changed')
}

export async function evictMember(roomId: string, memberId: string) {
  if (!io) return
  const sockets = await io.in(roomId).fetchSockets()
  for (const socket of sockets.filter((item) => item.data.memberId === memberId)) {
    socket.emit('room:revoked')
    await socket.leave(roomId)
    socket.data.roomId = undefined
    socket.data.memberId = undefined
  }
  await publishPresence(roomId)
}

async function publishPresence(roomId: string) {
  if (!io) return
  const sockets = await io.in(roomId).fetchSockets()
  const members = [...new Set(sockets.map((socket) => socket.data.memberId as string).filter(Boolean))]
  io.to(roomId).emit('room:presence', members)
}
