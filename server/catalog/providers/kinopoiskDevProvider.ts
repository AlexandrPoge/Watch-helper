import { env } from '../../config/env'
import type { CatalogItem, CatalogProvider, MediaKind } from '../types'

type KinopoiskMovie = {
  id: number
  name?: string
  alternativeName?: string
  type?: string
  year?: number
  description?: string
  poster?: { url?: string }
  backdrop?: { url?: string }
  rating?: { kp?: number }
  votes?: { kp?: number }
  genres?: { name: string }[]
}

type KinopoiskResponse = { docs: KinopoiskMovie[] }

export const poiskKinoProvider: CatalogProvider = {
  name: 'PoiskKino',
  isConfigured: Boolean(env.kinopoiskDevToken),
  async search(query) {
    if (!env.kinopoiskDevToken) return []
    const url = new URL('https://api.poiskkino.dev/v1.4/movie/search')
    url.searchParams.set('query', query)
    url.searchParams.set('limit', '20')
    const response = await fetch(url, { headers: { 'X-API-KEY': env.kinopoiskDevToken }, signal: AbortSignal.timeout(4_000) })
    if (!response.ok) throw new Error(`PoiskKino returned ${response.status}`)
    const data = await response.json() as KinopoiskResponse
    return data.docs.map(toCatalogItem)
  },
}

function toCatalogItem(movie: KinopoiskMovie): CatalogItem {
  const kind: MediaKind = movie.type?.includes('series') ? 'series' : 'movie'
  return {
    id: `kinopoisk:${kind}:${movie.id}`,
    title: movie.name?.trim() || movie.alternativeName?.trim() || 'Без названия',
    originalTitle: movie.alternativeName,
    kind,
    year: movie.year,
    overview: movie.description,
    posterUrl: movie.poster?.url,
    backdropUrl: movie.backdrop?.url,
    rating: movie.rating?.kp,
    voteCount: movie.votes?.kp,
    genres: movie.genres?.map(({ name }) => name),
    match: Math.round(Math.min(99, Math.max(50, (movie.rating?.kp ?? 5) * 10))),
    sourceNames: ['PoiskKino'],
  }
}
