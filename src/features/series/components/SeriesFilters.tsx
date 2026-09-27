import { RotateCcw, Search, SlidersHorizontal } from 'lucide-react'
import type { SeriesFilters as Filters } from '../model'
import { defaultSeriesFilters } from '../model'

type Props = { filters: Filters; search: string; onChange: (filters: Filters) => void; onSearch: (value: string) => void }
const genres = [['', 'Все жанры'], ['drama', 'Драма'], ['comedy', 'Комедия'], ['crime', 'Криминал'], ['thriller', 'Триллер'], ['fantasy', 'Фэнтези'], ['sciFi', 'Фантастика'], ['romance', 'Мелодрама'], ['documentary', 'Документальные']]
const years = ['', '2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018']

export function SeriesFilters({ filters, search, onChange, onSearch }: Props) {
  const update = (key: keyof Filters, value: string) => onChange({ ...filters, [key]: value })
  const active = Object.entries(filters).some(([key, value]) => key !== 'sort' && value)
  return (
    <section className="sticky top-18 z-20 -mx-5 border-y border-white/8 bg-[#090914]/90 px-5 py-4 backdrop-blur-xl lg:-mx-8 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 xl:flex-row xl:items-center">
        <label className="relative min-w-64 flex-1"><Search className="absolute left-3.5 top-3.5 text-slate-500" size={18} /><input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Найти среди результатов" className="h-11 w-full rounded-xl border border-white/10 bg-white/5 pl-11 pr-4 text-sm outline-none transition focus:border-violet-400/60 focus:bg-white/8" /></label>
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          <FilterSelect icon={<SlidersHorizontal size={16} />} value={filters.genre} onChange={(value) => update('genre', value)} options={genres} />
          <FilterSelect value={filters.year} onChange={(value) => update('year', value)} options={years.map((year) => [year, year || 'Любой год'])} />
          <FilterSelect value={filters.rating} onChange={(value) => update('rating', value)} options={[['', 'Любая оценка'], ['7', 'От 7.0'], ['8', 'От 8.0'], ['9', 'От 9.0']]} />
          <FilterSelect value={filters.sort} onChange={(value) => update('sort', value)} options={[['popular', 'Популярные'], ['rating', 'Лучшие'], ['newest', 'Новинки']]} />
          {active && <button onClick={() => onChange(defaultSeriesFilters)} className="grid size-11 shrink-0 place-items-center rounded-xl border border-white/10 text-slate-400 transition hover:bg-white/8 hover:text-white" title="Сбросить фильтры"><RotateCcw size={17} /></button>}
        </div>
      </div>
    </section>
  )
}

function FilterSelect({ value, onChange, options, icon }: { value: string; onChange: (value: string) => void; options: string[][]; icon?: React.ReactNode }) {
  return <label className="relative flex shrink-0 items-center">{icon && <span className="pointer-events-none absolute left-3 text-violet-300">{icon}</span>}<select value={value} onChange={(event) => onChange(event.target.value)} className={`h-11 appearance-none rounded-xl border border-white/10 bg-[#151522] pr-9 text-sm font-medium text-slate-200 outline-none transition hover:border-white/20 ${icon ? 'pl-9' : 'pl-3'}`}>{options.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select><span className="pointer-events-none absolute right-3 text-xs text-slate-500">⌄</span></label>
}
