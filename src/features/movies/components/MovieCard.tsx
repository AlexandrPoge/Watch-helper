import { Bookmark, Check, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Movie } from '../../../entities/movie/model'
import { mediaUrl } from '../../../shared/lib/mediaUrl'

type MovieCardProps = { movie: Movie; saved?: boolean; onSave: (movie: Movie) => void }

export function MovieCard({ movie, saved, onSave }: MovieCardProps) {
  const path = `/${movie.kind === 'series' ? 'series' : 'movies'}/${encodeURIComponent(String(movie.id))}`
  return (
    <article className="movie-card group relative min-w-42 overflow-hidden rounded-2xl bg-slate-900 sm:min-w-48">
      <Link to={path} aria-label={`Открыть ${movie.title}`} className="block">
        {movie.posterUrl ? <img alt={movie.title} className="aspect-[2/3] w-full object-cover" src={mediaUrl(movie.posterUrl)} /> : <div className="aspect-[2/3] bg-gradient-to-br from-violet-900 to-slate-950" />}
        <div className={`absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t ${movie.accent ?? 'from-violet-400/70 to-slate-950/70'}`} />
      </Link>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3.5">
        <div className="mb-1.5 flex items-end justify-between gap-2">
          <span className="rounded-full bg-emerald-300 px-2 py-0.5 text-[10px] font-black text-emerald-950">{movie.match}% match</span>
        </div>
        <Link className="pointer-events-auto line-clamp-2 text-sm font-bold leading-tight text-white hover:text-violet-200" to={path}>{movie.title}</Link>
        <p className="mt-1 text-xs text-white/65">{movie.sourceNames?.join(' · ') ?? `${movie.year} · ${movie.duration}`}</p>
      </div>
      <button aria-label={`${saved ? 'Удалить' : 'Сохранить'} ${movie.title}`} className="absolute bottom-11 right-3.5 z-10 grid size-8 place-items-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white hover:text-slate-950" onClick={() => onSave(movie)}>{saved ? <Check size={15} /> : <Plus size={16} />}</button>
      {saved && <Bookmark className="absolute right-3 top-3 fill-violet-300 text-violet-300" size={18} />}
    </article>
  )
}
