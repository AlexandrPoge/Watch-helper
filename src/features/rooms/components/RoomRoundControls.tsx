import { useEffect, useRef, useState } from 'react'
import type { Room, RoundSetup } from '../../../entities/room/model'
import { scrollToFocus } from '../../../shared/lib/scrollToFocus'
import { RoomResult } from './RoomResult'

const genres = [['', 'Любой жанр'], ['comedy', 'Комедия'], ['drama', 'Драма'], ['thriller', 'Триллер'], ['sciFi', 'Фантастика'], ['romance', 'Романтика'], ['horror', 'Ужасы']]
const runtimes = [['', 'Любая длительность'], ['90', 'До 1,5 ч'], ['120', 'До 2 ч'], ['150', 'До 2,5 ч']]
type Props = { room: Room; busy: boolean; onStart: (setup: RoundSetup) => void; onCancel: () => void; onClose: () => void }

export function RoomRoundControls({ room, busy, onStart, onCancel, onClose }: Props) {
  const section = useRef<HTMLElement>(null)
  const previousRound = useRef({ id: room.round?.id, status: room.round?.status })
  const [genre, setGenre] = useState('')
  const [maxRuntime, setMaxRuntime] = useState('')
  const [blind, setBlind] = useState(false)
  const active = room.round?.status === 'active'
  const isHost = Boolean(room.me?.isHost)
  const waiting = room.mode === 'couple' && room.members.length < 2
  useEffect(() => {
    const before = previousRound.current
    previousRound.current = { id: room.round?.id, status: room.round?.status }
    if (room.round?.status !== 'completed' || before.id !== room.round.id || before.status !== 'active') return
    const frame = requestAnimationFrame(() => scrollToFocus(section.current))
    return () => cancelAnimationFrame(frame)
  }, [room.round?.id, room.round?.status])

  return <section ref={section} className="mt-5 scroll-mt-24 rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6">
    {room.round?.status === 'completed' && <RoomResult round={room.round} />}
    {active ? <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-xl font-black">Раунд {room.round?.ordinal}{room.round?.blind ? ' · Слепой сеанс' : ''}</h2>
        <p className="mt-1 text-sm text-slate-400">{room.round?.blind ? 'Голосуйте по намёкам. Разгадка ждёт в конце.' : 'Все участники видят одинаковые фильмы.'}</p>
      </div>
      {isHost && <button disabled={busy} onClick={onCancel} className="rounded-xl border border-white/15 px-4 py-2 text-sm font-bold hover:bg-white/8">Отменить раунд</button>}
    </div> : <>
      <h2 className="text-xl font-black">Настроение вечера</h2>
      <p className="mt-1 text-sm text-slate-400">Выбери историю и время — фильмы в раунде подстроятся под вас.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Select title="Жанр" value={genre} options={genres} onChange={setGenre} />
        <Select title="Длительность" value={maxRuntime} options={runtimes} onChange={setMaxRuntime} />
      </div>
      <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-2xl border border-violet-300/20 bg-violet-400/8 p-4">
        <input type="checkbox" checked={blind} onChange={(event) => setBlind(event.target.checked)} disabled={!isHost} className="size-5 accent-violet-400" />
        <span><span className="block text-sm font-black text-violet-100">Слепой сеанс ✦</span><span className="mt-1 block text-xs text-slate-400">Только намёки. Названия и постеры откроются после голосования.</span></span>
      </label>
      {isHost ? <>
        <button disabled={busy || waiting} onClick={() => onStart({ genre: genre || undefined, maxRuntime: maxRuntime ? Number(maxRuntime) : undefined, blind })} className="mt-5 rounded-xl bg-violet-500 px-5 py-3 text-sm font-black hover:bg-violet-400 disabled:opacity-50">{busy ? 'Подбираем…' : room.round ? 'Новый раунд' : 'Начать выбор'}</button>
        {waiting && <p className="mt-2 text-sm text-amber-200">Ожидаем участника — отправь партнёру ссылку выше.</p>}
      </> : <p className="mt-4 text-sm text-violet-200">Ждём, пока ведущий начнёт раунд.</p>}
    </>}
    {isHost && <button disabled={busy} onClick={onClose} className="mt-5 text-xs font-semibold text-slate-500 hover:text-rose-300">Закрыть комнату</button>}
  </section>
}

function Select({ title, value, options, onChange }: { title: string; value: string; options: string[][]; onChange: (value: string) => void }) {
  return <label className="min-w-0 text-xs font-bold text-slate-400">{title}<select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#171725] px-3 py-3 text-sm text-white outline-none">{options.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>
}
