import { Film, LoaderCircle, SearchX, Tv, UserRound } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { Movie } from '../../../entities/movie/model'
import type { Person } from '../../../entities/person/model'
import { MovieCard } from '../../movies/components/MovieCard'
import { PeopleResults } from '../../people/components/PeopleResults'

type Tab = 'all' | 'movies' | 'series' | 'people'
type Props = { results: Movie[]; people: Person[]; isLoading: boolean; hasError: boolean; savedIds: Movie['id'][]; onSave: (movie: Movie) => void }

export function SearchResults({ results, people, isLoading, hasError, savedIds, onSave }: Props) {
  const [searchParams] = useSearchParams()
  const [tab, setTab] = useState<Tab>(searchParams.get('tab') === 'people' ? 'people' : 'all')
  const movies = results.filter((item) => item.kind !== 'series')
  const series = results.filter((item) => item.kind === 'series')
  const visible = tab === 'movies' ? movies : tab === 'series' ? series : results
  const tabs = [
    { id: 'all' as const, label: 'Всё', count: results.length + people.length, icon: Film },
    { id: 'movies' as const, label: 'Фильмы', count: movies.length, icon: Film },
    { id: 'series' as const, label: 'Сериалы', count: series.length, icon: Tv },
    { id: 'people' as const, label: 'Люди', count: people.length, icon: UserRound },
  ]
  return (
    <section id="search-results" className="mt-1 scroll-mt-24" aria-live="polite">
      <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto">{tabs.map(({ id, label, count, icon: Icon }) => <button key={id} onClick={() => setTab(id)} className={`flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold transition ${tab === id ? 'border-violet-300/40 bg-violet-400/15 text-white' : 'border-white/8 bg-white/4 text-slate-400 hover:bg-white/8'}`}><Icon size={15} />{label}<span className="rounded-md bg-black/25 px-1.5 py-0.5 text-[10px]">{count}</span></button>)}</div>
      {isLoading && <div className="flex items-center gap-2 rounded-2xl border border-white/8 bg-white/4 p-5 text-sm text-slate-400"><LoaderCircle className="animate-spin text-violet-300" size={18} />Ищем сразу в нескольких каталогах…</div>}
      {!isLoading && hasError && <p className="mb-4 text-sm text-amber-200">Часть каталогов не ответила — показываем доступные результаты.</p>}
      {(tab === 'all' || tab === 'people') && <PeopleResults people={people} />}
      {tab !== 'people' && visible.length > 0 && <div className="grid grid-cols-[repeat(auto-fill,minmax(168px,1fr))] gap-3">{visible.map((movie) => <MovieCard key={movie.id} movie={movie} saved={savedIds.includes(movie.id)} onSave={onSave} />)}</div>}
      {!isLoading && ((tab === 'people' && !people.length) || (tab !== 'people' && !visible.length)) && <div className="rounded-2xl border border-dashed border-white/12 bg-white/3 p-8 text-center"><SearchX className="mx-auto text-slate-600" /><p className="mt-3 font-bold">Ничего не нашли</p><p className="mt-1 text-sm text-slate-500">Попробуй название на другом языке или фамилию актёра.</p></div>}
    </section>
  )
}
