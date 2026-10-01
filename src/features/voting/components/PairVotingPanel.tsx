import { Heart, Star, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { RoomRound, VoteValue } from '../../../entities/room/model'
import { mediaUrl } from '../../../shared/lib/mediaUrl'
import { BlindPoster } from './BlindPoster'

type Props = { round: RoomRound; memberCount: number; busy: boolean; onVote: (movieId: string, value: VoteValue) => void }

export function PairVotingPanel({ round, memberCount, busy, onVote }: Props) {
  if (memberCount < 2) return <State text="Ждём партнёра. Отправь ему ссылку на комнату." />
  if (!round.eligible) return <State text="Раунд уже начался. Ты сможешь участвовать в следующем." />
  const voted = new Set(round.myVotes.map((vote) => vote.movieId))
  const index = round.candidates.findIndex((movie) => !voted.has(movie.id))
  const current = round.candidates[index]
  if (!current) return <State text="Твой выбор сохранён. Ждём ответы партнёра — его голосование останется секретом." />
  return <section className="mx-auto mt-6 max-w-md">
    <div className="mb-3 flex justify-between text-xs font-bold text-slate-400">
      <span>{round.blind ? 'Слепой сеанс · разгадка после раунда' : 'Твой выбор — секрет'}</span>
      <span>{voted.size + 1} / {round.candidates.length}</span>
    </div>
    <article className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900">
      {round.blind ? <BlindPoster number={index + 1} /> : <img src={mediaUrl(current.posterUrl)} alt={current.title} className="aspect-[2/3] w-full object-cover" />}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
        {!round.blind && <p className="flex items-center gap-2 text-xs text-slate-300">{current.rating && <span className="flex items-center gap-1 text-amber-300"><Star size={13} fill="currentColor" />{current.rating.toFixed(1)}</span>}{current.year}</p>}
        <h2 className="mt-2 text-2xl font-black sm:text-3xl">{current.title}</h2>
        <p className="mt-2 line-clamp-3 text-sm text-slate-300">{current.overview}</p>
        {!round.blind && <Link to={`/movies/${encodeURIComponent(current.id)}`} target="_blank" className="mt-2 inline-block text-xs font-bold text-violet-300">Подробнее о фильме</Link>}
        <div className="mt-5 flex justify-center gap-5">
          <Choice label="Пропустить" disabled={busy} onClick={() => onVote(current.id, 'skip')}><X /></Choice>
          <Choice label="Нравится" disabled={busy} like onClick={() => onVote(current.id, 'up')}><Heart fill="currentColor" /></Choice>
        </div>
      </div>
    </article>
  </section>
}

function State({ text }: { text: string }) {
  return <p className="mt-5 rounded-2xl border border-violet-300/20 bg-violet-400/8 p-5 text-center text-sm text-slate-300">{text}</p>
}

function Choice({ children, label, like, disabled, onClick }: { children: React.ReactNode; label: string; like?: boolean; disabled: boolean; onClick: () => void }) {
  return <button aria-label={label} disabled={disabled} onClick={onClick} className={`grid size-14 place-items-center rounded-full border transition disabled:opacity-50 ${like ? 'border-rose-300/30 bg-rose-400 shadow-lg shadow-rose-500/20' : 'border-white/15 bg-white/10 hover:bg-white/20'}`}>{children}</button>
}
