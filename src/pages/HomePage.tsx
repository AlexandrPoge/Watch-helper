import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { movies } from '../entities/movie/mockMovies'
import { MovieShelf } from '../features/movies/components/MovieShelf'
import { defaultCatalogFilters } from '../features/catalog/model'
import { useBrowseCatalog } from '../features/catalog/useBrowseCatalog'
import { usePeopleSearch } from '../features/people/usePeople'
import { RoomCard } from '../features/rooms/components/RoomCard'
import { useCatalogSearch } from '../features/search/model/useCatalogSearch'
import { useWatchlist } from '../features/library/useWatchlist'
import { SearchResults } from '../features/search/components/SearchResults'
import { useDebouncedValue } from '../shared/lib/useDebouncedValue'
import { useTasteProfile } from '../features/taste/useTasteProfile'
import { recommendMovies } from '../features/taste/recommendMovies'
import { AppHeader } from './components/AppHeader'
import { DiscoveryHero } from './components/DiscoveryHero'
import { TasteStats } from './components/TasteStats'

export function HomePage() {
  const [searchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') ?? ''
  const [query, setQuery] = useState(initialQuery)
  useEffect(() => setQuery(initialQuery), [initialQuery])
  const searchTerm = query.trim()
  const debouncedQuery = useDebouncedValue(searchTerm)
  const watchlist = useWatchlist()
  const taste = useTasteProfile()
  const personalized = taste.genres.length > 0 || taste.reactions.length > 0
  const discovery = useBrowseCatalog('movie', defaultCatalogFilters, personalized && !searchTerm)
  const recommendations = useMemo(() => {
    const candidates = discovery.data?.pages[0]?.items
    return recommendMovies(personalized && candidates?.length ? candidates : movies, taste.genres, taste.reactions).slice(0, 6)
  }, [discovery.data, personalized, taste.genres, taste.reactions])
  const fallbackResults = useMemo(() => {
    const normalizedQuery = debouncedQuery.toLowerCase()
    return movies.filter((movie) => movie.title.toLowerCase().includes(normalizedQuery))
  }, [debouncedQuery])
  const catalogSearch = useCatalogSearch(debouncedQuery)
  const peopleSearch = usePeopleSearch(debouncedQuery)
  const waitingForSearch = searchTerm !== debouncedQuery
  const searchResults = searchTerm.length === 1
    ? <p className="mt-4 text-sm text-slate-400">Введи хотя бы два символа.</p>
    : <SearchResults results={waitingForSearch ? [] : catalogSearch.data ?? fallbackResults}
      people={waitingForSearch ? [] : peopleSearch.data ?? []}
      isLoading={waitingForSearch || catalogSearch.isLoading || peopleSearch.isLoading} hasError={catalogSearch.isError}
      savedIds={watchlist.ids} onSave={watchlist.toggle} />

  return (
    <main id="top" className="min-h-screen overflow-hidden bg-[#090914] text-white">
      <div className="aurora pointer-events-none fixed inset-0 -z-0 opacity-70" />
      <AppHeader />
      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-20 sm:px-6 xl:px-8 xl:pb-16">
        <DiscoveryHero query={query} onQueryChange={setQuery} results={searchTerm ? searchResults : undefined} />
        {!searchTerm && <MovieShelf movies={recommendations} savedIds={watchlist.ids} onSave={watchlist.toggle} personalized={personalized} />}
        <RoomCard />
        <TasteStats savedCount={watchlist.items.length} />
      </div>
    </main>
  )
}
