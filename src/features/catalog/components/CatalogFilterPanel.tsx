import { RotateCcw, Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { CatalogFilters, CatalogKind } from '../model'

type Props = { kind: CatalogKind; filters: CatalogFilters; query: string; onChange: (next: CatalogFilters) => void; onSearch: (query: string) => void; onReset: () => void }
type Option = [string, string]
const commonGenres: Option[] = [['', 'Любой жанр'], ['drama', 'Драма'], ['comedy', 'Комедия'], ['thriller', 'Триллер'], ['fantasy', 'Фэнтези'], ['sciFi', 'Фантастика'], ['romance', 'Мелодрама'], ['crime', 'Криминал'], ['documentary', 'Документальный']]
const movieGenres: Option[] = [...commonGenres, ['action', 'Боевик'], ['horror', 'Ужасы'], ['animation', 'Анимация']]
const countries: Option[] = [['', 'Любая страна'], ['RU', 'Россия'], ['SU', 'СССР'], ['US', 'США'], ['GB', 'Великобритания'], ['FR', 'Франция'], ['DE', 'Германия'], ['JP', 'Япония'], ['KR', 'Южная Корея'], ['IN', 'Индия'], ['CN', 'Китай'], ['CA', 'Канада']]
const years: Option[] = [['', 'Любой год'], ...Array.from({ length: 47 }, (_, index) => { const year = String(new Date().getFullYear() - index); return [year, year] as Option })]
const ratings: Option[] = [['', 'Любая оценка'], ['6', 'От 6'], ['7', 'От 7'], ['8', 'От 8'], ['9', 'От 9']]
const sorts: Option[] = [['popular', 'Популярные'], ['rating', 'По оценке'], ['newest', 'Новые']]

export function CatalogFilterPanel({ kind, filters, query, onChange, onSearch, onReset }: Props) {
  const [draft, setDraft] = useState(query)
  useEffect(() => setDraft(query), [query])
  const update = (key: keyof CatalogFilters, value: string) => onChange({ ...filters, [key]: value })
  const activeCount = [filters.genre, filters.country, filters.year, filters.rating, query].filter(Boolean).length + Number(filters.sort !== 'popular')
  return <section className="tech-panel relative z-10 rounded-3xl border border-white/10 bg-[#10101d]/95 p-4 sm:p-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div role="navigation" aria-label="Тип каталога" className="inline-flex rounded-xl border border-white/10 bg-black/25 p-1">
        <CatalogLink to="/movies" active={kind === 'movie'} label="Фильмы" />
        <CatalogLink to="/series" active={kind === 'series'} label="Сериалы" />
      </div>
      <div className="flex items-center gap-3">
        {kind === 'movie' && <button type="button" aria-pressed={filters.country === 'RU'} onClick={() => update('country', filters.country === 'RU' ? '' : 'RU')} className={`rounded-full border px-4 py-2 text-xs font-bold transition ${filters.country === 'RU' ? 'border-violet-300 bg-violet-400 text-slate-950' : 'border-violet-300/30 bg-violet-400/8 text-violet-200 hover:bg-violet-400/15'}`}>Российское кино</button>}
        <span className="hidden text-xs text-slate-500 lg:inline">Подборка обновится сразу</span>
      </div>
    </div>
    <form onSubmit={(event) => { event.preventDefault(); if (draft.trim().length !== 1) onSearch(draft.trim()) }} className="mt-4 flex gap-2">
      <label className="relative min-w-0 flex-1"><span className="sr-only">Поиск по названию</span><Search size={18} className="absolute left-4 top-3.5 text-slate-500" /><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={kind === 'movie' ? 'Название фильма…' : 'Название сериала…'} className="h-12 w-full rounded-xl border border-white/10 bg-white/5 pl-11 pr-10 text-sm outline-none focus:border-violet-300" />{draft && <button type="button" aria-label="Очистить поиск" onClick={() => { setDraft(''); onSearch('') }} className="absolute right-2 top-2 grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-white/10"><X size={16} /></button>}</label>
      <button type="submit" disabled={draft.trim().length === 1} className="rounded-xl bg-violet-500 px-4 text-sm font-black hover:bg-violet-400 disabled:opacity-50">Найти</button>
    </form>
    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Select label="Жанр" value={filters.genre} options={kind === 'movie' ? movieGenres : commonGenres} onChange={(value) => update('genre', value)} />
      <Select label="Страна производства" value={filters.country} options={countries} onChange={(value) => update('country', value)} />
      <Select label={kind === 'movie' ? 'Год выпуска' : 'Год первого сезона'} value={filters.year} options={years} onChange={(value) => update('year', value)} />
      <Select label="Оценка не ниже" value={filters.rating} options={ratings} onChange={(value) => update('rating', value)} />
    </div>
    <p className="mt-2 text-xs text-slate-500">Страна производства не гарантирует доступность {kind === 'movie' ? 'фильма' : 'сериала'} для просмотра в этом регионе.</p>
    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-3">
      <div className="flex items-center gap-2"><span className="text-xs font-bold text-slate-400">Сначала:</span><div className="flex rounded-xl border border-white/10 bg-black/20 p-1">{sorts.map(([value, label]) => <button key={value} type="button" aria-pressed={filters.sort === value} onClick={() => update('sort', value)} className={`rounded-lg px-2.5 py-2 text-xs font-bold transition sm:px-3 ${filters.sort === value ? 'bg-violet-400 text-slate-950' : 'text-slate-400 hover:bg-white/8 hover:text-white'}`}>{label}</button>)}</div></div>
      {activeCount > 0 && <button type="button" onClick={() => { setDraft(''); onReset() }} className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white"><RotateCcw size={15} />Сбросить фильтры · {activeCount}</button>}
    </div>
  </section>
}

function CatalogLink({ to, active, label }: { to: string; active: boolean; label: string }) {
  return <Link to={to} aria-current={active ? 'page' : undefined} className={`rounded-lg px-4 py-2.5 text-sm font-bold ${active ? 'bg-violet-400 text-slate-950' : 'text-slate-400 hover:bg-white/8 hover:text-white'}`}>{label}</Link>
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: Option[]; onChange: (value: string) => void }) {
  return <label className="text-xs font-bold text-slate-400">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-[#1a1a2a] px-3 text-sm font-medium text-white outline-none focus:border-violet-300">{options.map(([key, text]) => <option key={key} value={key}>{text}</option>)}</select></label>
}
