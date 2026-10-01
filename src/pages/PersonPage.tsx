import { ArrowLeft, Calendar, MapPin } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { CreditGrid } from '../features/people/components/CreditGrid'
import { usePerson } from '../features/people/usePeople'
import { ExpandableText } from '../shared/ui/ExpandableText'
import { mediaUrl } from '../shared/lib/mediaUrl'
import { AppHeader } from './components/AppHeader'
import { DetailState } from './components/DetailState'

export function PersonPage() {
  const { catalogId } = useParams()
  const person = usePerson(catalogId)
  if (!person.data) return <DetailState loading={person.isLoading} title="Не удалось открыть актёра" backTo="/" onRetry={() => void person.refetch()} />
  const item = person.data
  return (
    <main className="min-h-screen bg-[#090914] text-white"><div className="aurora pointer-events-none fixed inset-0 opacity-50" /><AppHeader />
      <div className="reveal-sequence relative mx-auto max-w-7xl px-4 py-9 sm:px-6 sm:py-12 xl:px-8"><Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"><ArrowLeft size={16} />К поиску</Link>
        <section className="tech-panel mt-8 grid gap-6 rounded-3xl border border-white/8 bg-white/4 p-4 sm:p-6 md:grid-cols-[minmax(180px,240px)_1fr] md:gap-8 xl:rounded-[2rem] xl:p-8"><div className="tech-card mx-auto aspect-[3/4] w-full max-w-60 overflow-hidden rounded-3xl bg-white/5">{item.photoUrl ? <img src={mediaUrl(item.photoUrl)} alt={item.name} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-slate-500">Фото пока нет</div>}</div><div className="self-center"><p className="text-xs font-black uppercase tracking-[.2em] text-violet-300">{item.department ?? 'Актёр'}</p><h1 className="mt-3 break-words text-3xl font-black tracking-tight sm:text-5xl xl:text-6xl">{item.name}</h1><div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-400">{item.birthday && <span className="flex items-center gap-2"><Calendar size={16} />{new Date(item.birthday).toLocaleDateString('ru-RU')}</span>}{(item.placeOfBirth || item.country) && <span className="flex items-center gap-2"><MapPin size={16} />{item.placeOfBirth ?? `Страна: ${item.country}`}</span>}</div>{item.biography ? <ExpandableText text={item.biography} className="mt-6 max-w-3xl text-sm leading-7 text-slate-300" lines={4} /> : <p className="mt-6 text-sm text-slate-400">Биография пока не опубликована в доступных источниках.</p>}{item.knownFor.length > 0 && <p className="mt-4 text-sm text-violet-200">Известен по: {item.knownFor.join(' · ')}</p>}</div></section>
        <section className="mt-10"><h2 className="mb-6 text-2xl font-black">Фильмы и сериалы · {item.credits.length}</h2>{item.credits.length ? <CreditGrid items={item.credits} /> : <p className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-400">Фильмография пока не найдена. Попробуй поискать актёра по имени.</p>}</section>
      </div>
    </main>
  )
}
