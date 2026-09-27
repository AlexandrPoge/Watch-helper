import { UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { SeriesDetails } from '../../../entities/movie/model'

export function SeriesCast({ cast }: { cast: SeriesDetails['cast'] }) {
  if (!cast.length) return null
  return (
    <section><h2 className="mb-4 text-xl font-black">В главных ролях</h2><div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">{cast.map((person) => <CastPerson key={person.id} person={person} />)}</div></section>
  )
}

function CastPerson({ person }: { person: SeriesDetails['cast'][number] }) {
  const content = <><div className="aspect-[3/4] overflow-hidden rounded-2xl bg-white/5">{person.photoUrl ? <img src={person.photoUrl} alt={person.name} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" /> : <div className="grid h-full place-items-center text-slate-600"><UserRound size={26} /></div>}</div><h3 className="mt-2 line-clamp-2 text-sm font-bold leading-tight group-hover:text-violet-300">{person.name}</h3>{person.character && <p className="mt-1 line-clamp-2 text-xs leading-tight text-slate-500">{person.character}</p>}</>
  const className = 'group w-28 shrink-0'
  return person.id.startsWith('tmdb:') || person.id.startsWith('kinopoisk:') ? <Link to={`/people/${encodeURIComponent(person.id)}`} className={className}>{content}</Link> : <div className={className}>{content}</div>
}
