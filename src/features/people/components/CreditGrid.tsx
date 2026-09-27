import { Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Movie } from '../../../entities/movie/model'

export function CreditGrid({ items }: { items: Movie[] }) {
  return <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">{items.map((item) => <Link key={item.id} to={`/${item.kind === 'series' ? 'series' : 'movies'}/${encodeURIComponent(String(item.id))}`} className="group min-w-0"><div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-white/5">{item.posterUrl && <img src={item.posterUrl} alt={item.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />}<span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-lg bg-black/75 px-2 py-1 text-xs font-bold text-amber-300"><Star size={11} fill="currentColor" />{item.rating?.toFixed(1) ?? '—'}</span></div><h3 className="mt-2 line-clamp-2 text-sm font-bold group-hover:text-violet-300">{item.title}</h3><p className="mt-1 text-xs text-slate-500">{item.year ?? ''} · {item.kind === 'series' ? 'Сериал' : 'Фильм'}</p></Link>)}</div>
}
