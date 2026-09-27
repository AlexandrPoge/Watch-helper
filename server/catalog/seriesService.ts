import { env } from '../config/env'
import { mergeCatalogItems } from './catalogService'
import type { CatalogItem } from './types'

export type SeriesFilters = {
  genre?: string
  year?: string
  rating?: string
  sort?: 'popular' | 'rating' | 'newest'
  page?: number
}

const genreIds: Record<string, number> = {
  comedy: 35, crime: 80, documentary: 99, drama: 18, fantasy: 10765,
  mystery: 9648, romance: 10749, sciFi: 10765, thriller: 9648,
}
const genreNames: Record<string, string> = {
  comedy: 'комедия', crime: 'криминал', documentary: 'документальный', drama: 'драма',
  fantasy: 'фэнтези', mystery: 'детектив', romance: 'мелодрама', sciFi: 'фантастика', thriller: 'триллер',
}

export async function browseSeries(filters: SeriesFilters) {
  const results = await Promise.allSettled([browseTmdb(filters), browsePoiskKino(filters)])
  const items = results.flatMap((result) => result.status === 'fulfilled' ? result.value : [])
  return sortSeries(mergeCatalogItems(items), filters.sort ?? 'popular').slice(0, 36)
}

async function browseTmdb(filters: SeriesFilters): Promise<CatalogItem[]> {
  if (!env.tmdbApiKey) return []
  const url = new URL('https://api.themoviedb.org/3/discover/tv')
  setCommon(url, filters)
  url.searchParams.set('language', 'ru-RU')
  url.searchParams.set('include_adult', 'false')
  url.searchParams.set('api_key', env.tmdbApiKey)
  url.searchParams.set('sort_by', tmdbSort(filters.sort))
  if (filters.genre && genreIds[filters.genre]) url.searchParams.set('with_genres', String(genreIds[filters.genre]))
  if (filters.year) url.searchParams.set('first_air_date_year', filters.year)
  if (filters.rating) url.searchParams.set('vote_average.gte', filters.rating)
  if (filters.sort === 'rating') url.searchParams.set('vote_count.gte', '200')
  const response = await fetch(url, { signal: AbortSignal.timeout(4_000) })
  if (!response.ok) throw new Error(`TMDB returned ${response.status}`)
  const data = await response.json() as { results: TmdbSeries[] }
  return data.results.map(mapTmdbSeries)
}

async function browsePoiskKino(filters: SeriesFilters): Promise<CatalogItem[]> {
  if (!env.kinopoiskDevToken) return []
  const url = new URL('https://api.poiskkino.dev/v1.4/movie')
  setCommon(url, filters)
  url.searchParams.set('isSeries', 'true')
  url.searchParams.set('notNullFields', 'poster.url')
  if (filters.genre && genreNames[filters.genre]) url.searchParams.set('genres.name', genreNames[filters.genre])
  if (filters.year) url.searchParams.set('year', filters.year)
  if (filters.rating) url.searchParams.set('rating.kp', `${filters.rating}-10`)
  if (filters.sort === 'rating') url.searchParams.set('votes.kp', '200-10000000')
  const response = await fetch(url, { headers: { 'X-API-KEY': env.kinopoiskDevToken }, signal: AbortSignal.timeout(4_000) })
  if (!response.ok) throw new Error(`PoiskKino returned ${response.status}`)
  const data = await response.json() as { docs: PoiskSeries[] }
  return data.docs.map(mapPoiskSeries)
}

function setCommon(url: URL, filters: SeriesFilters) {
  url.searchParams.set('page', String(filters.page ?? 1))
  url.searchParams.set('limit', '20')
}

function tmdbSort(sort?: string) {
  if (sort === 'rating') return 'vote_average.desc'
  if (sort === 'newest') return 'first_air_date.desc'
  return 'popularity.desc'
}

function sortSeries(items: CatalogItem[], sort: string) {
  return [...items].sort((a, b) => {
    if (sort === 'newest') return (b.year ?? 0) - (a.year ?? 0)
    if (sort === 'rating') return (b.rating ?? 0) - (a.rating ?? 0)
    return b.match - a.match
  })
}

type TmdbSeries = { id: number; name: string; original_name?: string; first_air_date?: string; overview?: string; poster_path?: string; backdrop_path?: string; vote_average?: number; vote_count?: number; popularity?: number }
type PoiskSeries = { id: number; name?: string; alternativeName?: string; year?: number; description?: string; poster?: { url?: string }; backdrop?: { url?: string }; rating?: { kp?: number }; votes?: { kp?: number }; genres?: { name: string }[] }

function mapTmdbSeries(item: TmdbSeries): CatalogItem {
  return { id: `tmdb:series:${item.id}`, title: item.name, originalTitle: item.original_name, kind: 'series', year: Number(item.first_air_date?.slice(0, 4)) || undefined, overview: item.overview, posterUrl: image(item.poster_path, 'w500'), backdropUrl: image(item.backdrop_path, 'w1280'), rating: item.vote_average, voteCount: item.vote_count, match: Math.min(99, Math.max(50, Math.round(item.popularity ?? 60))), sourceNames: ['TMDB'] }
}

function mapPoiskSeries(item: PoiskSeries): CatalogItem {
  const popularity = Math.round(Math.log10((item.votes?.kp ?? 100) + 1) * 20)
  return { id: `kinopoisk:series:${item.id}`, title: item.name ?? item.alternativeName ?? 'Без названия', originalTitle: item.alternativeName, kind: 'series', year: item.year, overview: item.description, posterUrl: item.poster?.url, backdropUrl: item.backdrop?.url, rating: item.rating?.kp, voteCount: item.votes?.kp, genres: item.genres?.map(({ name }) => name), match: Math.min(99, Math.max(50, popularity)), sourceNames: ['PoiskKino'] }
}

const image = (path?: string, size = 'w500') => path ? `https://image.tmdb.org/t/p/${size}${path}` : undefined
