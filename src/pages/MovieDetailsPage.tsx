import { ArrowLeft, LoaderCircle } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useMovie } from '../features/movies/useMovie'
import { WatchOptions } from '../features/movies/components/WatchOptions'
import { SeriesCast } from '../features/series/components/SeriesCast'
import { SeriesFacts } from '../features/series/components/SeriesFacts'
import { SeriesHero } from '../features/series/components/SeriesHero'
import { SimilarSeries } from '../features/series/components/SimilarSeries'
import { AppHeader } from './components/AppHeader'
import { RecommendationReason } from '../features/taste/components/RecommendationReason'

export function MovieDetailsPage() {
  const { catalogId } = useParams()
  const movie = useMovie(catalogId)
  if (movie.isLoading) return <main className="grid min-h-screen place-items-center bg-[#090914] text-white"><LoaderCircle className="animate-spin text-violet-300" size={34} /></main>
  if (!movie.data) return <main className="grid min-h-screen place-items-center bg-[#090914] text-white"><Link to="/" className="flex items-center gap-2"><ArrowLeft size={17} />На главную</Link></main>
  const item = movie.data
  return <main className="min-h-screen bg-[#090914] text-white"><AppHeader /><SeriesHero item={item} /><div className="details-stack mx-auto grid max-w-7xl gap-9 px-4 py-9 sm:px-6 sm:py-12 xl:gap-12 xl:px-8"><RecommendationReason movie={item} /><SeriesFacts item={item} /><WatchOptions item={item} /><SeriesCast cast={item.cast} /><SimilarSeries items={item.similar} /></div></main>
}
