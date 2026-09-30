import { BarChart3, CalendarDays, Clapperboard, Globe2 } from 'lucide-react'
import type { SeriesDetails } from '../../../entities/movie/model'

export function SeriesFacts({ item }: { item: SeriesDetails }) {
  const facts = [
    { icon: <Clapperboard />, label: 'Статус', value: translateStatus(item.status) },
    { icon: <Globe2 />, label: 'Страна', value: item.country },
    { icon: <CalendarDays />, label: 'Премьера', value: item.year ? String(item.year) : undefined },
    { icon: <BarChart3 />, label: 'Оценок', value: item.voteCount ? compact(item.voteCount) : undefined },
  ].filter(({ value }) => value)
  return (
    <section>
      <h2 className="mb-4 text-xl font-black">О {item.kind === 'movie' ? 'фильме' : 'сериале'}</h2>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{facts.map((fact) => <div key={fact.label} className="rounded-2xl border border-white/8 bg-white/4 p-4"><span className="mb-4 grid size-9 place-items-center rounded-xl bg-violet-400/12 text-violet-300">{fact.icon}</span><p className="text-xs text-slate-500">{fact.label}</p><p className="mt-1 truncate text-sm font-bold">{fact.value}</p></div>)}</div>
      {item.genres?.length ? <div className="mt-5 flex flex-wrap gap-2">{item.genres.map((genre) => <span key={genre} className="rounded-full border border-white/10 bg-white/4 px-3 py-1.5 text-xs font-medium text-slate-300">{genre}</span>)}</div> : null}
    </section>
  )
}

const compact = (value: number) => new Intl.NumberFormat('ru', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
const translateStatus = (status?: string) => ({ Returning: 'Продолжается', 'Returning Series': 'Продолжается', Ended: 'Завершён', Released: 'Выпущен', Planned: 'Запланирован', Pilot: 'Пилот' }[status ?? ''] ?? status)
