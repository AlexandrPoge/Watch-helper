import { useQuery } from '@tanstack/react-query'
import { Dices, LoaderCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { fetchRandomMovie } from '../features/movies/api/movieApi'
import { RandomFiltersPanel } from '../features/random/components/RandomFiltersPanel'
import type { RandomKind } from '../features/random/components/RandomKindPicker'
import { RandomSelectionCard } from '../features/random/components/RandomSelectionCard'
import { scrollToFocus } from '../shared/lib/scrollToFocus'
import { AppHeader } from './components/AppHeader'

export function RandomMoviePage() {
  const [kind, setKind] = useState<RandomKind>('movie')
  const [genre, setGenre] = useState('')
  const [country, setCountry] = useState('')
  const [maxRuntime, setMaxRuntime] = useState('')
  const [excludeId, setExcludeId] = useState<string>()
  const [roll, setRoll] = useState(0)
  const focusNextResult = useRef(false)
  const resultRef = useRef<HTMLElement>(null)
  const random = useQuery({
    queryKey: ['random-movie', kind, genre, country, maxRuntime, roll],
    queryFn: () => fetchRandomMovie({ kind, genre, country, maxRuntime, excludeId }),
    staleTime: 0, retry: 1,
  })
  const reroll = () => {
    focusNextResult.current = true
    setExcludeId(random.data ? String(random.data.id) : undefined)
    setRoll((value) => value + 1)
  }
  const changeFilter = <T,>(setter: (value: T) => void, value: T) => {
    focusNextResult.current = false
    setExcludeId(undefined)
    setter(value)
  }
  const reset = () => {
    focusNextResult.current = false
    setExcludeId(undefined)
    setKind('movie')
    setGenre('')
    setCountry('')
    setMaxRuntime('')
  }
  useEffect(() => {
    if (!focusNextResult.current || random.isFetching || !random.data) return
    focusNextResult.current = false
    requestAnimationFrame(() => scrollToFocus(resultRef.current))
  }, [random.isFetching, random.data])

  return <main className="min-h-screen overflow-x-hidden bg-[#090914] pb-24 text-white">
    <div className="aurora pointer-events-none fixed inset-0 opacity-60" />
    <AppHeader />
    <div className="relative mx-auto max-w-6xl px-4 pb-8 pt-6 sm:px-6 xl:px-8">
      <section className="reveal-sequence">
        <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[.2em] text-violet-300"><Dices size={16} /> Случайный сеанс</p>
        <h1 className="mt-1 text-[clamp(2rem,6vw,2.8rem)] font-black leading-tight tracking-[-.04em]">Что смотрим <span className="gradient-text">сегодня?</span></h1>
        <p className="mt-1 text-sm text-slate-400">Выбери формат, страну и настроение — предложим один вариант.</p>
      </section>
      <RandomFiltersPanel kind={kind} genre={genre} country={country} maxRuntime={maxRuntime}
        onKind={(value) => changeFilter(setKind, value)} onGenre={(value) => changeFilter(setGenre, value)}
        onCountry={(value) => changeFilter(setCountry, value)} onRuntime={(value) => changeFilter(setMaxRuntime, value)} onReset={reset} />
      <section ref={resultRef} className="mt-5 scroll-mt-24" aria-live="polite">
        <h2 className="sr-only">Случайный результат</h2>
        {random.isLoading ? <div className="tech-panel grid min-h-72 place-items-center rounded-[2rem] border border-white/8 bg-white/4"><div className="text-center"><LoaderCircle className="mx-auto animate-spin text-violet-300" size={34} /><p className="mt-3 text-sm text-slate-400">Подбираем вариант…</p></div></div>
          : random.data ? <RandomSelectionCard item={random.data} kind={kind} onReroll={reroll} />
            : <div role="alert" className="rounded-3xl border border-rose-400/20 bg-rose-400/8 p-8 text-center"><p className="font-bold">{random.isError ? 'Источник временно недоступен' : 'По этим условиям ничего не нашлось'}</p><p className="mt-2 text-sm text-slate-300">Попробуй ещё раз или измени страну, жанр и длительность.</p><button onClick={reroll} className="mt-5 rounded-xl bg-white px-5 py-3 text-sm font-black text-slate-950">Повторить выбор</button></div>}
      </section>
    </div>
  </main>
}
