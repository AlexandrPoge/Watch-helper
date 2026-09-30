import { Sparkles } from 'lucide-react'
import type { Movie } from '../../../entities/movie/model'
import { useTasteProfile } from '../useTasteProfile'

export function RecommendationReason({ movie }: { movie: Movie }) {
  const taste = useTasteProfile()
  const selected = new Set(taste.genres.map(normalize))
  const matched = (movie.genres ?? []).filter((genre) => selected.has(normalize(genre)))
  const reason = matched.length
    ? `Совпадает с твоими жанрами: ${matched.join(', ')}.`
    : movie.rating && movie.rating >= 7.5
      ? `Высокая оценка ${movie.rating.toFixed(1)} и сильный отклик зрителей.`
      : 'Подходит для расширения твоего профиля вкуса.'
  return <section className="rounded-3xl border border-violet-300/15 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/5 p-6 sm:p-8"><p className="flex items-center gap-2 text-xs font-black uppercase tracking-[.18em] text-violet-300"><Sparkles size={15} /> Почему это может тебе понравиться</p><p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">{reason} Оцени после просмотра — следующие рекомендации станут точнее.</p></section>
}

const normalize = (value: string) => value.toLocaleLowerCase('ru-RU')
