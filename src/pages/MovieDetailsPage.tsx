import { useParams } from 'react-router-dom'
import { useMovie } from '../features/movies/useMovie'
import { WatchOptions } from '../features/movies/components/WatchOptions'
import { SeriesCast } from '../features/series/components/SeriesCast'
import { SeriesFacts } from '../features/series/components/SeriesFacts'
import { SeriesHero } from '../features/series/components/SeriesHero'
import { SimilarSeries } from '../features/series/components/SimilarSeries'
import { AppHeader } from './components/AppHeader'
import { RecommendationReason } from '../features/taste/components/RecommendationReason'
import { DetailState } from './components/DetailState'

export function MovieDetailsPage() {
  const { catalogId } = useParams()
  const movie = useMovie(catalogId)
  if (!movie.data) return <DetailState loading={movie.isLoading} title="Не удалось открыть фильм" backTo="/" onRetry={() => void movie.refetch()} />
  const item = movie.data
  return <main className="min-h-screen bg-[#090914] text-white"><AppHeader /><SeriesHero item={item} /><div className="details-stack mx-auto grid max-w-7xl gap-9 px-4 py-9 sm:px-6 sm:py-12 xl:gap-12 xl:px-8"><RecommendationReason movie={item} /><SeriesFacts item={item} /><WatchOptions item={item} /><SeriesCast cast={item.cast} /><SimilarSeries items={item.similar} /></div></main>
}
