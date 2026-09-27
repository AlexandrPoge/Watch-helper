import { UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Person } from '../../../entities/person/model'

export function PeopleResults({ people }: { people: Person[] }) {
  if (!people.length) return null
  return (
    <section className="mb-8"><p className="mb-4 text-xs font-black uppercase tracking-[.18em] text-violet-300">Актёры и создатели</p><div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">{people.map((person) => <Link key={person.id} to={`/people/${encodeURIComponent(person.id)}`} className="group flex min-w-60 items-center gap-3 rounded-2xl border border-white/8 bg-white/4 p-3 transition hover:border-violet-300/30 hover:bg-white/8"><div className="size-16 shrink-0 overflow-hidden rounded-xl bg-white/5">{person.photoUrl ? <img src={person.photoUrl} alt={person.name} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-slate-600"><UserRound /></div>}</div><div className="min-w-0"><h3 className="truncate font-bold group-hover:text-violet-300">{person.name}</h3><p className="mt-1 text-xs text-slate-500">{person.department ?? 'Кино'}</p><p className="mt-1 truncate text-xs text-slate-400">{person.knownFor.join(' · ')}</p></div></Link>)}</div></section>
  )
}
