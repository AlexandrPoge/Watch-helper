import { Search, SlidersHorizontal, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

type DiscoveryHeroProps = { query: string; onQueryChange: (value: string) => void }

export function DiscoveryHero({ query, onQueryChange }: DiscoveryHeroProps) {
  return (
    <section className="grid gap-10 py-12 lg:grid-cols-[1.08fr_.92fr] lg:py-18">
      <div className="flex flex-col justify-center">
        <p className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-violet-300/20 bg-violet-300/10 px-3 py-1.5 text-xs font-bold text-violet-200"><Sparkles size={14} /> Кино — под настроение, не по случайности</p>
        <h1 className="max-w-3xl text-4xl font-black tracking-[-0.045em] sm:text-6xl lg:text-7xl">Твой вечер.<br /><span className="gradient-text">Твой идеальный фильм.</span></h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">Выбирай для себя, находи совпадения для двоих или собирай друзей в одну кинокомнату.</p>
        <label className="group mt-8 flex max-w-xl items-center gap-3 rounded-2xl border border-white/10 bg-white/7 p-2 pl-4 shadow-2xl shadow-black/20 transition focus-within:border-violet-300/50 focus-within:bg-white/10">
          <Search size={20} className="text-slate-500 group-focus-within:text-violet-300" />
          <input value={query} onChange={(event) => onQueryChange(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-500" placeholder="Найти фильм, актёра или настроение..." />
          <Link to="/series" aria-label="Открыть каталог с фильтрами" className="grid size-10 place-items-center rounded-xl bg-white text-slate-950 transition hover:bg-violet-200"><SlidersHorizontal size={17} /></Link>
        </label>
        <div className="mt-5 flex flex-wrap gap-2"><span className="text-sm text-slate-500">Попробуй:</span>{[['Интерстеллар', 'Что-то эпичное'], ['Друзья', 'На вечер с друзьями'], ['Том Хэнкс', 'Поиск по актёру']].map(([value, label]) => <button key={label} onClick={() => onQueryChange(value)} className="rounded-full bg-white/6 px-3 py-1 text-xs text-slate-300 transition hover:bg-white/12">{label}</button>)}</div>
      </div>
      <aside className="hero-movie relative mx-auto w-full max-w-md overflow-hidden rounded-[2rem] border border-white/12 bg-slate-900 p-3 shadow-2xl shadow-violet-950/50 lg:rotate-2">
        <img alt="Дюна: Часть вторая" className="aspect-[16/10] w-full rounded-[1.45rem] object-cover object-top opacity-90" src="https://image.tmdb.org/t/p/original/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg" />
        <div className="absolute inset-x-3 top-3 aspect-[16/10] rounded-[1.45rem] bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
        <div className="absolute inset-x-8 top-8 flex justify-between"><span className="rounded-full bg-emerald-300 px-3 py-1 text-xs font-black text-emerald-950">98% твой match</span><span className="rounded-full bg-slate-950/70 px-3 py-1 text-xs font-bold backdrop-blur">Сегодня</span></div>
        <div className="px-3 pb-3 pt-4"><p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-300">Твой главный выбор</p><div className="mt-2 flex items-end justify-between"><div><h2 className="text-2xl font-bold">Дюна: Часть вторая</h2><p className="mt-1 text-sm text-slate-400">Фантастика · 2 ч 46 мин</p></div><Link to="/movies/tmdb%3Amovie%3A693134" aria-label="Открыть фильм" className="grid size-11 place-items-center rounded-2xl bg-violet-500 shadow-lg shadow-violet-500/30 transition hover:scale-105"><span className="ml-0.5 border-y-7 border-l-11 border-y-transparent border-l-white" /></Link></div></div>
      </aside>
    </section>
  )
}
