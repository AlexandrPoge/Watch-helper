import type { Movie, SeriesDetails } from '../../../entities/movie/model'

export async function fetchMovieDetails(catalogId: string) {
  const response = await fetch(`/api/movies/${encodeURIComponent(catalogId)}`)
  if (!response.ok) throw new Error('Не удалось загрузить фильм.')
  const data = await response.json() as { item: SeriesDetails }
  return data.item
}

export async function fetchRandomMovie(filters: { genre?: string; maxRuntime?: string }) {
  const query = new URLSearchParams()
  if (filters.genre) query.set('genre', filters.genre)
  if (filters.maxRuntime) query.set('maxRuntime', filters.maxRuntime)
  const response = await fetch(`/api/movies/random?${query}`)
  if (!response.ok) throw new Error('Не удалось подобрать фильм.')
  const data = await response.json() as { item: Movie }
  return data.item
}
