import { Link } from 'react-router-dom'
import type { RoomRound } from '../../../entities/room/model'
import { mediaUrl } from '../../../shared/lib/mediaUrl'

export function RoomResult({ round }: { round: RoomRound }) {
  const winners = round.candidates.filter((item) => round.winners.includes(item.id))
  return <div className="mb-6"><p className="text-xs font-black uppercase tracking-[.18em] text-emerald-300">Итог раунда {round.ordinal}</p><h2 className="mt-2 text-2xl font-black">{winners.length > 1 ? 'У нас ничья!' : winners.length ? 'Фильм на вечер найден' : 'Совпадений пока нет'}</h2><p className="mt-2 text-sm text-slate-400">{winners.length ? 'Открой фильм или начни новый раунд.' : 'Измените настроение и попробуйте ещё раз.'}</p>{winners.length > 0 && <div className="mt-4 grid gap-3 sm:grid-cols-2">{winners.map((movie) => <Link key={movie.id} to={`/movies/${encodeURIComponent(movie.id)}`} className="flex items-center gap-3 rounded-2xl border border-emerald-300/20 bg-emerald-300/8 p-3 hover:bg-emerald-300/15"><img src={mediaUrl(movie.posterUrl)} alt="" loading="lazy" className="h-20 w-14 rounded-lg object-cover" /><span className="font-bold">{movie.title}</span></Link>)}</div>}</div>
}
