import { ArrowRight, Crown, UsersRound } from 'lucide-react'
import { Link } from 'react-router-dom'

export function RoomCard() {
  return (
    <section id="rooms" className="relative mt-8 overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 p-6 sm:p-8">
      <div className="absolute -right-16 -top-20 size-52 rounded-full bg-fuchsia-500/20 blur-3xl" />
      <div className="relative grid gap-7 md:grid-cols-[1fr_auto] md:items-center">
        <div><p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-fuchsia-300"><UsersRound size={14} /> Вечер с друзьями</p><h2 className="max-w-xl text-2xl font-bold tracking-tight sm:text-3xl">Больше не спорьте, что включить</h2><p className="mt-3 max-w-lg text-sm leading-6 text-slate-400">Создай комнату, позови друзей — watchly найдёт фильм, который понравится всем.</p><Link to="/rooms/new" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-violet-100">Создать кинокомнату <ArrowRight size={16} /></Link></div>
        <div className="w-full min-w-60 rounded-2xl border border-white/10 bg-slate-950/60 p-4 backdrop-blur sm:w-72"><div className="flex items-center justify-between text-xs text-slate-400"><span>Субботний просмотр</span><Crown size={15} className="text-amber-300" /></div><div className="mt-4 flex -space-x-2">{['А', 'М', 'Д', 'И'].map((letter, index) => <span key={letter} className="grid size-9 place-items-center rounded-full border-2 border-slate-950 bg-gradient-to-br from-violet-400 to-fuchsia-500 text-xs font-bold" style={{ zIndex: 4 - index }}>{letter}</span>)}<span className="grid size-9 place-items-center rounded-full border-2 border-slate-950 bg-slate-700 text-xs font-bold">+2</span></div><div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full w-3/4 rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400" /></div><p className="mt-2 text-xs text-slate-400">4 из 6 уже выбрали фильмы</p></div>
      </div>
    </section>
  )
}
