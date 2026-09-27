import { Sparkles, Tv } from 'lucide-react'
import { useMemo, useState } from 'react'
import { SeriesFilters } from '../features/series/components/SeriesFilters'
import { SeriesGrid } from '../features/series/components/SeriesGrid'
import { defaultSeriesFilters, type SeriesFilters as Filters } from '../features/series/model'
import { useSeries } from '../features/series/useSeries'
import { AppHeader } from './components/AppHeader'

export function SeriesPage() {
  const [filters, setFilters] = useState<Filters>(defaultSeriesFilters)
  const [search, setSearch] = useState('')
  const [saved, setSaved] = useState<(string | number)[]>([])
  const catalog = useSeries(filters)
  const items = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    const allItems = catalog.data?.pages.flatMap((page) => page.items) ?? []
    return query ? allItems.filter((item) => `${item.title} ${item.originalTitle ?? ''}`.toLocaleLowerCase().includes(query)) : allItems
  }, [catalog.data, search])
  const toggleSaved = (id: string | number) => setSaved((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])

  return (
    <main className="min-h-screen bg-[#090914] text-white">
      <div className="aurora pointer-events-none fixed inset-0 opacity-60" />
      <AppHeader />
      <div className="relative z-10 mx-auto max-w-7xl px-5 lg:px-8">
        <section className="flex flex-col justify-between gap-6 pb-8 pt-12 md:flex-row md:items-end md:pt-16">
          <div><p className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[.22em] text-violet-300"><Tv size={15} /> Большой каталог</p><h1 className="max-w-3xl text-4xl font-black tracking-[-.04em] sm:text-6xl">Сериал на любой <span className="gradient-text">вечер и вкус</span></h1><p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">Оценки, описание, актёры и похожие истории — всё в одном месте.</p></div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"><Sparkles className="text-amber-300" size={20} /><div><p className="text-lg font-black">{items.length || '—'}</p><p className="text-[11px] uppercase tracking-wider text-slate-500">загружено сейчас</p></div></div>
        </section>
        <SeriesFilters filters={filters} search={search} onChange={setFilters} onSearch={setSearch} />
        <section className="pb-20 pt-8">
          <div className="mb-6 flex items-end justify-between"><div><h2 className="text-2xl font-black">{filters.sort === 'newest' ? 'Свежие премьеры' : filters.sort === 'rating' ? 'Высокие оценки' : 'Сейчас смотрят'}</h2><p className="mt-1 text-sm text-slate-500">Данные TMDB и PoiskKino</p></div>{saved.length > 0 && <span className="rounded-full bg-violet-400/15 px-3 py-1.5 text-xs font-bold text-violet-300">В списке: {saved.length}</span>}</div>
          {catalog.isError ? <div className="rounded-2xl border border-rose-400/20 bg-rose-400/8 p-5 text-sm text-rose-200">Каталог временно недоступен. Проверь подключение API и попробуй ещё раз.</div> : <><SeriesGrid items={items} loading={catalog.isLoading} saved={saved} onSave={toggleSaved} />{items.length > 0 && !search && <div className="mt-10 text-center"><button disabled={catalog.isFetchingNextPage} onClick={() => catalog.fetchNextPage()} className="rounded-xl border border-white/12 bg-white/5 px-6 py-3 text-sm font-bold transition hover:border-violet-400/40 hover:bg-violet-400/10 disabled:cursor-wait disabled:opacity-50">{catalog.isFetchingNextPage ? 'Загружаем…' : 'Показать ещё сериалы'}</button></div>}</>}
        </section>
      </div>
    </main>
  )
}
