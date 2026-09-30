import { Bookmark, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { MovieCard } from '../../movies/components/MovieCard'
import { useWatchlist } from '../useWatchlist'

export function SavedShelf() {
  const watchlist = useWatchlist()
  if (!watchlist.items.length) {
    return <section className="mt-8 rounded-3xl border border-dashed border-white/15 bg-white/3 px-6 py-14 text-center"><Bookmark className="mx-auto text-violet-300" /><h2 className="mt-4 text-xl font-black">Список пока пуст</h2><p className="mt-2 text-sm text-slate-500">Добавляй фильмы и сериалы — они останутся здесь даже после перезагрузки.</p><Link to="/" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-slate-950"><Search size={17} />Найти кино</Link></section>
  }
  return (
    <section className="mt-10"><div className="mb-5 flex items-end justify-between"><div><p className="text-xs font-black uppercase tracking-[.18em] text-violet-300">Посмотреть позже</p><h2 className="mt-2 text-2xl font-black">Твоя библиотека</h2></div><span className="text-sm text-slate-500">{watchlist.items.length} сохранено</span></div><div className="no-scrollbar flex gap-3 overflow-x-auto pb-4">{watchlist.items.map((movie) => <MovieCard key={movie.id} movie={movie} saved onSave={watchlist.toggle} />)}</div></section>
  )
}
