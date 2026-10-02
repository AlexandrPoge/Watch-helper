import type { Movie, SeriesDetails } from '../../../entities/movie/model'

export async function fetchMovieDetails(catalogId: string) {
  const response = await fetch(`/api/movies/${encodeURIComponent(catalogId)}`)
  if (!response.ok) throw new Error('Не удалось загрузить фильм.')
  const data = await response.json() as { item: SeriesDetails }
  return data.item
}

export async function fetchRandomMovie(filters: { kind: 'movie' | 'animation' | 'series'; genre?: string; country?: string; maxRuntime?: string; excludeId?: string }) {
  const query = new URLSearchParams()
  query.set('kind', filters.kind)
  if (filters.genre) query.set('genre', filters.genre)
  if (filters.country) query.set('country', filters.country)
  if (filters.maxRuntime) query.set('maxRuntime', filters.maxRuntime)
  if (filters.excludeId) query.set('excludeId', filters.excludeId)
  const response = await fetch(`/api/movies/random?${query}`)
  if (response.status === 404) return null
  if (!response.ok) throw new Error('Не удалось подобрать фильм.')
  const data = await response.json() as { item: Movie }
  return data.item
}
