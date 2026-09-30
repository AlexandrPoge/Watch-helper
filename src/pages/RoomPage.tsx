import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Crown, UserPlus, UsersRound } from 'lucide-react'
import { useParams, useSearchParams } from 'react-router-dom'
import { getRoom, getShareInfo, joinRoom, startVoting, voteForMovie } from '../features/rooms/api/roomApi'
import { VotingPanel } from '../features/voting/components/VotingPanel'
import { PairVotingPanel } from '../features/voting/components/PairVotingPanel'
import { AppHeader } from './components/AppHeader'
import { RoomInvite } from '../features/rooms/components/RoomInvite'
import { getDisplayName, getRoomMember, saveRoomMember } from '../features/rooms/roomIdentity'

export function RoomPage() {
  const { roomId = '' } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const [name, setName] = useState(getDisplayName)
  const queryMemberId = searchParams.get('member') ?? undefined
  const memberId = queryMemberId ?? getRoomMember(roomId)
  const roomQuery = useQuery({ queryKey: ['room', roomId], queryFn: () => getRoom(roomId), refetchInterval: 2_500 })
  const shareQuery = useQuery({ queryKey: ['network-share'], queryFn: getShareInfo, staleTime: 60_000 })
  const join = useMutation({ mutationFn: () => joinRoom(roomId, name), onSuccess: (room) => { const member = room.members.find((item) => item.name.toLocaleLowerCase() === name.toLocaleLowerCase()); queryClient.setQueryData(['room', roomId], room); if (member) saveRoomMember(roomId, member.id, member.name) } })
  const voting = useMutation({ mutationFn: () => startVoting(roomId), onSuccess: (room) => queryClient.setQueryData(['room', roomId], room) })
  const vote = useMutation({ mutationFn: ({ movieId, value }: { movieId: string; value: 'up' | 'skip' }) => voteForMovie(roomId, memberId ?? '', movieId, value), onSuccess: (room) => queryClient.setQueryData(['room', roomId], room) })
  const inviteUrl = `${shareQuery.data?.urls[0] ?? window.location.origin}/rooms/${roomId}`
  useEffect(() => {
    if (!queryMemberId) return
    saveRoomMember(roomId, queryMemberId)
    setSearchParams({}, { replace: true })
  }, [queryMemberId, roomId, setSearchParams])

  if (roomQuery.isLoading) return <RoomShell><p className="text-slate-400">Загружаем кинокомнату…</p></RoomShell>
  if (roomQuery.isError || !roomQuery.data) return <RoomShell><p className="text-rose-300">Комната не найдена или уже закрыта.</p></RoomShell>
  const room = roomQuery.data
  return (
    <RoomShell><section className="mx-auto max-w-4xl py-12 sm:py-18"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-fuchsia-300"><UsersRound size={14} /> {room.mode === 'couple' ? 'Вечер для двоих' : 'Комната для компании'}</p><h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">{room.title}</h1><p className="mt-3 text-slate-400">Соберите вкусы всех участников — и начнём умный выбор.</p>
      <div className="mt-9 grid gap-5 lg:grid-cols-[1.1fr_.9fr]"><section className="rounded-3xl border border-white/10 bg-white/5 p-6"><h2 className="text-lg font-bold">Участники · {room.members.length}/{room.mode === 'couple' ? 2 : 8}</h2><div className="mt-5 grid gap-3 sm:grid-cols-2">{room.members.map((member) => <MemberCard key={member.id} name={member.name} isHost={member.isHost} />)}</div></section>
        <RoomInvite inviteUrl={inviteUrl} roomCode={room.id} scope={shareQuery.data?.scope} /></div>
      {!memberId && room.members.length < (room.mode === 'couple' ? 2 : 8) && <section className="mt-5 rounded-3xl border border-white/10 bg-slate-900/70 p-6"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-white/8"><UserPlus size={19} /></span><div><h2 className="font-bold">Войти в комнату</h2><p className="text-sm text-slate-400">Выбери имя — оно будет видно другим участникам.</p></div></div><div className="mt-5 flex flex-col gap-3 sm:flex-row"><input value={name} maxLength={24} onChange={(event) => setName(event.target.value)} placeholder="Твоё имя" className="flex-1 rounded-xl border border-white/10 bg-white/6 px-4 py-3 outline-none placeholder:text-slate-600 focus:border-violet-300" /><button disabled={!name.trim() || join.isPending} onClick={() => join.mutate()} className="rounded-xl bg-violet-500 px-5 py-3 font-bold hover:bg-violet-400 disabled:opacity-50">Присоединиться</button></div>{join.isError && <p className="mt-3 text-sm text-rose-300">{join.error.message === 'ROOM_IS_FULL' ? 'В комнате больше нет мест.' : join.error.message}</p>}</section>}
      {room.mode === 'couple' ? <PairVotingPanel room={room} memberId={memberId} isStarting={voting.isPending} isVoting={vote.isPending} onStart={() => voting.mutate()} onVote={(movieId, value) => vote.mutate({ movieId, value })} /> : <VotingPanel room={room} memberId={memberId} isStarting={voting.isPending} isVoting={vote.isPending} onStart={() => voting.mutate()} onVote={(movieId, value) => vote.mutate({ movieId, value })} />}
    </section></RoomShell>
  )
}

function RoomShell({ children }: { children: React.ReactNode }) {
  return <main className="min-h-screen bg-[#090914] px-5 text-white"><div className="aurora pointer-events-none fixed inset-0 -z-0 opacity-70" /><AppHeader /><div className="relative z-10 mx-auto max-w-7xl">{children}</div></main>
}

function MemberCard({ name, isHost }: { name: string; isHost: boolean }) {
  return <div className="flex items-center gap-3 rounded-2xl bg-slate-950/55 p-3"><span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-violet-400 to-fuchsia-500 text-sm font-black">{name.slice(0, 1).toUpperCase()}</span><div className="min-w-0"><p className="truncate font-bold">{name}</p><p className="flex items-center gap-1 text-xs text-slate-400">{isHost && <Crown size={12} className="text-amber-300" />}{isHost ? 'Создатель' : 'Выбирает фильмы'}</p></div></div>
}
