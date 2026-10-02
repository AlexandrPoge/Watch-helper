import { ArrowRight, Dices, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Movie } from '../../../entities/movie/model'
import { MovieCard } from './MovieCard'

type MovieShelfProps = { movies: Movie[]; savedIds: (string | number)[]; onSave: (movie: Movie) => void; personalized?: boolean }

export function MovieShelf({ movies, savedIds, onSave, personalized }: MovieShelfProps) {
  return (
    <section id="recommendations" className="mt-14">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div><p className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-violet-300"><Sparkles size={14} /> {personalized ? 'Подстроено под твой вкус' : 'Идеи для вечера'}</p><h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{personalized ? 'Сначала то, что ближе тебе' : 'Короткая подборка для начала'}</h2></div>
        <Link to="/movies" className="hidden shrink-0 items-center gap-1 text-sm font-bold text-violet-200 hover:text-white sm:flex">Все фильмы <ArrowRight size={16} /></Link>
      </div>
      <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0">
        {movies.map((movie) => <MovieCard key={movie.id} movie={movie} saved={savedIds.includes(movie.id)} onSave={onSave} />)}
      </div>
      <div className="mt-3 flex flex-wrap gap-2 sm:hidden"><Link to="/movies" className="inline-flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-bold">Все фильмы <ArrowRight size={15} /></Link><Link to="/random" className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-bold">Случайно <Dices size={15} /></Link></div>
    </section>
  )
}
