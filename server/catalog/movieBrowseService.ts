import { env } from '../config/env'
import { sortCatalogItems, type BrowseFilters } from './browseFilters'
import { mergeCatalogItems } from './catalogService'
import { movieGenres } from './randomDiscover'
import { tmdbGenreNames } from './tmdbGenres'
import type { CatalogItem } from './types'

const poiskGenres: Record<string, string> = { action: 'боевик', comedy: 'комедия', crime: 'криминал', documentary: 'документальный', drama: 'драма', fantasy: 'фэнтези', horror: 'ужасы', romance: 'мелодрама', sciFi: 'фантастика', thriller: 'триллер', animation: 'мультфильм' }

export async function browseMovies(filters: BrowseFilters) {
  const results = await Promise.allSettled([browseTmdb(filters), browsePoisk(filters)])
  const items = results.flatMap((result) => result.status === 'fulfilled' ? result.value : [])
  return sortCatalogItems(mergeCatalogItems(items), filters.sort).slice(0, 36)
}

async function browseTmdb(filters: BrowseFilters): Promise<CatalogItem[]> {
  if (!env.tmdbApiKey) return []
  const url = new URL('https://api.themoviedb.org/3/discover/movie')
  url.searchParams.set('api_key', env.tmdbApiKey)
  url.searchParams.set('language', 'ru-RU')
  url.searchParams.set('include_adult', 'false')
  url.searchParams.set('page', String(filters.page ?? 1))
  url.searchParams.set('sort_by', filters.sort === 'rating' ? 'vote_average.desc' : filters.sort === 'newest' ? 'primary_release_date.desc' : 'popularity.desc')
  if (filters.genre === 'animation') url.searchParams.set('with_genres', '16')
  else if (filters.genre && movieGenres[filters.genre]) url.searchParams.set('with_genres', String(movieGenres[filters.genre]))
  if (filters.year) url.searchParams.set('primary_release_year', filters.year)
  if (filters.rating) url.searchParams.set('vote_average.gte', filters.rating)
  if (filters.sort === 'rating') url.searchParams.set('vote_count.gte', '200')
  const response = await fetch(url, { signal: AbortSignal.timeout(4_000) })
  if (!response.ok) throw new Error(`TMDB returned ${response.status}`)
  return (await response.json() as { results: TmdbMovie[] }).results.map(mapTmdb)
}

async function browsePoisk(filters: BrowseFilters): Promise<CatalogItem[]> {
  if (!env.kinopoiskDevToken) return []
  const url = new URL('https://api.poiskkino.dev/v1.4/movie')
  url.searchParams.set('page', String(filters.page ?? 1))
  url.searchParams.set('limit', '20')
  url.searchParams.set('isSeries', 'false')
  url.searchParams.set('notNullFields', 'poster.url')
  if (filters.genre && poiskGenres[filters.genre]) url.searchParams.set('genres.name', poiskGenres[filters.genre])
  if (filters.year) url.searchParams.set('year', filters.year)
  if (filters.rating) url.searchParams.set('rating.kp', `${filters.rating}-10`)
  if (filters.sort === 'rating') url.searchParams.set('votes.kp', '200-10000000')
  const response = await fetch(url, { headers: { 'X-API-KEY': env.kinopoiskDevToken }, signal: AbortSignal.timeout(4_000) })
  if (!response.ok) throw new Error(`PoiskKino returned ${response.status}`)
  return (await response.json() as { docs: PoiskMovie[] }).docs.map(mapPoisk)
}

function mapTmdb(item: TmdbMovie): CatalogItem {
  return { id: `tmdb:movie:${item.id}`, title: item.title, originalTitle: item.original_title, kind: 'movie', year: Number(item.release_date?.slice(0, 4)) || undefined, overview: item.overview, posterUrl: image(item.poster_path, 'w500'), backdropUrl: image(item.backdrop_path, 'w1280'), rating: item.vote_average, voteCount: item.vote_count, genres: tmdbGenreNames(item.genre_ids), match: Math.min(99, Math.max(50, Math.round(item.popularity ?? 60))), sourceNames: ['TMDB'] }
}

function mapPoisk(item: PoiskMovie): CatalogItem {
  const popularity = Math.round(Math.log10((item.votes?.kp ?? 100) + 1) * 20)
  return { id: `kinopoisk:movie:${item.id}`, title: item.name?.trim() || item.alternativeName?.trim() || 'Без названия', originalTitle: item.alternativeName, kind: 'movie', year: item.year, overview: item.description, posterUrl: item.poster?.url, backdropUrl: item.backdrop?.url, rating: item.rating?.kp, voteCount: item.votes?.kp, genres: item.genres?.map(({ name }) => name), match: Math.min(99, Math.max(50, popularity)), sourceNames: ['PoiskKino'] }
}

const image = (path?: string, size = 'w500') => path ? `https://image.tmdb.org/t/p/${size}${path}` : undefined
type TmdbMovie = { id: number; title: string; original_title?: string; release_date?: string; overview?: string; poster_path?: string; backdrop_path?: string; vote_average?: number; vote_count?: number; popularity?: number; genre_ids?: number[] }
type PoiskMovie = { id: number; name?: string; alternativeName?: string; year?: number; description?: string; poster?: { url?: string }; backdrop?: { url?: string }; rating?: { kp?: number }; votes?: { kp?: number }; genres?: { name: string }[] }
