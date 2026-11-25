import { useState } from 'react'
import type { Movie } from '../../../entities/movie/model'
import { maxManualCandidates, minManualCandidates } from '../../../entities/room/roundLimits'
import { useDebouncedValue } from '../../../shared/lib/useDebouncedValue'
import { useCatalogSearch } from '../../search/model/useCatalogSearch'
import { useWatchlist } from '../../library/useWatchlist'

type Props = { selected: Movie[]; onChange: (movies: Movie[]) => void; disabled: boolean }

export function ManualMovieSelection({ selected, onChange, disabled }: Props) {
  const [draft, setDraft] = useState('')
  const query = draft.trim()
  const debounced = useDebouncedValue(query)
  const search = useCatalogSearch(debounced)
  const watchlist = useWatchlist()
  const pending = query.length >= 2 && (query !== debounced || search.isPending)
  const results = selectableMovies(search.data ?? []).slice(0, 8)
  const saved = selectableMovies(watchlist.items)
  const full = selected.length >= maxManualCandidates
  const add = (movie: Movie) => {
    if (!disabled && !full && !selected.some(item => item.id === movie.id)) onChange([...selected, movie])
  }
  return (
    <div className="mt-4 space-y-3">
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
          ? <MovieOptions movies={results} selected={selected} disabled={disabled || full} onAdd={add} label="Результаты поиска" />
          : <p role="status" className="text-sm text-slate-300">Фильмы с постерами не найдены.</p>)}
      {saved.length > 0 && <details className="rounded-xl border border-white/10 px-3 py-2">
        <summary className="cursor-pointer py-1 text-sm font-semibold">Из сохранённых</summary>
        <MovieOptions movies={saved} selected={selected} disabled={disabled || full} onAdd={add} label="Сохранённые фильмы" />
      </details>}
      <p role="status" className="text-sm text-slate-300">Выбрано {selected.length} из {maxManualCandidates}. Для раунда нужно минимум {minManualCandidates} фильма.</p>
      {selected.length > 0 && <ol aria-label="Фильмы для голосования" className="space-y-2">{selected.map(movie =>
        <li key={movie.id} className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-3 py-2 text-sm">
          <span>{movie.title}{movie.year ? ` · ${movie.year}` : ''}</span>
          <button type="button" disabled={disabled} onClick={() => onChange(selected.filter(item => item.id !== movie.id))}
            aria-label={`Убрать «${movie.title}» из списка`} className="shrink-0 rounded-lg px-2 py-2 text-violet-200 underline disabled:opacity-50">Убрать</button>
        </li>,
      )}</ol>}
    </div>
  )
}

function selectableMovies(movies: Movie[]) {
  return movies.filter(movie => (movie.kind ?? 'movie') === 'movie' && movie.posterUrl && typeof movie.id === 'string')
}

function MovieOptions({ movies, selected, disabled, onAdd, label }: {
  movies: Movie[]; selected: Movie[]; disabled: boolean; onAdd: (movie: Movie) => void; label: string
}) {
  const selectedIds = new Set(selected.map(movie => movie.id))
  return <ul aria-label={label} className="max-h-72 space-y-1 overflow-y-auto">{movies.map(movie => <li key={movie.id}>
    <button type="button" disabled={disabled || selectedIds.has(movie.id)} onClick={() => onAdd(movie)}
      className="flex w-full justify-between gap-3 rounded-lg bg-white/5 px-3 py-2 text-left text-sm hover:bg-white/10 disabled:opacity-60">
      <span>{movie.title}{movie.year ? ` · ${movie.year}` : ''}</span>
      <span className="shrink-0 text-violet-200">{selectedIds.has(movie.id) ? 'Добавлен' : 'Добавить'}</span>
    </button>
  </li>)}</ul>
}
