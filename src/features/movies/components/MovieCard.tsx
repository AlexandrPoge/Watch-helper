import { Bookmark, Check, Plus } from 'lucide-react'
import type { Movie } from '../../../entities/movie/model'

type MovieCardProps = { movie: Movie; saved?: boolean; onSave: (movieId: number) => void }

export function MovieCard({ movie, saved, onSave }: MovieCardProps) {
  return (
    <article className="movie-card group relative min-w-42 overflow-hidden rounded-2xl bg-slate-900 sm:min-w-48">
      <img alt={movie.title} className="aspect-[2/3] w-full object-cover" src={movie.posterUrl} />
      <div className={`absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t ${movie.accent ?? 'from-violet-400/70 to-slate-950/70'}`} />
      <div className="absolute inset-x-0 bottom-0 p-3.5">
        <div className="mb-1.5 flex items-end justify-between gap-2">
          <span className="rounded-full bg-emerald-300 px-2 py-0.5 text-[10px] font-black text-emerald-950">{movie.match}% match</span>
          <button aria-label={`Сохранить ${movie.title}`} className="grid size-8 place-items-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white hover:text-slate-950" onClick={() => onSave(movie.id)}>{saved ? <Check size={15} /> : <Plus size={16} />}</button>
        </div>
        <h3 className="line-clamp-2 text-sm font-bold leading-tight text-white">{movie.title}</h3>
        <p className="mt-1 text-xs text-white/65">{movie.sourceNames?.join(' · ') ?? `${movie.year} · ${movie.duration}`}</p>
      </div>
      {saved && <Bookmark className="absolute right-3 top-3 fill-violet-300 text-violet-300" size={18} />}
    </article>
  )
}
