import { Link } from 'react-router-dom'
import type { RoomRound } from '../../../entities/room/model'

export function RoomHistory({ history }: { history: Pick<RoomRound, 'id' | 'ordinal' | 'status' | 'blind' | 'winners' | 'candidates'>[] }) {
  if (!history.length) return null
  return <section className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6"><h2 className="text-lg font-black">История выбора</h2><div className="mt-3 grid gap-2">{history.map((round) => <div key={round.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-black/20 p-3 text-sm"><span className="text-slate-400">Раунд {round.ordinal}{round.blind ? ' ✦' : ''}</span><span>{round.winners.length ? round.candidates.filter((item) => round.winners.includes(item.id)).map((item) => <Link key={item.id} to={`/movies/${encodeURIComponent(item.id)}`} className="mr-2 font-bold text-violet-200 hover:underline">{item.title}</Link>) : 'Без совпадения'}</span></div>)}</div></section>
}
