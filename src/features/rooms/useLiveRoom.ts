import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { io } from 'socket.io-client'
import { getRoom } from './api/roomApi'

export function useLiveRoom(roomId: string) {
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: ['room', roomId], queryFn: () => getRoom(roomId), enabled: Boolean(roomId) })
  const [status, setStatus] = useState<'connecting' | 'online' | 'reconnecting' | 'offline'>('connecting')
  const [onlineIds, setOnlineIds] = useState<string[]>([])
  const memberId = query.data?.me?.id
  const shouldConnect = Boolean(memberId && query.data?.status === 'open')
  useEffect(() => {
    if (!shouldConnect) return
    setStatus('connecting')
    const socket = io({ path: '/socket.io', autoConnect: false, transports: ['websocket', 'polling'] })
    const subscribe = () => {
      socket.emit('room:subscribe', roomId, (allowed: boolean) => {
        setStatus(allowed ? 'online' : 'offline')
        void queryClient.invalidateQueries({ queryKey: ['room', roomId] })
      })
    }
    socket.on('connect', subscribe)
    socket.on('disconnect', () => { setStatus('reconnecting'); setOnlineIds([]) })
    socket.on('connect_error', () => setStatus('reconnecting'))
    socket.on('room:changed', () => void queryClient.invalidateQueries({ queryKey: ['room', roomId] }))
    socket.on('room:revoked', () => void queryClient.invalidateQueries({ queryKey: ['room', roomId] }))
    socket.on('room:presence', (ids: string[]) => setOnlineIds(ids))
    socket.connect()
    return () => { socket.removeAllListeners(); socket.disconnect() }
  }, [memberId, queryClient, roomId, shouldConnect])
  return { ...query, status: shouldConnect ? status : 'offline', onlineIds: shouldConnect ? onlineIds : [] }
}
