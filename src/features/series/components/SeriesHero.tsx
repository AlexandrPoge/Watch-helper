import { Bookmark, CirclePlay, Clock3, Star, Tv2 } from 'lucide-react'
import type { SeriesDetails } from '../../../entities/movie/model'
import { ExpandableText } from '../../../shared/ui/ExpandableText'
import { mediaUrl } from '../../../shared/lib/mediaUrl'
import { useWatchlist } from '../../library/useWatchlist'
import { TasteActions } from '../../taste/components/TasteActions'

export function SeriesHero({ item }: { item: SeriesDetails }) {
  const watchlist = useWatchlist()
  const saved = watchlist.has(item.id)
  return (
    <section className="relative isolate min-h-[660px] overflow-hidden border-b border-white/8">
      {item.backdropUrl && <img src={mediaUrl(item.backdropUrl)} alt="" className="absolute inset-0 -z-30 h-full w-full object-cover object-center" />}
      <div className="absolute inset-0 -z-20 bg-gradient-to-r from-[#090914] via-[#090914]/85 to-[#090914]/20" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#090914] via-transparent to-[#090914]/45" />
      <div className="mx-auto flex min-h-[660px] max-w-7xl items-end px-5 pb-16 pt-28 lg:px-8">
        <div className="max-w-3xl">
          <div className="mb-5 flex flex-wrap items-center gap-2 text-xs font-bold"><span className="flex items-center gap-1.5 rounded-full bg-amber-300 px-3 py-1.5 text-amber-950"><Star size={13} fill="currentColor" />{item.rating?.toFixed(1) ?? 'Нет оценки'}</span><span className="rounded-full border border-white/15 bg-black/25 px-3 py-1.5 backdrop-blur">{item.year ?? 'Год неизвестен'}</span>{item.ageRating && <span className="rounded-full border border-white/15 bg-black/25 px-3 py-1.5 backdrop-blur">{item.ageRating}</span>}</div>
          <h1 className="text-5xl font-black leading-[.95] tracking-[-.05em] sm:text-7xl">{item.title}</h1>
          {item.originalTitle && item.originalTitle !== item.title && <p className="mt-3 text-lg font-medium text-slate-400">{item.originalTitle}</p>}
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-300">{item.seasons && <span className="flex items-center gap-2"><Tv2 size={17} className="text-violet-300" />{item.seasons} сезонов</span>}{item.episodes && <span>{item.episodes} эпизодов</span>}{item.duration && <span className="flex items-center gap-2"><Clock3 size={16} />{item.duration}{item.kind === 'series' ? ' серия' : ''}</span>}</div>
          <ExpandableText text={item.overview || 'Описание пока не добавлено.'} className="mt-6 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg" lines={4} />
          <div className="mt-8 flex flex-wrap gap-3">{item.trailerUrl && <a href={item.trailerUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-violet-200"><CirclePlay size={19} />Смотреть трейлер</a>}<button onClick={() => watchlist.toggle(item)} className={`flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-bold transition ${saved ? 'border-violet-300 bg-violet-400 text-slate-950' : 'border-white/20 bg-black/25 hover:bg-white/10'}`}><Bookmark size={18} fill={saved ? 'currentColor' : 'none'} />{saved ? 'В моём списке' : 'Добавить в список'}</button><TasteActions movie={item} /></div>
        </div>
      </div>
    </section>
  )
}
