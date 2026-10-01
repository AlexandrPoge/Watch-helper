import { env } from '../config/env'
import type { CatalogItem } from './types'

export type RandomMovieFilters = { genre?: string; maxRuntime?: number }
const genreIds: Record<string, number> = { action: 28, comedy: 35, drama: 18, fantasy: 14, horror: 27, romance: 10749, sciFi: 878, thriller: 53 }
const genreNames: Record<number, string> = { 12: 'Приключения', 14: 'Фэнтези', 16: 'Анимация', 18: 'Драма', 27: 'Ужасы', 28: 'Боевик', 35: 'Комедия', 36: 'История', 53: 'Триллер', 80: 'Криминал', 99: 'Документальный', 878: 'Фантастика', 9648: 'Детектив', 10749: 'Романтика', 10751: 'Семейный' }

export async function getRandomMovie(filters: RandomMovieFilters): Promise<CatalogItem | null> {
  if (!env.tmdbApiKey) return null
  const url = new URL('https://api.themoviedb.org/3/discover/movie')
  url.searchParams.set('api_key', env.tmdbApiKey)
  url.searchParams.set('language', 'ru-RU')
  url.searchParams.set('include_adult', 'false')
  url.searchParams.set('sort_by', 'popularity.desc')
  url.searchParams.set('vote_average.gte', '6.5')
  url.searchParams.set('vote_count.gte', '300')
  url.searchParams.set('page', String(1 + Math.floor(Math.random() * 20)))
  if (filters.genre && genreIds[filters.genre]) url.searchParams.set('with_genres', String(genreIds[filters.genre]))
  if (filters.maxRuntime) url.searchParams.set('with_runtime.lte', String(filters.maxRuntime))
  const response = await fetch(url, { signal: AbortSignal.timeout(4_000) })
  if (!response.ok) throw new Error(`TMDB returned ${response.status}`)
  const data = await response.json() as { results: TmdbMovie[] }
  const item = data.results[Math.floor(Math.random() * data.results.length)]
  return item ? mapMovie(item) : null
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
  if (filters.genre && genreIds[filters.genre]) url.searchParams.set('with_genres', String(genreIds[filters.genre]))
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
  return shuffled.slice(0, count).map(mapMovie)
}

function mapMovie(item: TmdbMovie): CatalogItem {
  return { id: `tmdb:movie:${item.id}`, title: item.title, originalTitle: item.original_title, kind: 'movie', year: Number(item.release_date?.slice(0, 4)) || undefined, overview: item.overview, posterUrl: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : undefined, backdropUrl: item.backdrop_path ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}` : undefined, rating: item.vote_average, voteCount: item.vote_count, genres: item.genre_ids?.flatMap((id) => genreNames[id] ? [genreNames[id]] : []), match: Math.round(item.vote_average * 10), sourceNames: ['TMDB'] }
}

type TmdbMovie = { id: number; title: string; original_title?: string; release_date?: string; overview?: string; poster_path?: string; backdrop_path?: string; genre_ids?: number[]; vote_average: number; vote_count?: number }
