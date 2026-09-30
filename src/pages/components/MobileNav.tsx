import { Dices, Home, Library, UserRound, UsersRound } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const items = [
  { to: '/', label: 'Главная', icon: Home, end: true },
  { to: '/series', label: 'Каталог', icon: Library },
  { to: '/random', label: 'Выбрать', icon: Dices },
  { to: '/rooms/new', label: 'Вместе', icon: UsersRound },
  { to: '/profile', label: 'Профиль', icon: UserRound },
]

export function MobileNav() {
  return <nav aria-label="Основная навигация" className="tech-dock fixed inset-x-2 bottom-2 z-50 grid grid-cols-5 rounded-2xl border border-white/10 bg-[#11111d]/92 p-1 backdrop-blur-2xl sm:inset-x-4 sm:bottom-4 sm:mx-auto sm:max-w-xl sm:p-1.5 xl:hidden">{items.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} className={({ isActive }) => `flex min-w-0 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[9px] font-bold transition sm:text-[10px] ${isActive ? 'bg-violet-400/18 text-violet-200 shadow-[inset_0_1px_rgb(255_255_255/.08)]' : 'text-slate-500'}`}><Icon size={18} /><span className="max-w-full truncate">{label}</span></NavLink>)}</nav>
}
