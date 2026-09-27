import { useMemo, useState } from 'react'
import { movies } from '../entities/movie/mockMovies'
import { MovieCard } from '../features/movies/components/MovieCard'
import { MovieShelf } from '../features/movies/components/MovieShelf'
import { RoomCard } from '../features/rooms/components/RoomCard'
import { AppHeader } from './components/AppHeader'
import { DiscoveryHero } from './components/DiscoveryHero'
import { TasteStats } from './components/TasteStats'

export function HomePage() {
  const [query, setQuery] = useState('')
  const [savedIds, setSavedIds] = useState<number[]>([])
  const results = useMemo(() => {
    const normalizedQuery = query.toLowerCase()
    return movies.filter((movie) => movie.title.toLowerCase().includes(normalizedQuery))
  }, [query])

  const toggleSaved = (movieId: number) => {
    setSavedIds((items) => items.includes(movieId) ? items.filter((id) => id !== movieId) : [...items, movieId])
  }

  return (
    <main id="top" className="min-h-screen overflow-hidden bg-[#090914] text-white">
      <div className="aurora pointer-events-none fixed inset-0 -z-0 opacity-70" />
      <AppHeader />
      <div className="relative z-10 mx-auto max-w-7xl px-5 pb-16 lg:px-8">
        <DiscoveryHero query={query} onQueryChange={setQuery} />
        {query ? <SearchResults results={results} savedIds={savedIds} onSave={toggleSaved} /> : <MovieShelf movies={movies} savedIds={savedIds} onSave={toggleSaved} />}
        <RoomCard />
        <TasteStats savedCount={savedIds.length} />
      </div>
    </main>
  )
}

type SearchResultsProps = {
  results: typeof movies
  savedIds: number[]
  onSave: (movieId: number) => void
}

function SearchResults({ results, savedIds, onSave }: SearchResultsProps) {
  return (
    <section className="mt-1">
      <p className="mb-4 text-sm text-slate-400">Результаты поиска</p>
      <div className="no-scrollbar flex gap-3 overflow-x-auto pb-3">
        {results.length ? results.map((movie) => <MovieCard key={movie.id} movie={movie} saved={savedIds.includes(movie.id)} onSave={onSave} />) : <p className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-400">Пока ничего не нашли. Попробуй другое название.</p>}
      </div>
    </section>
  )
}
