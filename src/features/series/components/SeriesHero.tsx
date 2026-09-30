import { Bookmark, Clock3, Star, Tv2 } from 'lucide-react'
import type { SeriesDetails } from '../../../entities/movie/model'
import { ExpandableText } from '../../../shared/ui/ExpandableText'
import { mediaUrl } from '../../../shared/lib/mediaUrl'
import { useWatchlist } from '../../library/useWatchlist'
import { TasteActions } from '../../taste/components/TasteActions'
import { TrailerButton } from '../../movies/components/TrailerButton'
import { ShareMovieButton } from '../../movies/components/ShareMovieButton'

export function SeriesHero({ item }: { item: SeriesDetails }) {
  const watchlist = useWatchlist()
  const saved = watchlist.has(item.id)
  return (
    <section className="relative isolate min-h-[560px] overflow-hidden border-b border-white/8 sm:min-h-[620px] xl:min-h-[660px]">
      {item.backdropUrl && <img src={mediaUrl(item.backdropUrl)} alt="" className="absolute inset-0 -z-30 h-full w-full object-cover object-center" />}
      <div className="absolute inset-0 -z-20 bg-gradient-to-r from-[#090914] via-[#090914]/85 to-[#090914]/20" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#090914] via-transparent to-[#090914]/45" />
      <div className="mx-auto flex min-h-[560px] max-w-7xl items-end px-4 pb-10 pt-24 sm:min-h-[620px] sm:px-6 sm:pb-14 xl:min-h-[660px] xl:px-8 xl:pb-16">
        <div className="max-w-3xl">
          <div className="mb-5 flex flex-wrap items-center gap-2 text-xs font-bold"><span className="flex items-center gap-1.5 rounded-full bg-amber-300 px-3 py-1.5 text-amber-950"><Star size={13} fill="currentColor" />{item.rating?.toFixed(1) ?? 'Нет оценки'}</span><span className="rounded-full border border-white/15 bg-black/25 px-3 py-1.5 backdrop-blur">{item.year ?? 'Год неизвестен'}</span>{item.ageRating && <span className="rounded-full border border-white/15 bg-black/25 px-3 py-1.5 backdrop-blur">{item.ageRating}</span>}</div>
          <h1 className="max-w-full [overflow-wrap:anywhere] text-[clamp(2.5rem,8vw,4.5rem)] font-black leading-[.98] tracking-[-.05em]">{item.title}</h1>
          {item.originalTitle && item.originalTitle !== item.title && <p className="mt-3 text-lg font-medium text-slate-400">{item.originalTitle}</p>}
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-300">{item.seasons && <span className="flex items-center gap-2"><Tv2 size={17} className="text-violet-300" />{item.seasons} сезонов</span>}{item.episodes && <span>{item.episodes} эпизодов</span>}{item.duration && <span className="flex items-center gap-2"><Clock3 size={16} />{item.duration}{item.kind === 'series' ? ' серия' : ''}</span>}</div>
          <ExpandableText text={item.overview || 'Описание пока не добавлено.'} className="mt-6 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg" lines={4} />
          <div className="mt-8 flex flex-wrap gap-3">{item.trailerUrl && <TrailerButton url={item.trailerUrl} />}<button onClick={() => watchlist.toggle(item)} className={`flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-bold transition ${saved ? 'border-violet-300 bg-violet-400 text-slate-950' : 'border-white/20 bg-black/25 hover:bg-white/10'}`}><Bookmark size={18} fill={saved ? 'currentColor' : 'none'} />{saved ? 'В моём списке' : 'Добавить в список'}</button><TasteActions movie={item} /><ShareMovieButton title={item.title} /></div>
        </div>
      </div>
    </section>
  )
}
