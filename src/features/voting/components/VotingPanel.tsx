import { Check, Heart, X } from 'lucide-react'
import type { RoomRound, VoteValue } from '../../../entities/room/model'
import { mediaUrl } from '../../../shared/lib/mediaUrl'
import { BlindPoster } from './BlindPoster'

type Props = { round: RoomRound; busy: boolean; onVote: (movieId: string, value: VoteValue) => void }

export function VotingPanel({ round, busy, onVote }: Props) {
  if (!round.eligible) return <p className="mt-5 rounded-2xl bg-violet-400/10 p-5 text-sm text-violet-200">Этот раунд уже начался. Ты сможешь участвовать в следующем.</p>
  const votes = new Map(round.myVotes.map((item) => [item.movieId, item.value]))
  const progress = round.totalVotes ? Math.round(100 * round.voteCount / round.totalVotes) : 0
  return <section className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6">
    <div className="flex justify-between gap-2 text-xs text-slate-400"><span>Общий прогресс</span><span>{round.voteCount} из {round.totalVotes}</span></div>
    <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/8"><div className="h-full rounded-full bg-violet-400 transition-[width]" style={{ width: `${progress}%` }} /></div>
    <p className="mt-3 text-xs text-slate-500">{round.blind ? 'Названия и постеры откроются после завершения раунда.' : 'Чужие голоса откроются после завершения выбора.'}</p>
    <div className="no-scrollbar mt-5 flex gap-3 overflow-x-auto pb-2">{round.candidates.map((movie, index) => <article key={movie.id} className="relative w-40 shrink-0 overflow-hidden rounded-2xl bg-slate-950 sm:w-48">
      {round.blind ? <BlindPoster number={index + 1} compact /> : <img alt={movie.title} loading="lazy" className="aspect-[2/3] w-full object-cover opacity-80" src={mediaUrl(movie.posterUrl)} />}
      <div className={round.blind ? 'p-3' : 'absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent p-3'}>
        <p className="line-clamp-2 text-sm font-bold">{movie.title}</p>
        <p className="mt-1 line-clamp-3 text-xs text-slate-300">{round.blind ? movie.overview : movie.year}</p>
        <div className="mt-3 flex gap-2"><VoteButton active={votes.get(movie.id) === 'up'} disabled={busy} label="Нравится" onClick={() => onVote(movie.id, 'up')}><Heart size={15} /></VoteButton><VoteButton active={votes.get(movie.id) === 'skip'} disabled={busy} label="Пропустить" onClick={() => onVote(movie.id, 'skip')}><X size={15} /></VoteButton></div>
      </div>
    </article>)}</div>
  </section>
}

function VoteButton({ active, disabled, label, onClick, children }: { active: boolean; disabled: boolean; label: string; onClick: () => void; children: React.ReactNode }) {
  return <button aria-label={label} aria-pressed={active} disabled={disabled} onClick={onClick} className={`grid size-8 place-items-center rounded-lg disabled:opacity-40 ${active ? 'bg-violet-400 text-slate-950' : 'bg-white/10 hover:bg-white/20'}`}>{active ? <Check size={15} /> : children}</button>
}
