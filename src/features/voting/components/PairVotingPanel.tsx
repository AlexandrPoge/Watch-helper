import { Heart, LoaderCircle, PartyPopper, Star, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Room } from '../../../entities/room/model'
import { mediaUrl } from '../../../shared/lib/mediaUrl'

type Props = { room: Room; memberId?: string; isStarting: boolean; isVoting: boolean; onStart: () => void; onVote: (movieId: string, value: 'up' | 'skip') => void }

export function PairVotingPanel({ room, memberId, isStarting, isVoting, onStart, onVote }: Props) {
  if (room.winnerId) return <Match room={room} />
  if (room.members.length < 2) return <State icon={<Heart />} title="Ждём вторую половинку" text="Скопируй ссылку выше. Как только партнёр войдёт, можно начинать." />
  if (!room.candidates.length) return <State icon={isStarting ? <LoaderCircle className="animate-spin" /> : <Heart />} title="Готовы сверить вкусы?" text="Каждый увидит фильмы по одному. Выбор партнёра останется секретом до совпадения." action="Начать подбор" disabled={isStarting} onClick={onStart} />
  if (!memberId) return <State icon={<Heart />} title="Представься, чтобы выбирать" text="Войди в комнату под своим именем — после этого появятся карточки." />
  const voted = new Set(room.votes.filter((vote) => vote.memberId === memberId).map((vote) => vote.movieId))
  const current = room.candidates.find((movie) => !voted.has(movie.id))
  if (!current) return <State icon={<LoaderCircle className="animate-spin" />} title="Твой выбор сохранён" text="Ждём ответы партнёра. Совпадение появится здесь автоматически." />
  return (
    <section className="mx-auto mt-7 max-w-md"><div className="mb-3 flex items-center justify-between text-xs font-bold text-slate-500"><span>Твой выбор — секрет</span><span>{voted.size + 1} / {room.candidates.length}</span></div><article className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900 shadow-2xl shadow-black/40"><img src={mediaUrl(current.posterUrl)} alt={current.title} className="aspect-[2/3] w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" /><div className="absolute inset-x-0 bottom-0 p-6"><div className="flex items-center gap-2 text-xs text-slate-300">{current.rating && <span className="flex items-center gap-1 text-amber-300"><Star size={13} fill="currentColor" />{current.rating.toFixed(1)}</span>}<span>{current.year}</span></div><h2 className="mt-2 text-3xl font-black">{current.title}</h2><p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-300">{current.overview}</p><Link to={`/movies/${encodeURIComponent(current.id)}`} target="_blank" className="mt-3 inline-block text-xs font-bold text-violet-300 hover:text-violet-200">Подробнее о фильме</Link><div className="mt-6 flex justify-center gap-5"><Choice label="Пропустить" disabled={isVoting} onClick={() => onVote(current.id, 'skip')}><X /></Choice><Choice label="Нравится" like disabled={isVoting} onClick={() => onVote(current.id, 'up')}><Heart fill="currentColor" /></Choice></div></div></article></section>
  )
}

function Match({ room }: { room: Room }) {
  const movie = room.candidates.find((item) => item.id === room.winnerId)!
  return <section className="mt-7 overflow-hidden rounded-[2rem] border border-emerald-300/25 bg-emerald-300/8 p-6 text-center sm:p-9"><PartyPopper className="mx-auto text-emerald-300" size={36} /><p className="mt-3 text-xs font-black uppercase tracking-[.2em] text-emerald-300">Это мэтч</p><h2 className="mt-2 text-3xl font-black">Вы оба выбрали «{movie.title}»</h2><img src={mediaUrl(movie.posterUrl)} alt={movie.title} className="mx-auto mt-6 w-44 rounded-2xl shadow-2xl" /><Link to={`/movies/${encodeURIComponent(movie.id)}`} className="mt-6 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-black text-slate-950">Открыть фильм</Link></section>
}

function State({ icon, title, text, action, disabled, onClick }: { icon: React.ReactNode; title: string; text: string; action?: string; disabled?: boolean; onClick?: () => void }) {
  return <section className="mt-7 rounded-3xl border border-dashed border-violet-300/25 bg-violet-400/8 p-8 text-center"><span className="mx-auto grid size-12 place-items-center rounded-2xl bg-violet-400/15 text-violet-300">{icon}</span><h2 className="mt-4 text-2xl font-black">{title}</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">{text}</p>{action && <button disabled={disabled} onClick={onClick} className="mt-5 rounded-xl bg-violet-500 px-5 py-3 text-sm font-bold hover:bg-violet-400 disabled:opacity-50">{action}</button>}</section>
}

function Choice({ children, label, like, disabled, onClick }: { children: React.ReactNode; label: string; like?: boolean; disabled: boolean; onClick: () => void }) {
  return <button aria-label={label} title={label} disabled={disabled} onClick={onClick} className={`grid size-14 place-items-center rounded-full border transition hover:scale-105 disabled:opacity-50 ${like ? 'border-rose-300/30 bg-rose-400 text-white shadow-lg shadow-rose-500/30' : 'border-white/15 bg-white/10 text-white hover:bg-white/20'}`}>{children}</button>
}
