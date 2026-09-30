import { Play, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { mediaUrl } from '../../shared/lib/mediaUrl'

const poster = 'https://image.tmdb.org/t/p/original/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg'

export function CinemaScene() {
  return (
    <aside className="cinema-stage mx-auto w-full max-w-xl" aria-label="Кинотеатральная сцена с фильмом Дюна: Часть вторая">
      <div className="cinema-beam cinema-beam-left" aria-hidden="true" />
      <div className="cinema-beam cinema-beam-right" aria-hidden="true" />
      <div className="cinema-curtain cinema-curtain-left" aria-hidden="true" />
      <div className="cinema-curtain cinema-curtain-right" aria-hidden="true" />
      <div className="cinema-screen">
        <div className="cinema-screen-glow" aria-hidden="true" />
        <img alt="Дюна: Часть вторая" className="aspect-[16/10] w-full object-cover object-top" src={mediaUrl(poster)} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070710] via-transparent to-black/15" />
        <div className="absolute inset-x-5 top-5 flex items-center justify-between gap-3"><span className="rounded-full bg-emerald-300 px-3 py-1 text-[11px] font-black text-emerald-950">98% твой match</span><span className="flex items-center gap-1 rounded-full border border-white/15 bg-black/45 px-3 py-1 text-[11px] font-bold backdrop-blur"><Sparkles size={11} /> Сегодня</span></div>
        <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[.2em] text-violet-300">Главный сеанс</p><h2 className="mt-1 text-xl font-black sm:text-2xl">Дюна: Часть вторая</h2><p className="mt-1 text-xs text-slate-300">Фантастика · 2 ч 46 мин</p></div><Link to="/movies/tmdb%3Amovie%3A693134" aria-label="Открыть фильм Дюна: Часть вторая" className="grid size-11 shrink-0 place-items-center rounded-2xl bg-violet-500 shadow-lg shadow-violet-500/40 transition hover:scale-110"><Play size={18} fill="currentColor" /></Link></div>
      </div>
      <div className="cinema-floor" aria-hidden="true" />
      <div className="cinema-seats" aria-hidden="true">{Array.from({ length: 12 }, (_, index) => <span key={index} className="cinema-seat" />)}</div>
      <div className="cinema-now"><span className="size-1.5 animate-pulse rounded-full bg-rose-400" /> Кинотеатр открыт</div>
    </aside>
  )
}
