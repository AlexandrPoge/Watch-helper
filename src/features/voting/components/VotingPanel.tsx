import { Check, Heart, Play, X } from 'lucide-react'
import type { Room } from '../../../entities/room/model'

type VotingPanelProps = {
  room: Room
  memberId?: string
  isStarting: boolean
  isVoting: boolean
  onStart: () => void
  onVote: (movieId: string, value: 'up' | 'skip') => void
}

export function VotingPanel({ room, memberId, isStarting, isVoting, onStart, onVote }: VotingPanelProps) {
  if (room.candidates.length === 0) return <StartVoting isStarting={isStarting} onStart={onStart} />
  const myVotes = new Map(room.votes.filter((vote) => vote.memberId === memberId).map((vote) => [vote.movieId, vote.value]))
  const winner = room.candidates.find((movie) => movie.id === room.winnerId)
  return (
    <section className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-300">Совместный выбор</p><h2 className="mt-1 text-xl font-bold">Оцени варианты</h2></div>{winner && <span className="rounded-full bg-emerald-300 px-3 py-1 text-xs font-black text-emerald-950">Лидер: {winner.title}</span>}</div>
      {!memberId && <p className="mt-4 rounded-xl bg-amber-300/10 p-3 text-sm text-amber-100">Войди в комнату, чтобы голосовать.</p>}
      <div className="no-scrollbar mt-5 flex gap-3 overflow-x-auto pb-2">{room.candidates.map((movie) => <article key={movie.id} className="relative min-w-42 overflow-hidden rounded-2xl bg-slate-950 sm:min-w-48"><img alt={movie.title} className="aspect-[2/3] w-full object-cover opacity-80" src={movie.posterUrl} /><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent p-3"><p className="text-sm font-bold">{movie.title}</p><p className="text-xs text-slate-400">{movie.year}</p><div className="mt-3 flex gap-2"><VoteButton active={myVotes.get(movie.id) === 'up'} disabled={!memberId || isVoting} icon={<Heart size={15} />} label="Нравится" onClick={() => onVote(movie.id, 'up')} /><VoteButton active={myVotes.get(movie.id) === 'skip'} disabled={!memberId || isVoting} icon={<X size={15} />} label="Пропустить" onClick={() => onVote(movie.id, 'skip')} /></div></div></article>)}</div>
    </section>
  )
}

function StartVoting({ isStarting, onStart }: { isStarting: boolean; onStart: () => void }) {
  return <section className="mt-5 rounded-3xl border border-dashed border-violet-300/30 bg-violet-400/8 p-6 text-center"><Play className="mx-auto text-violet-300" size={24} /><h2 className="mt-3 text-xl font-bold">Готовы искать общий фильм?</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">Запустим подборку — каждый оценит варианты, а лидер определится автоматически.</p><button onClick={onStart} disabled={isStarting} className="mt-5 rounded-xl bg-violet-500 px-5 py-3 text-sm font-bold hover:bg-violet-400 disabled:opacity-50">{isStarting ? 'Подбираем…' : 'Начать выбор'}</button></section>
}

function VoteButton({ active, disabled, icon, label, onClick }: { active: boolean; disabled: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return <button aria-label={label} disabled={disabled} onClick={onClick} className={`grid size-8 place-items-center rounded-lg transition disabled:opacity-40 ${active ? 'bg-violet-400 text-slate-950' : 'bg-white/10 text-white hover:bg-white/20'}`}>{active && label === 'Нравится' ? <Check size={15} /> : icon}</button>
}
