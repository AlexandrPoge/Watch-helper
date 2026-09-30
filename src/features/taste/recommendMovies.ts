import type { Movie } from '../../entities/movie/model'
import type { TasteReaction } from './tasteStore'

export function recommendMovies(items: Movie[], genres: string[], reactions: TasteReaction[]) {
  const likedGenres = reactions.filter((item) => item.value === 'like').flatMap((item) => item.movie.genres ?? [])
  const preferred = new Set([...genres, ...likedGenres].map(normalize))
  const disliked = new Set(reactions.filter((item) => item.value === 'dislike').map((item) => String(item.movie.id)))
  return [...items].sort((first, second) => score(second) - score(first))

  function score(movie: Movie) {
    const matches = (movie.genres ?? []).filter((genre) => preferred.has(normalize(genre))).length
    return movie.match + matches * 20 - (disliked.has(String(movie.id)) ? 100 : 0)
  }
}

const normalize = (value: string) => value.toLocaleLowerCase('ru-RU')
