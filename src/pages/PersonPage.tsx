import { ArrowLeft, Calendar, LoaderCircle, MapPin } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { CreditGrid } from '../features/people/components/CreditGrid'
import { usePerson } from '../features/people/usePeople'
import { AppHeader } from './components/AppHeader'
import { ExpandableText } from '../shared/ui/ExpandableText'
import { mediaUrl } from '../shared/lib/mediaUrl'

export function PersonPage() {
  const { catalogId } = useParams()
  const person = usePerson(catalogId)
  if (person.isLoading) return <main className="grid min-h-screen place-items-center bg-[#090914] text-white"><LoaderCircle className="animate-spin text-violet-300" /></main>
  if (!person.data) return <main className="grid min-h-screen place-items-center bg-[#090914] text-white"><Link to="/" className="flex items-center gap-2"><ArrowLeft size={17} />Вернуться к поиску</Link></main>
  const item = person.data
  return (
    <main className="min-h-screen bg-[#090914] text-white"><div className="aurora pointer-events-none fixed inset-0 opacity-50" /><AppHeader /><div className="relative mx-auto max-w-7xl px-5 py-12 lg:px-8"><Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"><ArrowLeft size={16} />К поиску</Link><section className="mt-8 grid gap-8 md:grid-cols-[240px_1fr]"><div className="aspect-[3/4] overflow-hidden rounded-3xl bg-white/5">{item.photoUrl && <img src={mediaUrl(item.photoUrl)} alt={item.name} className="h-full w-full object-cover" />}</div><div className="self-center"><p className="text-xs font-black uppercase tracking-[.2em] text-violet-300">{item.department ?? 'Актёр'}</p><h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">{item.name}</h1><div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-400">{item.birthday && <span className="flex items-center gap-2"><Calendar size={16} />{new Date(item.birthday).toLocaleDateString('ru-RU')}</span>}{item.placeOfBirth && <span className="flex items-center gap-2"><MapPin size={16} />{item.placeOfBirth}</span>}</div>{item.biography && <ExpandableText text={item.biography} className="mt-6 max-w-3xl text-sm leading-7 text-slate-300" lines={4} />}</div></section><section className="mt-10"><h2 className="mb-6 text-2xl font-black">Фильмы и сериалы · {item.credits.length}</h2><CreditGrid items={item.credits} /></section></div></main>
  )
}
