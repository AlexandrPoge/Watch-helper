import { Dices, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Movie } from '../../../entities/movie/model'
import { MovieCard } from './MovieCard'

type MovieShelfProps = { movies: Movie[]; savedIds: (string | number)[]; onSave: (movie: Movie) => void; personalized?: boolean }

export function MovieShelf({ movies, savedIds, onSave, personalized }: MovieShelfProps) {
  return (
    <section id="recommendations" className="mt-14">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div><p className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-violet-300"><Sparkles size={14} /> {personalized ? 'Подстроено под твой вкус' : 'Для твоего вечера'}</p><h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{personalized ? 'Сначала то, что ближе тебе' : 'На 100% в твоём вкусе'}</h2></div>
        <Link to="/random" className="hidden items-center gap-1 text-sm font-semibold text-slate-300 hover:text-white sm:flex">Выбрать случайно <Dices size={16} /></Link>
      </div>
      <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5 pb-3 sm:mx-0 sm:px-0">
        {movies.map((movie) => <MovieCard key={movie.id} movie={movie} saved={savedIds.includes(movie.id)} onSave={onSave} />)}
      </div>
    </section>
  )
}
