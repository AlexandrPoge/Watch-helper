import { Dices, Heart, ListVideo, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AppHeader } from './components/AppHeader'

const actions = [
  { to: '/random', icon: Dices, title: 'Случайный выбор', text: 'Один фильм без долгих поисков.' },
  { to: '/rooms/new?mode=couple', icon: Heart, title: 'Выбрать вдвоём', text: 'Найдите общее совпадение.' },
  { to: '/series', icon: ListVideo, title: 'Каталог сериалов', text: 'Фильтры, оценки и подробности.' },
]

export function ProfilePage() {
  return <main className="min-h-screen bg-[#090914] text-white"><div className="aurora pointer-events-none fixed inset-0 opacity-60" /><AppHeader /><div className="relative mx-auto max-w-5xl px-5 py-14 lg:px-8"><section className="rounded-[2rem] border border-white/10 bg-white/5 p-7 sm:p-10"><div className="flex flex-col gap-6 sm:flex-row sm:items-center"><span className="grid size-24 place-items-center rounded-3xl bg-gradient-to-br from-amber-300 to-rose-500 text-3xl font-black text-slate-950">АП</span><div><p className="flex items-center gap-2 text-xs font-black uppercase tracking-[.2em] text-violet-300"><Sparkles size={14} /> Профиль вкуса</p><h1 className="mt-2 text-4xl font-black">Твой киноцентр</h1><p className="mt-2 text-slate-400">История и постоянный список появятся после подключения авторизации.</p></div></div></section><section className="mt-8 grid gap-4 md:grid-cols-3">{actions.map(({ to, icon: Icon, title, text }) => <Link key={to} to={to} className="group rounded-3xl border border-white/8 bg-white/4 p-6 transition hover:-translate-y-1 hover:border-violet-300/30"><Icon className="text-violet-300" /><h2 className="mt-6 text-xl font-bold group-hover:text-violet-300">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{text}</p></Link>)}</section></div></main>
}
