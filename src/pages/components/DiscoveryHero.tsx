import { Search, SlidersHorizontal, Sparkles, X } from 'lucide-react'
import { useRef, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { CinemaScene } from './CinemaScene'

type DiscoveryHeroProps = { query: string; onQueryChange: (value: string) => void; results?: ReactNode }

export function DiscoveryHero({ query, onQueryChange, results }: DiscoveryHeroProps) {
  const input = useRef<HTMLInputElement>(null)
  const updateSearch = (value: string) => {
    onQueryChange(value)
    input.current?.focus({ preventScroll: true })
  }
  return (
    <section className={results ? 'py-5 sm:py-8' : 'grid gap-7 py-8 sm:gap-10 sm:py-12 xl:min-h-[650px] xl:grid-cols-[1.02fr_.98fr] xl:items-center xl:py-18'}>
      <div className="flex flex-col justify-center">
        {results ? <h1 className="text-2xl font-black sm:text-3xl">Поиск</h1> : <>
          <p className="hologram-badge mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-violet-300/20 bg-violet-300/10 px-3 py-1.5 text-xs font-bold text-violet-200"><Sparkles size={14} /> Кино — под настроение, не по случайности</p>
          <h1 className="max-w-3xl text-[clamp(2.35rem,7vw,4.5rem)] font-black leading-[1.02] tracking-[-0.045em]">Твой вечер.<br /><span className="gradient-text">Твой идеальный фильм.</span></h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">Выбирай для себя, находи совпадения для двоих или собирай друзей в одну кинокомнату.</p>
        </>}
        <div role="search" className={`tech-panel group flex max-w-xl items-center gap-3 rounded-2xl border border-white/10 bg-white/7 p-2 pl-4 shadow-2xl shadow-black/20 transition focus-within:border-violet-300/50 focus-within:bg-white/10 ${results ? 'mt-3' : 'mt-8'}`}>
          <Search size={20} className="text-slate-500 group-focus-within:text-violet-300" />
          <input ref={input} role="searchbox" aria-label="Найти фильм, сериал или актёра" value={query} onChange={event => onQueryChange(event.target.value)}
            className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-slate-500" placeholder="Найти фильм, сериал или актёра…" />
          {results
            ? <button type="button" onClick={() => updateSearch('')} aria-label="Очистить поиск" className="grid size-10 shrink-0 place-items-center rounded-xl text-slate-300 hover:bg-white/10"><X size={18} /></button>
            : <Link to="/movies" aria-label="Открыть каталог с фильтрами" className="grid size-10 place-items-center rounded-xl bg-white text-slate-950 transition hover:bg-violet-200"><SlidersHorizontal size={17} /></Link>}
        </div>
        {!results && <>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/movies" className="inline-flex items-center gap-2 rounded-xl border border-violet-300/30 bg-violet-400/10 px-4 py-2.5 text-sm font-bold text-violet-100 transition hover:bg-violet-400/20">Открыть каталог фильмов <SlidersHorizontal size={16} /></Link>
            <Link to="/movies?country=RU" className="inline-flex items-center rounded-xl border border-white/10 px-4 py-2.5 text-sm font-bold text-slate-300 transition hover:bg-white/8 hover:text-white">Российское кино</Link>
          </div>
          <div className="mt-5 flex flex-wrap gap-2"><span className="text-sm text-slate-500">Попробуй:</span>{[['Интерстеллар', 'Что-то эпичное'], ['Друзья', 'На вечер с друзьями'], ['Том Хэнкс', 'Поиск по актёру']].map(([value, label]) => <button key={label} onClick={() => updateSearch(value)} className="rounded-full bg-white/6 px-3 py-1 text-xs text-slate-300 transition hover:bg-white/12">{label}</button>)}</div>
        </>}
      </div>
      {results ?? <CinemaScene />}
    </section>
  )
}
