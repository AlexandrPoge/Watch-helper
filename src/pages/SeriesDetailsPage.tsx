import { ArrowLeft, LoaderCircle } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { SeriesCast } from '../features/series/components/SeriesCast'
import { WatchOptions } from '../features/movies/components/WatchOptions'
import { SeriesFacts } from '../features/series/components/SeriesFacts'
import { SeriesHero } from '../features/series/components/SeriesHero'
import { SimilarSeries } from '../features/series/components/SimilarSeries'
import { useSeriesDetails } from '../features/series/useSeries'
import { AppHeader } from './components/AppHeader'
import { RecommendationReason } from '../features/taste/components/RecommendationReason'

export function SeriesDetailsPage() {
  const { catalogId } = useParams()
  const details = useSeriesDetails(catalogId)
  if (details.isLoading) return <main className="grid min-h-screen place-items-center bg-[#090914] text-white"><div className="text-center"><LoaderCircle className="mx-auto animate-spin text-violet-300" size={34} /><p className="mt-4 text-sm text-slate-400">Собираем всё о сериале…</p></div></main>
  if (details.isError || !details.data) return <main className="grid min-h-screen place-items-center bg-[#090914] px-5 text-center text-white"><div><p className="text-5xl">🍿</p><h1 className="mt-5 text-2xl font-black">Не удалось открыть сериал</h1><p className="mt-2 text-sm text-slate-500">Источник временно недоступен или запись была удалена.</p><Link to="/series" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-500 px-5 py-3 text-sm font-bold"><ArrowLeft size={17} />Назад к сериалам</Link></div></main>
  const item = details.data
  return (
    <main className="min-h-screen bg-[#090914] text-white"><AppHeader /><SeriesHero item={item} /><div className="details-stack mx-auto grid max-w-7xl gap-9 px-4 py-9 sm:px-6 sm:py-12 xl:gap-12 xl:px-8"><RecommendationReason movie={item} /><SeriesFacts item={item} /><WatchOptions item={item} /><SeriesCast cast={item.cast} /><SimilarSeries items={item.similar} /></div></main>
  )
}
