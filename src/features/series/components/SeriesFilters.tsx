import { CalendarDays, RotateCcw, Search, Sparkles, Star, X } from 'lucide-react'
import type { SeriesFilters as Filters } from '../model'

type Props = { filters: Filters; search: string; onChange: (filters: Filters) => void; onSearch: (value: string) => void; onReset: () => void }
type Option = [string, string]

const genres: Option[] = [['', 'Все'], ['drama', 'Драма'], ['comedy', 'Комедия'], ['crime', 'Криминал'], ['thriller', 'Триллер'], ['fantasy', 'Фэнтези'], ['sciFi', 'Фантастика'], ['romance', 'Мелодрама'], ['documentary', 'Документальные']]
const years: Option[] = [['', 'Любой'], ['2026', '2026'], ['2025', '2025'], ['2024', '2024'], ['2023', '2023'], ['2022', '2022'], ['2021', '2021'], ['2020', '2020']]
const ratings: Option[] = [['', 'Любая'], ['7', '7+'], ['8', '8+'], ['9', '9+']]
const sorts: Option[] = [['popular', 'Популярные'], ['rating', 'Лучшие'], ['newest', 'Новинки']]

export function SeriesFilters({ filters, search, onChange, onSearch, onReset }: Props) {
  const update = (key: keyof Filters, value: string) => onChange({ ...filters, [key]: value })
  const activeCount = [filters.genre, filters.year, filters.rating].filter(Boolean).length
  return (
    <section className="relative z-20 -mx-5 border-y border-white/8 bg-[#0c0c18]/92 px-5 py-5 shadow-2xl shadow-black/15 backdrop-blur-xl lg:-mx-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative block flex-1 lg:max-w-lg"><Search className="absolute left-4 top-3.5 text-slate-500" size={18} /><input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Название сериала…" className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 pl-11 pr-11 text-sm outline-none transition focus:border-violet-400/60 focus:bg-white/8" />{search && <button type="button" onClick={() => onSearch('')} aria-label="Очистить поиск" className="absolute right-2 top-2 grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-white/8 hover:text-white"><X size={16} /></button>}</label>
          <div className="no-scrollbar flex gap-1 overflow-x-auto rounded-2xl border border-white/8 bg-black/20 p-1"><Sparkles className="ml-2 mr-1 self-center text-violet-300" size={16} />{sorts.map(([value, label]) => <Chip key={value} active={filters.sort === value} label={label} onClick={() => update('sort', value)} compact />)}</div>
        </div>
        <div className="mt-5 grid gap-4 xl:grid-cols-[1fr_auto_auto] xl:items-end">
          <FilterGroup label="Жанр" value={filters.genre} options={genres} onChange={(value) => update('genre', value)} />
          <FilterGroup icon={<CalendarDays size={14} />} label="Год" value={filters.year} options={years} onChange={(value) => update('year', value)} />
          <FilterGroup icon={<Star size={14} />} label="Оценка" value={filters.rating} options={ratings} onChange={(value) => update('rating', value)} />
        </div>
        {(activeCount > 0 || search) && <div className="mt-4 flex items-center justify-between border-t border-white/6 pt-3"><p className="text-xs text-slate-500">Активных фильтров: {activeCount + (search ? 1 : 0)}</p><button onClick={onReset} className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-400 hover:bg-white/8 hover:text-white"><RotateCcw size={14} />Сбросить всё</button></div>}
      </div>
    </section>
  )
}

function FilterGroup({ label, icon, value, options, onChange }: { label: string; icon?: React.ReactNode; value: string; options: Option[]; onChange: (value: string) => void }) {
  return <div className="min-w-0"><p className="mb-2 flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[.16em] text-slate-500">{icon}{label}</p><div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-1">{options.map(([key, text]) => <Chip key={key} active={value === key} label={text} onClick={() => onChange(key)} />)}</div></div>
}

function Chip({ active, label, onClick, compact }: { active: boolean; label: string; onClick: () => void; compact?: boolean }) {
  return <button type="button" aria-pressed={active} onClick={onClick} className={`shrink-0 rounded-xl border font-bold transition ${compact ? 'px-3 py-2 text-xs' : 'px-3.5 py-2 text-sm'} ${active ? 'border-violet-300/50 bg-violet-400 text-slate-950 shadow-lg shadow-violet-500/15' : 'border-white/8 bg-white/4 text-slate-400 hover:border-white/15 hover:bg-white/8 hover:text-white'}`}>{label}</button>
}
