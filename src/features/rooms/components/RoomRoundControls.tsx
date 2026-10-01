import { useState } from 'react'
import type { Mood, Room } from '../../../entities/room/model'
import { RoomResult } from './RoomResult'

const genres = [['', 'Любой жанр'], ['comedy', 'Комедия'], ['drama', 'Драма'], ['thriller', 'Триллер'], ['sciFi', 'Фантастика'], ['romance', 'Романтика'], ['horror', 'Ужасы']]
const runtimes = [['', 'Любая длительность'], ['90', 'До 1,5 ч'], ['120', 'До 2 ч'], ['150', 'До 2,5 ч']]
type Props = { room: Room; busy: boolean; onStart: (mood: Mood) => void; onCancel: () => void; onClose: () => void }

export function RoomRoundControls({ room, busy, onStart, onCancel, onClose }: Props) {
  const [genre, setGenre] = useState('')
  const [maxRuntime, setMaxRuntime] = useState('')
  const active = room.round?.status === 'active'
  return <section className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6">
    {room.round?.status === 'completed' && <RoomResult round={room.round} />}
    {!active && <><h2 className="text-xl font-black">Настроение вечера</h2><p className="mt-1 text-sm text-slate-400">Выбери историю и время — фильмы в раунде подстроятся под вас.</p><div className="mt-4 grid gap-3 sm:grid-cols-2"><Select title="Жанр" value={genre} options={genres} onChange={setGenre} /><Select title="Длительность" value={maxRuntime} options={runtimes} onChange={setMaxRuntime} /></div>{room.me?.isHost ? <><button disabled={busy || (room.mode === 'couple' && room.members.length < 2)} onClick={() => onStart({ genre: genre || undefined, maxRuntime: maxRuntime ? Number(maxRuntime) : undefined })} className="mt-5 rounded-xl bg-violet-500 px-5 py-3 text-sm font-black hover:bg-violet-400 disabled:opacity-50">{busy ? 'Подбираем…' : room.round ? 'Новый раунд' : 'Начать выбор'}</button>{room.mode === 'couple' && room.members.length < 2 && <p className="mt-2 text-sm text-amber-200">Ожидаем участника — отправь партнёру ссылку выше.</p>}</> : <p className="mt-4 text-sm text-violet-200">Ждём, пока ведущий начнёт раунд.</p>}</>}
    {active && <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-black">Раунд {room.round?.ordinal}</h2><p className="mt-1 text-sm text-slate-400">Все участники видят одинаковые фильмы.</p></div>{room.me?.isHost && <button disabled={busy} onClick={onCancel} className="rounded-xl border border-white/15 px-4 py-2 text-sm font-bold hover:bg-white/8">Отменить раунд</button>}</div>}
    {room.me?.isHost && <button disabled={busy} onClick={onClose} className="mt-5 text-xs font-semibold text-slate-500 hover:text-rose-300">Закрыть комнату</button>}
  </section>
}

function Select({ title, value, options, onChange }: { title: string; value: string; options: string[][]; onChange: (value: string) => void }) {
  return <label className="min-w-0 text-xs font-bold text-slate-400">{title}<select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#171725] px-3 py-3 text-sm text-white outline-none">{options.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>
}
