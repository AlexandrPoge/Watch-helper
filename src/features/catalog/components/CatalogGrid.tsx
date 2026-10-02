import type { Movie } from '../../../entities/movie/model'
import type { CatalogKind } from '../model'
import { CatalogCard } from './CatalogCard'

type Props = { items: Movie[]; kind: CatalogKind; loading: boolean; saved: (string | number)[]; onSave: (item: Movie) => void }

export function CatalogGrid({ items, kind, loading, saved, onSave }: Props) {
  const grid = 'grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6'
  if (loading) return <div className={grid}>{Array.from({ length: 12 }, (_, index) => <div key={index}><div className="aspect-[2/3] animate-pulse rounded-2xl bg-white/6" /><div className="mt-3 h-4 w-4/5 animate-pulse rounded bg-white/6" /></div>)}</div>
  if (!items.length) return <div className="rounded-3xl border border-dashed border-white/15 bg-white/3 px-6 py-20 text-center"><p className="text-lg font-bold">По этим условиям ничего не нашлось</p><p className="mt-2 text-sm text-slate-500">Попробуй убрать часть фильтров или изменить запрос.</p></div>
  return <div className={grid}>{items.map((item) => <CatalogCard key={item.id} item={item} kind={kind} saved={saved.includes(item.id)} onSave={onSave} />)}</div>
}
