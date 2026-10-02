import { countryOptions } from '../../../shared/constants/countries'
import { RandomKindPicker, type RandomKind } from './RandomKindPicker'

const genres: [string, string][] = [
  ['', 'Любой жанр'], ['comedy', 'Комедия'], ['drama', 'Драма'],
  ['thriller', 'Триллер'], ['sciFi', 'Фантастика'], ['fantasy', 'Фэнтези'],
  ['romance', 'Романтика'], ['horror', 'Ужасы'],
]
const runtimes: [string, string][] = [
  ['', 'Любая длительность'], ['30', 'До 30 минут'], ['60', 'До часа'],
  ['90', 'До 1,5 часов'], ['120', 'До 2 часов'], ['150', 'До 2,5 часов'],
]

type Props = {
  kind: RandomKind; genre: string; country: string; maxRuntime: string
  onKind: (value: RandomKind) => void; onGenre: (value: string) => void
  onCountry: (value: string) => void; onRuntime: (value: string) => void
  onReset: () => void
}

export function RandomFiltersPanel(props: Props) {
  return <section aria-label="Настройки выбора" className="tech-panel mt-5 rounded-3xl border border-white/10 bg-[#11111e]/95 p-4 sm:p-5">
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <h2 className="text-sm font-black uppercase tracking-[.16em] text-violet-200">Настрой случайный выбор</h2>
      <div className="flex items-center gap-2">
        <button type="button" aria-pressed={props.country === 'RU'} onClick={() => props.onCountry(props.country === 'RU' ? '' : 'RU')} className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${props.country === 'RU' ? 'border-violet-300 bg-violet-400 text-slate-950' : 'border-violet-300/30 text-violet-200 hover:bg-violet-400/10'}`}>Российское</button>
        {(props.genre || props.country || props.maxRuntime || props.kind !== 'movie') && <button type="button" onClick={props.onReset} className="text-xs font-bold text-slate-400 hover:text-white">Сбросить</button>}
      </div>
    </div>
    <RandomKindPicker value={props.kind} onChange={props.onKind} />
    <div className="mt-4 grid gap-3 sm:grid-cols-3">
      <Select label="Жанр" value={props.genre} options={genres} onChange={props.onGenre} />
      <Select label="Страна производства" value={props.country} options={countryOptions} onChange={props.onCountry} />
      <Select label={props.kind === 'series' ? 'Длина серии' : 'Длительность'} value={props.maxRuntime} options={runtimes} onChange={props.onRuntime} />
    </div>
    <p className="mt-3 text-xs text-slate-500">Страна производства не гарантирует доступность просмотра в этом регионе.</p>
  </section>
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: [string, string][] }) {
  return <label className="min-w-0 text-xs font-bold text-slate-400">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-[#1a1a2a] px-3 text-sm font-medium text-white outline-none focus:border-violet-300">{options.map(([key, text]) => <option key={key} value={key}>{text}</option>)}</select></label>
}
