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
  return <nav aria-label="Мобильная навигация" className="tech-dock fixed inset-x-3 bottom-3 z-50 grid grid-cols-5 rounded-2xl border border-white/10 bg-[#11111d]/92 p-1.5 backdrop-blur-2xl md:hidden">{items.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} className={({ isActive }) => `flex min-w-0 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] font-bold transition ${isActive ? 'bg-violet-400/18 text-violet-200 shadow-[inset_0_1px_rgb(255_255_255/.08)]' : 'text-slate-500'}`}><Icon size={18} /><span className="truncate">{label}</span></NavLink>)}</nav>
}
