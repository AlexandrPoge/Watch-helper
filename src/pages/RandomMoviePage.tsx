import { useQuery } from '@tanstack/react-query'
import { Dices, LoaderCircle, Sparkles, Star } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchRandomMovie } from '../features/movies/api/movieApi'
import { AppHeader } from './components/AppHeader'

const genres = [['', 'Любой жанр'], ['comedy', 'Комедия'], ['drama', 'Драма'], ['thriller', 'Триллер'], ['sciFi', 'Фантастика'], ['fantasy', 'Фэнтези'], ['romance', 'Романтика'], ['horror', 'Ужасы']]

export function RandomMoviePage() {
  const [genre, setGenre] = useState('')
  const [maxRuntime, setMaxRuntime] = useState('')
  const [roll, setRoll] = useState(0)
  const random = useQuery({ queryKey: ['random-movie', genre, maxRuntime, roll], queryFn: () => fetchRandomMovie({ genre, maxRuntime }), staleTime: 0 })
  const movie = random.data
  return (
    <main className="min-h-screen overflow-hidden bg-[#090914] text-white"><div className="aurora pointer-events-none fixed inset-0 opacity-80" /><AppHeader /><div className="relative mx-auto max-w-6xl px-5 py-12 lg:px-8"><section className="text-center"><p className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-[.2em] text-violet-300"><Sparkles size={15} /> Решаем за тебя</p><h1 className="mt-3 text-4xl font-black tracking-[-.04em] sm:text-6xl">Что смотрим <span className="gradient-text">сегодня?</span></h1><p className="mx-auto mt-4 max-w-xl text-slate-400">Никаких бесконечных списков. Настрой настроение и получи один хороший вариант.</p></section><div className="mx-auto mt-8 flex max-w-xl flex-wrap justify-center gap-2"><Select value={genre} onChange={setGenre} options={genres} /><Select value={maxRuntime} onChange={setMaxRuntime} options={[['', 'Любая длительность'], ['90', 'До 1,5 часов'], ['120', 'До 2 часов'], ['150', 'До 2,5 часов']]} /></div><section className="mx-auto mt-9 max-w-4xl">{random.isLoading ? <div className="grid min-h-96 place-items-center rounded-[2rem] border border-white/8 bg-white/4"><div className="text-center"><LoaderCircle className="mx-auto animate-spin text-violet-300" size={34} /><p className="mt-3 text-sm text-slate-500">Перемешиваем кино…</p></div></div> : movie ? <div className="grid overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/80 shadow-2xl shadow-violet-950/30 md:grid-cols-[.75fr_1.25fr]"><div className="min-h-96 bg-slate-950">{movie.posterUrl && <img src={movie.posterUrl} alt={movie.title} className="h-full w-full object-cover" />}</div><div className="flex flex-col justify-center p-7 sm:p-10"><span className="flex w-fit items-center gap-1 rounded-full bg-amber-300 px-3 py-1 text-xs font-black text-amber-950"><Star size={13} fill="currentColor" />{movie.rating?.toFixed(1) ?? movie.match / 10}</span><h2 className="mt-5 text-3xl font-black sm:text-5xl">{movie.title}</h2><p className="mt-2 text-sm text-slate-500">{movie.year} · {movie.sourceNames?.join(' · ')}</p><p className="mt-5 line-clamp-5 text-sm leading-7 text-slate-300">{movie.overview || 'Отличный вариант для сегодняшнего вечера.'}</p><div className="mt-7 flex flex-wrap gap-3"><Link to={`/movies/${encodeURIComponent(String(movie.id))}`} className="rounded-xl bg-white px-5 py-3 text-sm font-black text-slate-950 hover:bg-violet-200">Подробнее</Link><button onClick={() => setRoll((value) => value + 1)} className="flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3 text-sm font-bold hover:bg-white/8"><Dices size={18} />Другой вариант</button></div></div></div> : <p className="text-center text-rose-300">Не удалось подобрать фильм. Попробуй ещё раз.</p>}</section></div>
    </main>
  )
}

function Select({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: string[][] }) {
  return <select value={value} onChange={(event) => onChange(event.target.value)} className="h-11 rounded-xl border border-white/10 bg-[#171725] px-4 text-sm font-medium outline-none hover:border-violet-300/40">{options.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>
}
