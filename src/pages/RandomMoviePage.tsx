import { useQuery } from '@tanstack/react-query'
import { LoaderCircle, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { fetchRandomMovie } from '../features/movies/api/movieApi'
import { RandomKindPicker, type RandomKind } from '../features/random/components/RandomKindPicker'
import { RandomSelectionCard } from '../features/random/components/RandomSelectionCard'
import { scrollToFocus } from '../shared/lib/scrollToFocus'
import { AppHeader } from './components/AppHeader'

const genres = [['', 'Любой жанр'], ['comedy', 'Комедия'], ['drama', 'Драма'], ['thriller', 'Триллер'], ['sciFi', 'Фантастика'], ['fantasy', 'Фэнтези'], ['romance', 'Романтика'], ['horror', 'Ужасы']]
const runtimes = [['', 'Любая длительность'], ['30', 'До 30 минут'], ['60', 'До часа'], ['90', 'До 1,5 часов'], ['120', 'До 2 часов'], ['150', 'До 2,5 часов']]

export function RandomMoviePage() {
  const [kind, setKind] = useState<RandomKind>('movie')
  const [genre, setGenre] = useState('')
  const [maxRuntime, setMaxRuntime] = useState('')
  const [excludeId, setExcludeId] = useState<string>()
  const [roll, setRoll] = useState(0)
  const [interacted, setInteracted] = useState(false)
  const resultRef = useRef<HTMLElement>(null)
  const random = useQuery({ queryKey: ['random-movie', kind, genre, maxRuntime, roll], queryFn: () => fetchRandomMovie({ kind, genre, maxRuntime, excludeId }), staleTime: 0, retry: 1 })
  const item = random.data
  const reroll = () => { setInteracted(true); setExcludeId(item ? String(item.id) : undefined); setRoll((value) => value + 1) }
  useEffect(() => { if (interacted && !random.isFetching && item) requestAnimationFrame(() => scrollToFocus(resultRef.current)) }, [interacted, random.isFetching, item])
  return <main className="min-h-screen overflow-hidden bg-[#090914] pb-24 text-white"><div className="aurora pointer-events-none fixed inset-0 opacity-60" /><AppHeader />
    <div className="relative mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-8 xl:px-8">
      <section className="reveal-sequence text-center"><p className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-[.2em] text-violet-300"><Sparkles size={15} /> Решаем за тебя</p><h1 className="mt-2 text-[clamp(2.35rem,8vw,3.5rem)] font-black leading-[1.04] tracking-[-.04em]">Что смотрим <span className="gradient-text">сегодня?</span></h1><p className="mx-auto mt-3 max-w-xl text-sm text-slate-400 sm:text-base">Один вариант вместо бесконечной ленты. Сначала выбери формат, затем настрой настроение.</p></section>
      <section aria-label="Настройки выбора" className="mx-auto mt-6 max-w-2xl rounded-3xl border border-white/10 bg-white/4 p-4"><RandomKindPicker value={kind} onChange={(next) => { setInteracted(true); setKind(next); setExcludeId(undefined) }} /><div className="mt-4 grid gap-3 sm:grid-cols-2"><Select label="Жанр" value={genre} onChange={(next) => { setInteracted(true); setGenre(next) }} options={genres} /><Select label={kind === 'series' ? 'Длина серии' : 'Длительность'} value={maxRuntime} onChange={(next) => { setInteracted(true); setMaxRuntime(next) }} options={runtimes} /></div><p className="mt-3 text-center text-xs text-slate-500">Меняй условия — новый вариант появится сам</p></section>
      <section ref={resultRef} className="mx-auto mt-6 max-w-4xl scroll-mt-24" aria-live="polite">{random.isLoading ? <div className="tech-panel grid min-h-80 place-items-center rounded-[2rem] border border-white/8 bg-white/4"><div className="text-center"><LoaderCircle className="mx-auto animate-spin text-violet-300" size={34} /><p className="mt-3 text-sm text-slate-400">Подбираем вариант…</p></div></div> : item ? <RandomSelectionCard item={item} kind={kind} onReroll={reroll} /> : <div role="alert" className="rounded-3xl border border-rose-400/20 bg-rose-400/8 p-8 text-center"><p className="font-bold">По этим условиям ничего не нашлось</p><p className="mt-2 text-sm text-slate-300">Попробуй другой жанр или увеличь длительность.</p><button onClick={reroll} className="mt-5 rounded-xl bg-white px-5 py-3 text-sm font-black text-slate-950">Повторить</button></div>}</section>
    </div>
  </main>
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[][] }) {
  return <label className="text-xs font-bold text-slate-400">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-[#1a1a2a] px-3 text-sm font-medium text-white outline-none focus:border-violet-300">{options.map(([key, text]) => <option key={key} value={key}>{text}</option>)}</select></label>
}
