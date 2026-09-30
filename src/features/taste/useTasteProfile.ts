import { useSyncExternalStore } from 'react'
import type { Movie } from '../../entities/movie/model'
import { getTaste, reactToMovie, subscribeTaste, toggleTasteGenre } from './tasteStore'

export function useTasteProfile() {
  const state = useSyncExternalStore(subscribeTaste, getTaste, getTaste)
  return {
    ...state,
    likes: state.reactions.filter((item) => item.value === 'like'),
    dislikes: state.reactions.filter((item) => item.value === 'dislike'),
    reactionFor: (id: Movie['id']) => state.reactions.find((item) => String(item.movie.id) === String(id))?.value,
    react: reactToMovie,
    toggleGenre: toggleTasteGenre,
  }
}
