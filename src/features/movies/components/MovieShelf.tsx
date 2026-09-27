import { ArrowUpRight, Sparkles } from 'lucide-react'
import type { Movie } from '../../../entities/movie/model'
import { MovieCard } from './MovieCard'

type MovieShelfProps = { movies: Movie[]; savedIds: number[]; onSave: (movieId: number) => void }

export function MovieShelf({ movies, savedIds, onSave }: MovieShelfProps) {
  return (
    <section id="recommendations" className="mt-14">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div><p className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-violet-300"><Sparkles size={14} /> Для твоего вечера</p><h2 className="text-2xl font-bold tracking-tight sm:text-3xl">На 100% в твоём вкусе</h2></div>
        <button className="hidden items-center gap-1 text-sm font-semibold text-slate-300 hover:text-white sm:flex">Смотреть всё <ArrowUpRight size={16} /></button>
      </div>
      <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5 pb-3 sm:mx-0 sm:px-0">
        {movies.map((movie) => <MovieCard key={movie.id} movie={movie} saved={savedIds.includes(movie.id)} onSave={onSave} />)}
      </div>
    </section>
  )
}
