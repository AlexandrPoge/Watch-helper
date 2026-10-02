import { Bell, ChevronDown, Sparkles } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Logo } from '../../shared/ui/Logo'

export function AppHeader() {
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [lessEffects, setLessEffects] = useState(() => localStorage.getItem('watchly.less-effects') === 'true')
  useEffect(() => { document.documentElement.dataset.motion = lessEffects ? 'less' : 'full' }, [lessEffects])
  const toggleEffects = () => { const next = !lessEffects; setLessEffects(next); localStorage.setItem('watchly.less-effects', String(next)) }
  return (
    <header className="tech-header sticky top-0 z-30 border-b border-white/7 bg-[#090914]/70 backdrop-blur-2xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:h-18 sm:px-6 xl:px-8">
        <Logo />
        <div className="hidden items-center gap-5 text-sm font-medium text-slate-400 xl:flex"><HeaderLink to="/">Для тебя</HeaderLink><HeaderLink to="/movies">Фильмы</HeaderLink><HeaderLink to="/series">Сериалы</HeaderLink><HeaderLink to="/random">Случайный выбор</HeaderLink><HeaderLink to="/rooms/new">Комнаты</HeaderLink><HeaderLink to="/profile">Профиль</HeaderLink></div>
        <div className="flex items-center gap-2">
          <Link className="interactive-control hidden rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-bold shadow-lg shadow-violet-500/20 hover:bg-violet-400 lg:block" to="/rooms/new">Создать комнату</Link>
          <button onClick={toggleEffects} aria-label={lessEffects ? 'Включить эффекты' : 'Меньше эффектов'} aria-pressed={lessEffects} title={lessEffects ? 'Включить эффекты' : 'Меньше эффектов'} className="interactive-control grid size-10 place-items-center rounded-xl text-slate-300 hover:bg-white/8"><Sparkles size={18} /></button>
          <button onClick={() => setNotificationsOpen(!notificationsOpen)} aria-label="Уведомления" className="interactive-control grid size-10 place-items-center rounded-xl text-slate-300 hover:bg-white/8"><Bell size={19} /></button>
          <Link to="/profile" aria-label="Открыть профиль" className="hidden items-center gap-2 rounded-xl p-1 pr-2 text-sm font-medium hover:bg-white/8 sm:flex"><span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-amber-300 to-rose-500 text-xs font-black text-slate-950">АП</span><ChevronDown className="hidden lg:block" size={15} /></Link>
        </div>
        {notificationsOpen && <div className="tech-panel absolute right-5 top-16 w-72 rounded-2xl border border-white/10 bg-[#171725]/95 p-4 shadow-2xl"><p className="font-bold">Уведомления</p><p className="mt-2 text-sm leading-5 text-slate-400">Здесь появятся совпадения в комнатах и новые рекомендации.</p></div>}
      </nav>
    </header>
  )
}

function HeaderLink({ to, children }: { to: string; children: React.ReactNode }) {
  return <NavLink end={to === '/'} className={({ isActive }) => `relative py-6 transition hover:text-white ${isActive ? 'text-white after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:bg-violet-400' : ''}`} to={to}>{children}</NavLink>
}
