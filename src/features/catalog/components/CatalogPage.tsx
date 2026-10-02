import { Film, Sparkles, Tv } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { useWatchlist } from '../../library/useWatchlist'
import { useCatalogSearch } from '../../search/model/useCatalogSearch'
import { AppHeader } from '../../../pages/components/AppHeader'
import { filterSearchResults } from '../filterSearchResults'
import { readCatalogFilters, writeCatalogParams } from '../filterParams'
import type { CatalogFilters, CatalogKind } from '../model'
import { useBrowseCatalog } from '../useBrowseCatalog'
import { CatalogFilterPanel } from './CatalogFilterPanel'
import { CatalogGrid } from './CatalogGrid'

export function CatalogPage({ kind }: { kind: CatalogKind }) {
  const [params, setParams] = useSearchParams()
  const filters = readCatalogFilters(params)
  const query = params.get('q') ?? ''
  const searching = query.trim().length >= 2
  const catalog = useBrowseCatalog(kind, filters, !searching)
  const search = useCatalogSearch(query)
  const watchlist = useWatchlist()
  const items = searching ? filterSearchResults(search.data ?? [], kind, filters) : catalog.data?.pages.flatMap((page) => page.items) ?? []
  const updateFilters = (next: CatalogFilters) => setParams(writeCatalogParams(next, query), { replace: true })
  const updateSearch = (next: string) => setParams(writeCatalogParams(filters, next), { replace: true })
  const error = searching ? search.isError : catalog.isError
  const loading = searching ? search.isLoading : catalog.isLoading
  return <main className="min-h-screen bg-[#090914] pb-20 text-white">
    <div className="aurora pointer-events-none fixed inset-0 opacity-60" /><AppHeader />
    <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 xl:px-8">
      <section className="reveal-sequence flex flex-col justify-between gap-3 pb-4 pt-6 md:flex-row md:items-end">
        <div><p className="mb-1 flex items-center gap-2 text-xs font-black uppercase tracking-[.22em] text-violet-300">{kind === 'movie' ? <Film size={15} /> : <Tv size={15} />} {kind === 'movie' ? 'Фильмы · подбор и поиск' : 'Сериалы · подбор и поиск'}</p><h1 className="max-w-4xl text-[clamp(2rem,5vw,2.5rem)] font-black leading-[1.05] tracking-[-.04em]">{kind === 'movie' ? 'Выбирай фильм' : 'Выбирай сериал'} <span className="gradient-text">под свой вечер</span></h1><p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">{kind === 'movie' ? 'От российского кино до мировой классики — настрой страну, жанр и оценку.' : 'Найди историю по жанру, стране, году и оценке. Актёры и подробности — внутри.'}</p></div>
        <div className="tech-panel hidden items-center gap-3 self-start rounded-2xl border border-white/10 bg-white/5 px-4 py-3 md:flex md:self-auto"><Sparkles className="text-amber-300" size={20} /><div><p className="text-lg font-black">{items.length || '—'}</p><p className="text-[11px] uppercase tracking-wider text-slate-500">найдено сейчас</p></div></div>
      </section>
      <CatalogFilterPanel kind={kind} filters={filters} query={query} onChange={updateFilters} onSearch={updateSearch} onReset={() => setParams({}, { replace: true })} />
      <section className="pb-20 pt-5" aria-live="polite">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-2xl font-black">{searching ? `Поиск: ${query}` : filters.sort === 'newest' ? 'Свежие премьеры' : filters.sort === 'rating' ? 'Высокие оценки' : kind === 'movie' ? 'Популярные фильмы' : 'Популярные сериалы'}</h2><p className="mt-1 text-sm text-slate-500">{searching ? 'Поиск по всему каталогу' : 'Данные TMDB и PoiskKino'}</p></div>{watchlist.items.length > 0 && <span className="rounded-full bg-violet-400/15 px-3 py-1.5 text-xs font-bold text-violet-300">В списке: {watchlist.items.length}</span>}</div>
        {!searching && catalog.data?.pages.some((page) => page.partial) && <div role="status" className="mb-5 rounded-2xl border border-amber-300/20 bg-amber-300/8 p-4 text-sm text-amber-100">Один из каталогов не ответил — показываем доступные {kind === 'movie' ? 'фильмы' : 'сериалы'}. <button className="font-bold underline" onClick={() => catalog.refetch()}>Обновить</button></div>}
        {error ? <div role="alert" className="rounded-2xl border border-rose-400/20 bg-rose-400/8 p-5 text-sm text-rose-200">Каталог временно недоступен. <button className="underline" onClick={() => searching ? search.refetch() : catalog.refetch()}>Повторить</button></div> : <><CatalogGrid items={items} kind={kind} loading={loading} saved={watchlist.ids} onSave={watchlist.toggle} />{!searching && catalog.hasNextPage && items.length > 0 && <div className="mt-10 text-center"><button disabled={catalog.isFetchingNextPage} onClick={() => catalog.fetchNextPage()} className="rounded-xl border border-white/12 bg-white/5 px-6 py-3 text-sm font-bold transition hover:border-violet-400/40 hover:bg-violet-400/10 disabled:cursor-wait disabled:opacity-50">{catalog.isFetchingNextPage ? 'Загружаем…' : `Показать ещё ${kind === 'movie' ? 'фильмы' : 'сериалы'}`}</button></div>}</>}
      </section>
    </div>
  </main>
}
