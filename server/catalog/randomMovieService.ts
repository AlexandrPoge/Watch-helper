import { env } from '../config/env'
import type { CatalogItem } from './types'
import { movieGenres, randomDiscoverUrl, type RandomFilters } from './randomDiscover'
import { tmdbGenreNames } from './tmdbGenres'
import { getRandomPoisk } from './randomPoisk'

export type RandomMovieFilters = { genre?: string; maxRuntime?: number }

export async function getRandomMovie(filters: RandomFilters & { excludeId?: string }): Promise<CatalogItem | null> {
  if ((filters.country === 'RU' || filters.country === 'SU') && env.kinopoiskDevToken) {
    try {
      const item = await getRandomPoisk(filters, env.kinopoiskDevToken)
      if (item) return item
    } catch (error) {
      console.warn('PoiskKino random unavailable', error)
    }
  }
  if (!env.tmdbApiKey) return null
  const page = 1 + Math.floor(Math.random() * 20)
  const items = await discover(randomDiscoverUrl(env.tmdbApiKey, filters, page))
  const pool = items.length ? items : page === 1 ? [] : await discover(randomDiscoverUrl(env.tmdbApiKey, filters, 1))
  const alternatives = pool.filter((item) => `tmdb:${filters.kind === 'series' ? 'series' : 'movie'}:${item.id}` !== filters.excludeId)
  const item = (alternatives.length ? alternatives : pool)[Math.floor(Math.random() * (alternatives.length || pool.length))]
  return item ? filters.kind === 'series' ? mapSeries(item) : mapMovie(item, filters.country) : null
}

async function discover(url: URL): Promise<TmdbItem[]> {
  const response = await fetch(url, { signal: AbortSignal.timeout(4_000) })
  if (!response.ok) throw new Error(`TMDB returned ${response.status}`)
  return (await response.json() as { results: TmdbItem[] }).results ?? []
}

export async function getVotingMovies(count = 10, filters: RandomMovieFilters = {}) {
  if (!env.tmdbApiKey) return []
  const url = new URL('https://api.themoviedb.org/3/discover/movie')
  url.searchParams.set('api_key', env.tmdbApiKey)
  url.searchParams.set('language', 'ru-RU')
  url.searchParams.set('include_adult', 'false')
  url.searchParams.set('vote_average.gte', '6.5')
  url.searchParams.set('vote_count.gte', '300')
  url.searchParams.set('page', String(1 + Math.floor(Math.random() * 15)))
  if (filters.genre && movieGenres[filters.genre]) url.searchParams.set('with_genres', String(movieGenres[filters.genre]))
  if (filters.maxRuntime) url.searchParams.set('with_runtime.lte', String(filters.maxRuntime))
  const response = await fetch(url, { signal: AbortSignal.timeout(4_000) })
  if (!response.ok) return []
  const data = await response.json() as { results: TmdbMovie[] }
  const shuffled = [...data.results]
  for (let index = shuffled.length - 1; index > 0; index--) {
    const swap = Math.floor(Math.random() * (index + 1))
    const item = shuffled[index]
    shuffled[index] = shuffled[swap]
    shuffled[swap] = item
  }
  return shuffled.slice(0, count).map((item) => mapMovie(item))
}

function mapMovie(item: TmdbItem, country?: string): CatalogItem {
  return { id: `tmdb:movie:${item.id}`, title: item.title ?? 'Без названия', originalTitle: item.original_title, kind: 'movie', year: Number(item.release_date?.slice(0, 4)) || undefined, overview: item.overview, posterUrl: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : undefined, backdropUrl: item.backdrop_path ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}` : undefined, rating: item.vote_average, voteCount: item.vote_count, genres: tmdbGenreNames(item.genre_ids), originCountries: country ? [country] : undefined, match: Math.round((item.vote_average ?? 6) * 10), sourceNames: ['TMDB'] }
}

function mapSeries(item: TmdbItem): CatalogItem {
  return { id: `tmdb:series:${item.id}`, title: item.name ?? 'Без названия', originalTitle: item.original_name, kind: 'series', year: Number(item.first_air_date?.slice(0, 4)) || undefined, overview: item.overview, posterUrl: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : undefined, backdropUrl: item.backdrop_path ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}` : undefined, rating: item.vote_average, voteCount: item.vote_count, genres: tmdbGenreNames(item.genre_ids), originCountries: item.origin_country, match: Math.round((item.vote_average ?? 6) * 10), sourceNames: ['TMDB'] }
}

type TmdbItem = { id: number; title?: string; name?: string; original_title?: string; original_name?: string; release_date?: string; first_air_date?: string; overview?: string; poster_path?: string; backdrop_path?: string; genre_ids?: number[]; origin_country?: string[]; vote_average?: number; vote_count?: number }
type TmdbMovie = TmdbItem
