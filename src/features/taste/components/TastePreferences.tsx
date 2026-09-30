import { Sparkles } from 'lucide-react'
import { useTasteProfile } from '../useTasteProfile'

const genres = ['Фантастика', 'Драма', 'Комедия', 'Триллер', 'Детектив', 'Мелодрама', 'Фэнтези', 'Ужасы', 'Документальный']

export function TastePreferences() {
  const taste = useTasteProfile()
  return <section className="tech-panel mt-8 rounded-3xl border border-white/8 bg-white/4 p-6 sm:p-8"><p className="flex items-center gap-2 text-xs font-black uppercase tracking-[.18em] text-violet-300"><Sparkles size={14} /> Настрой вкус</p><h2 className="mt-2 text-2xl font-black">Какие истории тебе ближе?</h2><p className="mt-2 text-sm text-slate-500">Выбери жанры — они повлияют на порядок рекомендаций.</p><div className="mt-5 flex flex-wrap gap-2">{genres.map((genre) => { const active = taste.genres.includes(genre); return <button key={genre} aria-pressed={active} onClick={() => taste.toggleGenre(genre)} className={`interactive-control rounded-full border px-4 py-2 text-sm font-bold ${active ? 'border-violet-300 bg-violet-400 text-slate-950' : 'border-white/10 bg-black/20 text-slate-300 hover:bg-white/8'}`}>{genre}</button> })}</div></section>
}
