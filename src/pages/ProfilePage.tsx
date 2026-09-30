import { Dices, Heart, ListVideo, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AppHeader } from './components/AppHeader'
import { SavedShelf } from '../features/library/components/SavedShelf'
import { useWatchlist } from '../features/library/useWatchlist'
import { TastePreferences } from '../features/taste/components/TastePreferences'
import { useTasteProfile } from '../features/taste/useTasteProfile'

const actions = [
  { to: '/random', icon: Dices, title: 'Случайный выбор', text: 'Один фильм без долгих поисков.' },
  { to: '/rooms/new?mode=couple', icon: Heart, title: 'Выбрать вдвоём', text: 'Найдите общее совпадение.' },
  { to: '/series', icon: ListVideo, title: 'Каталог сериалов', text: 'Фильтры, оценки и подробности.' },
]

export function ProfilePage() {
  const watchlist = useWatchlist()
  const taste = useTasteProfile()
  return <main className="min-h-screen bg-[#090914] text-white"><div className="aurora pointer-events-none fixed inset-0 opacity-60" /><AppHeader /><div className="reveal-sequence relative mx-auto max-w-5xl px-5 py-14 lg:px-8"><section className="tech-panel rounded-[2rem] border border-white/10 bg-white/5 p-7 sm:p-10"><div className="flex flex-col gap-6 sm:flex-row sm:items-center"><span className="grid size-24 place-items-center rounded-3xl bg-gradient-to-br from-amber-300 to-rose-500 text-3xl font-black text-slate-950 shadow-2xl shadow-rose-500/20">АП</span><div><p className="flex items-center gap-2 text-xs font-black uppercase tracking-[.2em] text-violet-300"><Sparkles size={14} /> Профиль вкуса</p><h1 className="mt-2 text-4xl font-black">Твой киноцентр</h1><p className="mt-2 text-slate-400">Сохранения и оценки работают без регистрации на этом устройстве.</p></div></div><div className="mt-8 grid grid-cols-3 gap-3"><Stat value={watchlist.items.length} label="В списке" /><Stat value={taste.likes.length} label="Нравится" /><Stat value={taste.genres.length} label="Жанров" /></div></section><TastePreferences /><SavedShelf /><section className="mt-8 grid gap-4 md:grid-cols-3">{actions.map(({ to, icon: Icon, title, text }) => <Link key={to} to={to} className="tech-card group rounded-3xl border border-white/8 bg-white/4 p-6"><Icon className="text-violet-300" /><h2 className="mt-6 text-xl font-bold group-hover:text-violet-300">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{text}</p></Link>)}</section></div></main>
}

function Stat({ value, label }: { value: number; label: string }) {
  return <div className="tech-card rounded-2xl border border-white/5 bg-black/20 p-4"><p className="text-2xl font-black">{value}</p><p className="mt-1 text-xs text-slate-500">{label}</p></div>
}
