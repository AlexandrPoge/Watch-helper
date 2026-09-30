import type { Movie } from '../../../entities/movie/model'
import { SeriesCard } from './SeriesCard'

type Props = { items: Movie[]; loading: boolean; saved: (string | number)[]; onSave: (item: Movie) => void }

export function SeriesGrid({ items, loading, saved, onSave }: Props) {
  if (loading) return <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">{Array.from({ length: 12 }, (_, index) => <div key={index}><div className="aspect-[2/3] animate-pulse rounded-2xl bg-white/6" /><div className="mt-3 h-4 w-4/5 animate-pulse rounded bg-white/6" /></div>)}</div>
  if (!items.length) return <div className="rounded-3xl border border-dashed border-white/15 bg-white/3 px-6 py-20 text-center"><p className="text-lg font-bold">По этим фильтрам ничего не нашлось</p><p className="mt-2 text-sm text-slate-500">Попробуй изменить жанр, год или минимальную оценку.</p></div>
  return <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">{items.map((item) => <SeriesCard key={item.id} item={item} saved={saved.includes(item.id)} onSave={onSave} />)}</div>
}
