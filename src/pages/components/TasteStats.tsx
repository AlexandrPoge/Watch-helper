import { UsersRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTasteProfile } from '../../features/taste/useTasteProfile'

type TasteStatsProps = { savedCount: number }

export function TasteStats({ savedCount }: TasteStatsProps) {
  const taste = useTasteProfile()
  const metrics = [
    ['Понравилось', String(taste.likes.length).padStart(2, '0'), 'Учит рекомендации'],
    ['Любимые жанры', String(taste.genres.length).padStart(2, '0'), taste.genres.slice(0, 2).join(' · ') || 'Настрой в профиле'],
    ['В списке на потом', String(savedCount).padStart(2, '0'), 'Не потеряй их'],
  ]
  return (
    <section id="watchlist" className="tech-panel mt-14 rounded-3xl border border-white/8 bg-white/4 p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-violet-300"><UsersRound size={14} /> Твой вкус в цифрах</p><h2 className="mt-2 text-2xl font-bold">Ты уже знаешь, что тебе нравится</h2></div><Link to="/profile" className="rounded-xl border border-white/12 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/8">Открыть профиль</Link></div>
      <div className="mt-7 grid gap-4 sm:grid-cols-3">{metrics.map(([label, value, detail]) => <div key={label} className="rounded-2xl bg-slate-950/55 p-4"><p className="text-sm text-slate-400">{label}</p><p className="mt-3 text-3xl font-black tracking-tight">{value}</p><p className="mt-1 text-xs font-medium text-violet-300">{detail}</p></div>)}</div>
    </section>
  )
}
