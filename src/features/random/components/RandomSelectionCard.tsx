import { Dices, ImageOff, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Movie } from '../../../entities/movie/model'
import { mediaUrl } from '../../../shared/lib/mediaUrl'
import { TasteActions } from '../../taste/components/TasteActions'
import type { RandomKind } from './RandomKindPicker'

export function RandomSelectionCard({ item, kind, onReroll }: { item: Movie; kind: RandomKind; onReroll: () => void }) {
  const detailsPath = `${kind === 'series' ? '/series' : '/movies'}/${encodeURIComponent(String(item.id))}`
  return <article className="tech-panel relative isolate overflow-hidden rounded-[2rem] border border-white/10 bg-[#141421] shadow-2xl shadow-violet-950/25">
    {item.backdropUrl && <img src={mediaUrl(item.backdropUrl)} alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 -z-20 h-full w-full object-cover opacity-45 md:opacity-30" />}
    <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-[#10101d]/65 via-[#10101d]/70 to-[#10101d]/90" />
    <div className="grid md:grid-cols-[.75fr_1.25fr]">
      <div className="relative hidden h-full min-h-96 overflow-hidden bg-slate-950 shadow-2xl md:block">{item.posterUrl ? <img src={mediaUrl(item.posterUrl)} alt={item.title} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-slate-500"><ImageOff size={40} /></div>}</div>
      <div className="flex min-w-0 flex-col justify-center p-5 sm:p-8 md:p-10"><span className="flex w-fit items-center gap-1 rounded-full bg-amber-300 px-3 py-1 text-xs font-black text-amber-950"><Star size={13} fill="currentColor" />{item.rating?.toFixed(1) ?? '—'}</span><h2 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">{item.title}</h2><p className="mt-2 text-sm text-slate-400">{item.year ?? 'Год неизвестен'} · {kind === 'series' ? 'Сериал' : kind === 'animation' ? 'Мультфильм' : 'Фильм'} · {item.sourceNames?.join(' · ')}</p><p className="mt-4 line-clamp-4 text-sm leading-7 text-slate-300">{item.overview || 'Открой подробности, чтобы узнать больше об этом выборе.'}</p>
        <div className="mt-6 flex flex-wrap gap-2"><Link to={detailsPath} className="interactive-control rounded-xl bg-white px-5 py-3 text-sm font-black text-slate-950 hover:bg-violet-200">Подробнее</Link><button onClick={onReroll} className="interactive-control flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3 text-sm font-bold hover:bg-white/8"><Dices size={18} />Другой вариант</button><TasteActions movie={item} onDislike={onReroll} /></div>
      </div>
    </div>
  </article>
}
