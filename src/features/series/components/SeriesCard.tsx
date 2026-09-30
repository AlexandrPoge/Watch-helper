import { Bookmark, ImageOff, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Movie } from '../../../entities/movie/model'
import { mediaUrl } from '../../../shared/lib/mediaUrl'

type Props = { item: Movie; saved: boolean; onSave: (item: Movie) => void }

export function SeriesCard({ item, saved, onSave }: Props) {
  return (
    <article className="group relative min-w-0">
      <Link to={`/series/${encodeURIComponent(String(item.id))}`} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400">
        <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-gradient-to-br from-violet-950 to-slate-950 shadow-xl shadow-black/20">
          {item.posterUrl ? <img src={mediaUrl(item.posterUrl)} alt={item.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="grid h-full place-items-center text-slate-600"><ImageOff size={30} /></div>}
          <div className="absolute inset-0 bg-gradient-to-t from-[#080810] via-transparent to-transparent opacity-90" />
          <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-lg bg-[#11111d]/90 px-2 py-1 text-xs font-black text-amber-300 backdrop-blur"><Star size={12} fill="currentColor" />{item.rating?.toFixed(1) ?? '—'}</span>
          <span className="absolute bottom-3 right-3 rounded-lg bg-white/12 px-2 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur">сериал</span>
        </div>
        <h2 className="mt-3 line-clamp-1 font-bold text-white transition group-hover:text-violet-300">{item.title}</h2>
        <p className="mt-1 flex items-center gap-2 text-xs text-slate-500"><span>{item.year ?? 'Год неизвестен'}</span><span>•</span><span className="truncate">{item.genres?.slice(0, 2).join(', ') || item.sourceNames?.join(' · ')}</span></p>
      </Link>
      <button aria-label={saved ? 'Убрать из списка' : 'Добавить в список'} onClick={() => onSave(item)} className={`absolute right-2.5 top-2.5 grid size-9 place-items-center rounded-xl border backdrop-blur transition ${saved ? 'border-violet-300/50 bg-violet-400 text-slate-950' : 'border-white/15 bg-black/45 text-white hover:bg-white hover:text-slate-950'}`}><Bookmark size={16} fill={saved ? 'currentColor' : 'none'} /></button>
    </article>
  )
}
