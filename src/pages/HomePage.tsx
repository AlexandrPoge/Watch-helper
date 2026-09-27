import { useMemo, useState } from 'react'
import { movies } from '../entities/movie/mockMovies'
import { MovieCard } from '../features/movies/components/MovieCard'
import { MovieShelf } from '../features/movies/components/MovieShelf'
import { PeopleResults } from '../features/people/components/PeopleResults'
import { usePeopleSearch } from '../features/people/usePeople'
import type { Person } from '../entities/person/model'
import { RoomCard } from '../features/rooms/components/RoomCard'
import { useCatalogSearch } from '../features/search/model/useCatalogSearch'
import { AppHeader } from './components/AppHeader'
import { DiscoveryHero } from './components/DiscoveryHero'
import { TasteStats } from './components/TasteStats'

export function HomePage() {
  const [query, setQuery] = useState('')
  const [savedIds, setSavedIds] = useState<(string | number)[]>([])
  const fallbackResults = useMemo(() => {
    const normalizedQuery = query.toLowerCase()
    return movies.filter((movie) => movie.title.toLowerCase().includes(normalizedQuery))
  }, [query])
  const catalogSearch = useCatalogSearch(query)
  const peopleSearch = usePeopleSearch(query)

  const toggleSaved = (movieId: string | number) => {
    setSavedIds((items) => items.includes(movieId) ? items.filter((id) => id !== movieId) : [...items, movieId])
  }

  return (
    <main id="top" className="min-h-screen overflow-hidden bg-[#090914] text-white">
      <div className="aurora pointer-events-none fixed inset-0 -z-0 opacity-70" />
      <AppHeader />
      <div className="relative z-10 mx-auto max-w-7xl px-5 pb-16 lg:px-8">
        <DiscoveryHero query={query} onQueryChange={setQuery} />
        {query ? <SearchResults results={catalogSearch.data ?? fallbackResults} people={peopleSearch.data ?? []} isLoading={catalogSearch.isLoading || peopleSearch.isLoading} hasError={catalogSearch.isError} savedIds={savedIds} onSave={toggleSaved} /> : <MovieShelf movies={movies} savedIds={savedIds} onSave={toggleSaved} />}
        <RoomCard />
        <TasteStats savedCount={savedIds.length} />
      </div>
    </main>
  )
}

type SearchResultsProps = {
  results: typeof movies
  people: Person[]
  isLoading: boolean
  hasError: boolean
  savedIds: (string | number)[]
  onSave: (movieId: string | number) => void
}

function SearchResults({ results, people, isLoading, hasError, savedIds, onSave }: SearchResultsProps) {
  return (
    <section className="mt-1">
      <PeopleResults people={people} />
      <p className="mb-4 text-sm text-slate-400">{isLoading ? 'Ищем в каталогах…' : hasError ? 'Показываем локальные результаты' : 'Результаты из подключённых каталогов'}</p>
      <div className="no-scrollbar flex gap-3 overflow-x-auto pb-3">
        {results.length ? results.map((movie) => <MovieCard key={movie.id} movie={movie} saved={savedIds.includes(movie.id)} onSave={onSave} />) : <p className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-400">Пока ничего не нашли. Попробуй другое название.</p>}
      </div>
    </section>
  )
}
