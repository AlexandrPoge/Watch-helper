import { useState } from 'react'
import type { Movie } from '../../../entities/movie/model'
import { useDebouncedValue } from '../../../shared/lib/useDebouncedValue'
import { useWatchlist } from '../../library/useWatchlist'
import { useCatalogSearch } from '../../search/model/useCatalogSearch'

export type RoomMovieOption = Pick<Movie, 'title' | 'year'> & { id: string }

type Props = {
  selectedIds: ReadonlySet<string>
  disabled: boolean
  selectionDisabled?: boolean
  onSelect: (movie: RoomMovieOption) => void
  actionLabel: string
  selectedLabel: string
}

export function RoomMoviePicker({ selectedIds, disabled, selectionDisabled, onSelect, actionLabel, selectedLabel }: Props) {
  const [draft, setDraft] = useState('')
  const query = draft.trim()
  const debounced = useDebouncedValue(query)
  const search = useCatalogSearch(debounced)
  const watchlist = useWatchlist()
  const pending = query.length >= 2 && (query !== debounced || search.isPending)
  const results = selectableMovies(search.data ?? []).slice(0, 8)
  const saved = selectableMovies(watchlist.items)
  const options = { selectedIds, disabled: disabled || Boolean(selectionDisabled), onSelect, actionLabel, selectedLabel }

  return <>
    <label className="block text-sm font-bold">
      Найти фильм
      <input type="search" value={draft} maxLength={100} disabled={disabled}
        onChange={event => setDraft(event.target.value)}
        className="mt-2 w-full rounded-xl border border-white/15 bg-[#171725] px-3 py-3 text-sm"
        placeholder="Например, Дюна" />
    </label>
    {pending && <p role="status" className="text-sm text-slate-300">Ищем фильмы…</p>}
    {query.length >= 2 && !pending && (search.isError
      ? <p role="alert" className="text-sm text-rose-200">Поиск недоступен. <button className="underline" type="button" onClick={() => search.refetch()}>Повторить</button></p>
      : results.length > 0
        ? <MovieOptions {...options} movies={results} label="Результаты поиска" />
        : <p role="status" className="text-sm text-slate-300">Фильмы с постерами не найдены.</p>)}
    {saved.length > 0 && <details className="rounded-xl border border-white/10 px-3 py-2">
      <summary className="cursor-pointer py-1 text-sm font-semibold">Из сохранённых</summary>
      <MovieOptions {...options} movies={saved} label="Сохранённые фильмы" />
    </details>}
  </>
}

function selectableMovies(movies: Movie[]) {
  return movies.filter((movie): movie is Movie & { id: string } =>
    (movie.kind ?? 'movie') === 'movie' && Boolean(movie.posterUrl) && typeof movie.id === 'string',
  )
}

function MovieOptions({ movies, selectedIds, disabled, onSelect, actionLabel, selectedLabel, label }: Props & {
  movies: RoomMovieOption[]; label: string
}) {
  return <ul aria-label={label} className="max-h-72 space-y-1 overflow-y-auto">{movies.map(movie => {
    const selected = selectedIds.has(movie.id)
    return <li key={movie.id}>
      <button type="button" disabled={disabled || selected} onClick={() => onSelect(movie)}
        className="flex w-full justify-between gap-3 rounded-lg bg-white/5 px-3 py-2 text-left text-sm hover:bg-white/10 disabled:opacity-60">
        <span>{movie.title}{movie.year ? ` · ${movie.year}` : ''}</span>
        <span className="shrink-0 text-violet-200">{selected ? selectedLabel : actionLabel}</span>
      </button>
    </li>
  })}</ul>
}
