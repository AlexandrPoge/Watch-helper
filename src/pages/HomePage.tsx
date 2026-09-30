import { useMemo, useState } from 'react'
import { movies } from '../entities/movie/mockMovies'
import { MovieShelf } from '../features/movies/components/MovieShelf'
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
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebouncedValue(query)
  const watchlist = useWatchlist()
  const taste = useTasteProfile()
  const recommendations = useMemo(() => recommendMovies(movies, taste.genres, taste.reactions), [taste.genres, taste.reactions])
  const fallbackResults = useMemo(() => {
    const normalizedQuery = debouncedQuery.toLowerCase()
    return movies.filter((movie) => movie.title.toLowerCase().includes(normalizedQuery))
  }, [debouncedQuery])
  const catalogSearch = useCatalogSearch(debouncedQuery)
  const peopleSearch = usePeopleSearch(debouncedQuery)

  return (
    <main id="top" className="min-h-screen overflow-hidden bg-[#090914] text-white">
      <div className="aurora pointer-events-none fixed inset-0 -z-0 opacity-70" />
      <AppHeader />
      <div className="relative z-10 mx-auto max-w-7xl px-5 pb-16 lg:px-8">
        <DiscoveryHero query={query} onQueryChange={setQuery} />
        {query ? <SearchResults results={catalogSearch.data ?? fallbackResults} people={peopleSearch.data ?? []} isLoading={catalogSearch.isLoading || peopleSearch.isLoading} hasError={catalogSearch.isError} savedIds={watchlist.ids} onSave={watchlist.toggle} /> : <MovieShelf movies={recommendations} savedIds={watchlist.ids} onSave={watchlist.toggle} personalized={taste.genres.length > 0 || taste.reactions.length > 0} />}
        <RoomCard />
        <TasteStats savedCount={watchlist.items.length} />
      </div>
    </main>
  )
}
