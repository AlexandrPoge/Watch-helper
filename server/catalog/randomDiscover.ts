export type RandomKind = 'movie' | 'animation' | 'series'
export type RandomFilters = { kind?: RandomKind; genre?: string; maxRuntime?: number }

export const movieGenres: Record<string, number> = { action: 28, comedy: 35, drama: 18, fantasy: 14, horror: 27, romance: 10749, sciFi: 878, thriller: 53 }
const seriesGenres: Record<string, number> = { action: 10759, comedy: 35, drama: 18, fantasy: 10765, horror: 9648, romance: 10749, sciFi: 10765, thriller: 9648 }

export function randomDiscoverUrl(apiKey: string, filters: RandomFilters, page: number) {
  const kind = filters.kind ?? 'movie'
  const url = new URL(`https://api.themoviedb.org/3/discover/${kind === 'series' ? 'tv' : 'movie'}`)
  url.searchParams.set('api_key', apiKey)
  url.searchParams.set('language', 'ru-RU')
  url.searchParams.set('include_adult', 'false')
  url.searchParams.set('sort_by', 'popularity.desc')
  url.searchParams.set('vote_average.gte', '6.5')
  url.searchParams.set('vote_count.gte', kind === 'series' ? '100' : '300')
  url.searchParams.set('page', String(page))
  const genre = (kind === 'series' ? seriesGenres : movieGenres)[filters.genre ?? '']
  if (kind === 'animation') url.searchParams.set('with_genres', genre ? `16,${genre}` : '16')
  else if (genre) url.searchParams.set('with_genres', String(genre))
  if (kind === 'movie') url.searchParams.set('without_genres', '16')
  if (filters.maxRuntime) url.searchParams.set('with_runtime.lte', String(filters.maxRuntime))
  return url
}
