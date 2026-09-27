import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { ArrowLeft, ArrowRight, Heart, UsersRound } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { createRoom } from '../features/rooms/api/roomApi'
import type { RoomMode } from '../entities/room/model'
import { AppHeader } from './components/AppHeader'

const modes: { id: RoomMode; title: string; detail: string; icon: typeof Heart }[] = [
  { id: 'couple', title: 'Для двоих', detail: 'Найдём пересечение ваших вкусов.', icon: Heart },
  { id: 'group', title: 'Для компании', detail: 'Голосуйте и выбирайте вместе.', icon: UsersRound },
]

export function CreateRoomPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<RoomMode>('group')
  const [title, setTitle] = useState('Киновечер')
  const [hostName, setHostName] = useState('')
  const create = useMutation({ mutationFn: createRoom, onSuccess: (room) => navigate(`/rooms/${room.id}`) })

  return (
    <main className="min-h-screen bg-[#090914] text-white"><div className="aurora pointer-events-none fixed inset-0 -z-0 opacity-70" /><AppHeader />
      <section className="relative mx-auto max-w-2xl px-5 py-12 sm:py-18"><Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"><ArrowLeft size={16} /> На главную</Link>
        <p className="mt-10 text-xs font-bold uppercase tracking-[0.2em] text-violet-300">Новая кинокомната</p><h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Кого собираем сегодня?</h1><p className="mt-3 text-slate-400">Настроим комнату — а затем отправишь друзьям одну красивую ссылку.</p>
        <form className="mt-9 space-y-6" onSubmit={(event) => { event.preventDefault(); create.mutate({ title, hostName, mode }) }}>
          <div className="grid gap-3 sm:grid-cols-2">{modes.map((item) => <ModeOption key={item.id} {...item} selected={item.id === mode} onSelect={() => setMode(item.id)} />)}</div>
          <label className="block text-sm font-semibold">Название комнаты<input value={title} maxLength={48} onChange={(event) => setTitle(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-white/7 px-4 py-3 text-white outline-none transition focus:border-violet-300" /></label>
          <label className="block text-sm font-semibold">Как тебя представить?<input value={hostName} maxLength={24} onChange={(event) => setHostName(event.target.value)} placeholder="Например, Александр" className="mt-2 w-full rounded-xl border border-white/10 bg-white/7 px-4 py-3 text-white outline-none placeholder:text-slate-600 transition focus:border-violet-300" /></label>
          {create.isError && <p className="text-sm text-rose-300">{create.error.message}</p>}
          <button disabled={!hostName.trim() || create.isPending} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-500 px-5 py-3.5 font-bold transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-50">{create.isPending ? 'Создаём…' : 'Создать комнату'} <ArrowRight size={18} /></button>
        </form>
      </section>
    </main>
  )
}

type ModeOptionProps = (typeof modes)[number] & { selected: boolean; onSelect: () => void }

function ModeOption({ title, detail, icon: Icon, selected, onSelect }: ModeOptionProps) {
  return <button type="button" onClick={onSelect} className={`rounded-2xl border p-4 text-left transition ${selected ? 'border-violet-300 bg-violet-400/15' : 'border-white/10 bg-white/5 hover:bg-white/8'}`}><Icon size={20} className="text-violet-300" /><h2 className="mt-4 font-bold">{title}</h2><p className="mt-1 text-sm text-slate-400">{detail}</p></button>
}
