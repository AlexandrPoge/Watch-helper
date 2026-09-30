import { Heart, ThumbsDown } from 'lucide-react'
import type { Movie } from '../../../entities/movie/model'
import { useTasteProfile } from '../useTasteProfile'

export function TasteActions({ movie, onDislike }: { movie: Movie; onDislike?: () => void }) {
  const taste = useTasteProfile()
  const reaction = taste.reactionFor(movie.id)
  const choose = (value: 'like' | 'dislike') => {
    taste.react(movie, value)
    if (value === 'dislike' && reaction !== 'dislike') onDislike?.()
  }
  return <div className="flex gap-2"><button aria-pressed={reaction === 'like'} onClick={() => choose('like')} className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition ${reaction === 'like' ? 'border-emerald-300 bg-emerald-300 text-emerald-950' : 'border-white/15 bg-black/20 hover:bg-white/10'}`}><Heart size={18} fill={reaction === 'like' ? 'currentColor' : 'none'} />Нравится</button><button aria-pressed={reaction === 'dislike'} onClick={() => choose('dislike')} className={`grid size-11 place-items-center rounded-xl border transition ${reaction === 'dislike' ? 'border-rose-300 bg-rose-300 text-rose-950' : 'border-white/15 bg-black/20 hover:bg-white/10'}`} title="Не моё"><ThumbsDown size={18} /></button></div>
}
