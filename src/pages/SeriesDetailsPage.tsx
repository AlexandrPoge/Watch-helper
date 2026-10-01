import { useParams } from 'react-router-dom'
import { SeriesCast } from '../features/series/components/SeriesCast'
import { WatchOptions } from '../features/movies/components/WatchOptions'
import { SeriesFacts } from '../features/series/components/SeriesFacts'
import { SeriesHero } from '../features/series/components/SeriesHero'
import { SimilarSeries } from '../features/series/components/SimilarSeries'
import { useSeriesDetails } from '../features/series/useSeries'
import { AppHeader } from './components/AppHeader'
import { RecommendationReason } from '../features/taste/components/RecommendationReason'
import { DetailState } from './components/DetailState'

export function SeriesDetailsPage() {
  const { catalogId } = useParams()
  const details = useSeriesDetails(catalogId)
  if (!details.data) return <DetailState loading={details.isLoading} title="Не удалось открыть сериал" backTo="/series" onRetry={() => void details.refetch()} />
  const item = details.data
  return (
    <main className="min-h-screen bg-[#090914] text-white"><AppHeader /><SeriesHero item={item} /><div className="details-stack mx-auto grid max-w-7xl gap-9 px-4 py-9 sm:px-6 sm:py-12 xl:gap-12 xl:px-8"><RecommendationReason movie={item} /><SeriesFacts item={item} /><WatchOptions item={item} /><SeriesCast cast={item.cast} /><SimilarSeries items={item.similar} /></div></main>
  )
}
