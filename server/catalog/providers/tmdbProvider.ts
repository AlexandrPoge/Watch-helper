import { env } from '../../config/env'
import type { CatalogItem, CatalogProvider, MediaKind } from '../types'

type TmdbResult = {
  id: number
  media_type: 'movie' | 'tv' | 'person'
  title?: string
  name?: string
  original_title?: string
  original_name?: string
  release_date?: string
  first_air_date?: string
  overview?: string
  poster_path?: string
  popularity: number
}

type TmdbResponse = { results: TmdbResult[] }

export const tmdbProvider: CatalogProvider = {
  name: 'TMDB',
  isConfigured: Boolean(env.tmdbApiKey),
  async search(query) {
    if (!env.tmdbApiKey) return []
    const url = new URL('https://api.themoviedb.org/3/search/multi')
    url.searchParams.set('query', query)
    url.searchParams.set('language', 'ru-RU')
    url.searchParams.set('api_key', env.tmdbApiKey)
    const response = await fetch(url)
    if (!response.ok) throw new Error(`TMDB returned ${response.status}`)
    const data = await response.json() as TmdbResponse
    return data.results.filter((item) => item.media_type !== 'person').map(toCatalogItem)
  },
}

function toCatalogItem(item: TmdbResult): CatalogItem {
  const kind: MediaKind = item.media_type === 'movie' ? 'movie' : 'series'
  const date = kind === 'movie' ? item.release_date : item.first_air_date
  return {
    id: `tmdb:${kind}:${item.id}`,
    title: item.title ?? item.name ?? 'Без названия',
    originalTitle: item.original_title ?? item.original_name,
    kind,
    year: date ? Number.parseInt(date, 10) : undefined,
    overview: item.overview,
    posterUrl: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : undefined,
    match: Math.min(99, Math.max(50, Math.round(item.popularity))),
    sourceNames: ['TMDB'],
  }
}
