import { Bell, ChevronDown, Menu } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Logo } from '../../shared/ui/Logo'

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/7 bg-[#090914]/75 backdrop-blur-xl">
      <nav className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Logo />
        <div className="hidden items-center gap-7 text-sm font-medium text-slate-400 md:flex"><Link className="text-white" to="/">Для тебя</Link><Link to="/rooms/new">Комнаты</Link><a href="/#watchlist">Мои списки</a></div>
        <div className="flex items-center gap-2">
          <Link className="hidden rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-bold shadow-lg shadow-violet-500/20 transition hover:bg-violet-400 sm:block" to="/rooms/new">Создать комнату</Link>
          <button aria-label="Уведомления" className="grid size-10 place-items-center rounded-xl text-slate-300 hover:bg-white/8"><Bell size={19} /></button>
          <button className="hidden items-center gap-2 rounded-xl p-1 pr-2 text-sm font-medium hover:bg-white/8 sm:flex"><span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-amber-300 to-rose-500 text-xs font-black text-slate-950">АП</span><ChevronDown size={15} /></button>
          <button aria-label="Меню" className="grid size-10 place-items-center rounded-xl hover:bg-white/8 md:hidden"><Menu size={21} /></button>
        </div>
      </nav>
    </header>
  )
}
