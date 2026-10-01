import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Wifi, WifiOff } from 'lucide-react'
import { useParams } from 'react-router-dom'
import type { Room, RoundSetup, VoteValue } from '../entities/room/model'
import { cancelRound, closeRoom, getShareInfo, joinRoom, removeMember, startRound, voteForMovie } from '../features/rooms/api/roomApi'
import { useLiveRoom } from '../features/rooms/useLiveRoom'
import { getDisplayName, saveDisplayName } from '../features/rooms/roomIdentity'
import { RoomInvite } from '../features/rooms/components/RoomInvite'
import { RoomRoundControls } from '../features/rooms/components/RoomRoundControls'
import { RoomHistory } from '../features/rooms/components/RoomHistory'
import { RoomResult } from '../features/rooms/components/RoomResult'
import { RoomMembers } from '../features/rooms/components/RoomMembers'
import { RoomJoin } from '../features/rooms/components/RoomJoin'
import { PairVotingPanel } from '../features/voting/components/PairVotingPanel'
import { VotingPanel } from '../features/voting/components/VotingPanel'
import { AppHeader } from './components/AppHeader'

export function RoomPage() {
  const { roomId = '' } = useParams()
  const client = useQueryClient()
  const live = useLiveRoom(roomId)
  const share = useQuery({ queryKey: ['network-share'], queryFn: getShareInfo, staleTime: 60_000 })
  const [name, setName] = useState(getDisplayName)
  const save = (room: Room) => client.setQueryData(['room', roomId], room)
  const join = useMutation({ mutationFn: () => joinRoom(roomId, name), onSuccess: (room) => { saveDisplayName(name); save(room) } })
  const start = useMutation({ mutationFn: (setup: RoundSetup) => startRound(roomId, setup), onSuccess: save })
  const cancel = useMutation({ mutationFn: () => cancelRound(roomId), onSuccess: save })
  const close = useMutation({ mutationFn: () => closeRoom(roomId), onSuccess: save })
  const kick = useMutation({ mutationFn: (id: string) => removeMember(roomId, id), onSuccess: save })
  const vote = useMutation({ mutationFn: ({ movieId, value }: { movieId: string; value: VoteValue }) => voteForMovie(roomId, movieId, value), onSuccess: save })
  const room = live.data
  const inviteUrl = `${share.data?.urls[0] ?? window.location.origin}/rooms/${roomId}`
  const error = [join, start, cancel, close, kick, vote].find((item) => item.isError)?.error
  return <main className="min-h-screen text-white">
    <AppHeader />
    <div className="mx-auto max-w-5xl px-4 py-8 pb-28 sm:px-6 xl:px-8">
      {live.isLoading && <p className="text-slate-400">Загружаем кинокомнату…</p>}
      {live.isError && <p className="text-rose-300">Комната недоступна. Проверь соединение и обнови страницу.</p>}
      {room && <>
        <header className="mb-7">
          <p className="text-xs font-black uppercase tracking-[.18em] text-violet-300">{room.mode === 'couple' ? 'Вечер для двоих' : 'Комната для компании'}</p>
          <h1 className="mt-2 break-words text-3xl font-black sm:text-5xl">{room.title}</h1>
          <p className="mt-3 flex items-center gap-2 text-sm text-slate-400">
            {room.status === 'open' && (live.status === 'online' ? <Wifi size={16} className="text-emerald-300" /> : <WifiOff size={16} className="text-amber-300" />)}
            {room.status === 'closed' ? 'Комната закрыта' : !room.me ? 'Присоединяйся' : live.status === 'online' ? 'На связи' : live.status === 'reconnecting' ? 'Восстанавливаем связь…' : 'Подключаемся…'}
            {' · '}{room.members.length} участников
          </p>
        </header>
        <div className={`grid gap-4 ${room.status === 'open' ? 'lg:grid-cols-[1.1fr_.9fr]' : ''}`}>
          <RoomMembers room={room} onlineIds={live.onlineIds} onRemove={(id) => kick.mutate(id)} />
          {room.status === 'open' && <RoomInvite inviteUrl={inviteUrl} roomCode={room.id} scope={share.data?.scope} />}
        </div>
        {!room.me && room.status === 'open' && <RoomJoin name={name} busy={join.isPending} onNameChange={setName} onJoin={() => join.mutate()} />}
        {error && <p role="alert" className="mt-4 rounded-xl border border-rose-300/20 bg-rose-300/10 p-3 text-sm text-rose-200">{message(error.message)}</p>}
        {room.me && room.status === 'open' && <>
          <RoomRoundControls room={room} busy={start.isPending || cancel.isPending || close.isPending} onStart={(setup) => start.mutate(setup)} onCancel={() => cancel.mutate()} onClose={() => close.mutate()} />
          {room.round?.status === 'active' && (room.mode === 'couple'
            ? <PairVotingPanel round={room.round} memberCount={room.members.length} busy={vote.isPending} onVote={(movieId, value) => vote.mutate({ movieId, value })} />
            : <VotingPanel round={room.round} busy={vote.isPending} onVote={(movieId, value) => vote.mutate({ movieId, value })} />)}
        </>}
        {room.me && room.status === 'closed' && <section className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6">
          <h2 className="text-xl font-black">Комната закрыта</h2>
          <p className="mt-2 text-sm text-slate-400">История выбора остаётся доступной участникам.</p>
          {room.round?.status === 'completed' && <div className="mt-5"><RoomResult round={room.round} /></div>}
        </section>}
        {room.me && <RoomHistory history={room.history} />}
      </>}
    </div>
  </main>
}

function message(code: string) {
  const labels: Record<string, string> = { ROOM_IS_FULL: 'В комнате больше нет мест.', NAME_TAKEN: 'Это имя уже занято.', NO_CANDIDATES: 'Подходящих фильмов сейчас нет. Измени фильтры и попробуй ещё раз.', ROUND_ACTIVE: 'Сначала заверши текущий раунд.', ROOM_WAITING_PARTNER: 'Сначала пригласи партнёра.', MEMBER_REMOVED: 'Тебя удалили из комнаты.' }
  return labels[code] ?? 'Не удалось выполнить действие. Попробуй ещё раз.'
}
