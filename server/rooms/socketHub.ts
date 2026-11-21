import type { Server as HttpServer } from 'node:http'
import { Server } from 'socket.io'
import { guestFromCookie } from './guestSession'
import { getMembership } from './roomRepository'

let io: Server | undefined

export function startSocketHub(server: HttpServer) {
  io = new Server(server, {
    path: '/socket.io', maxHttpBufferSize: 16_384,
    allowRequest: (request, done) => done(null, Boolean(guestFromCookie(request.headers.cookie)) && (io?.engine.clientsCount ?? 0) < 200),
  })
  io.use((socket, next) => {
    const forwarded = socket.handshake.headers['x-forwarded-for']
    const address = process.env.BEHIND_PROXY === '1' && typeof forwarded === 'string'
      ? forwarded.split(',').at(-1)?.trim() : socket.handshake.address
    const guest = guestFromCookie(socket.handshake.headers.cookie)
    const connections = [...(io?.sockets.sockets.values() ?? [])]
    if (!guest || connections.filter(item => item.data.address === address).length >= 20
      || connections.filter(item => item.data.guest === guest).length >= 5) return next(new Error('Connection limit reached'))
    socket.data.address = address
    socket.data.guest = guest
    next()
  })
  io.on('connection', (socket) => {
    let busy = false
    let nextSubscription = 0
    socket.on('room:subscribe', async (roomId: unknown, acknowledge?: (allowed: boolean) => void) => {
      const reply = typeof acknowledge === 'function' ? acknowledge : undefined
      const guest = guestFromCookie(socket.handshake.headers.cookie)
      if (!guest || typeof roomId !== 'string' || !/^[A-F0-9]{10}$/.test(roomId) || busy || Date.now() < nextSubscription) return reply?.(false)
      busy = true
      nextSubscription = Date.now() + 1000
      try {
        const member = typeof roomId === 'string' ? await getMembership(roomId, guest) : undefined
        if (!member) return reply?.(false)
        const previous = socket.data.roomId as string | undefined
        if (previous && previous !== roomId) await socket.leave(previous)
        await socket.join(roomId)
        socket.data.roomId = roomId
        socket.data.memberId = member.id
        reply?.(true)
        if (previous && previous !== roomId) void publishPresence(previous).catch(console.error)
        void publishPresence(roomId).catch(console.error)
      } catch (error) {
        console.error('Room subscription failed', error)
        reply?.(false)
      } finally {
        busy = false
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
