import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Movie } from '../../../entities/movie/model'
import { mediaUrl } from '../../../shared/lib/mediaUrl'

export function SimilarSeries({ items }: { items: Movie[] }) {
  if (!items.length) return null
  return (
    <section><h2 className="mb-4 text-xl font-black">Похожее настроение</h2><div className="no-scrollbar flex gap-4 overflow-x-auto pb-3">{items.map((item) => <Link key={item.id} to={`/${item.kind === 'movie' ? 'movies' : 'series'}/${encodeURIComponent(String(item.id))}`} className="group w-36 shrink-0"><div className="aspect-[2/3] overflow-hidden rounded-2xl bg-white/5">{item.posterUrl && <img src={mediaUrl(item.posterUrl)} alt={item.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />}</div><div className="mt-2 flex items-start justify-between gap-1"><div><h3 className="line-clamp-2 text-sm font-bold group-hover:text-violet-300">{item.title}</h3><p className="mt-1 text-xs text-slate-500">{item.rating?.toFixed(1) ?? item.year ?? ''}</p></div><ArrowRight className="mt-0.5 shrink-0 text-slate-600 transition group-hover:translate-x-1 group-hover:text-violet-300" size={15} /></div></Link>)}</div></section>
  )
}
