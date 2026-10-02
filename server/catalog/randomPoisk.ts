import { countryCodesFor, countryNames } from './countries'
import type { CatalogItem } from './types'
import type { RandomFilters } from './randomDiscover'

type Request = RandomFilters & { excludeId?: string }
type PoiskMovie = {
  id: number; name?: string; alternativeName?: string; year?: number; description?: string
  poster?: { url?: string }; backdrop?: { url?: string }; rating?: { kp?: number }
  votes?: { kp?: number }; genres?: { name: string }[]; countries?: { name: string }[]
}

const genres: Record<string, string> = {
  comedy: 'комедия', drama: 'драма', thriller: 'триллер', sciFi: 'фантастика',
  fantasy: 'фэнтези', romance: 'мелодрама', horror: 'ужасы',
}

export function randomPoiskUrl(filters: Request) {
  const url = new URL('https://api.poiskkino.dev/v1.5/movie/random')
  url.searchParams.set('type', filters.kind === 'series' ? 'tv-series' : filters.kind === 'animation' ? 'cartoon' : 'movie')
  url.searchParams.set('notNullFields', 'poster.url')
  url.searchParams.set('rating.kp', '6.5-10')
  url.searchParams.set('votes.kp', '1000-10000000')
  if (filters.country && countryNames[filters.country]) url.searchParams.set('countries.name', countryNames[filters.country])
  if (filters.genre && genres[filters.genre]) url.searchParams.set('genres.name', genres[filters.genre])
  if (filters.maxRuntime) url.searchParams.set(filters.kind === 'series' ? 'seriesLength' : 'movieLength', `1-${filters.maxRuntime}`)
  const [provider, kind, id] = filters.excludeId?.split(':') ?? []
  if (provider === 'kinopoisk' && kind === (filters.kind === 'series' ? 'series' : 'movie') && /^\d+$/.test(id ?? '')) url.searchParams.set('id', `!${id}`)
  return url
}

export async function getRandomPoisk(filters: Request, token: string): Promise<CatalogItem | null> {
  const response = await fetch(randomPoiskUrl(filters), {
    headers: { 'X-API-KEY': token }, signal: AbortSignal.timeout(5_000),
  })
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`PoiskKino returned ${response.status}`)
  const item = await response.json() as PoiskMovie
  if (!item.id) return null
  return {
    id: `kinopoisk:${filters.kind === 'series' ? 'series' : 'movie'}:${item.id}`,
    title: item.name?.trim() || item.alternativeName?.trim() || 'Без названия',
    originalTitle: item.alternativeName, kind: filters.kind === 'series' ? 'series' : 'movie',
    year: item.year, overview: item.description, posterUrl: item.poster?.url,
    backdropUrl: item.backdrop?.url, rating: item.rating?.kp, voteCount: item.votes?.kp,
    genres: item.genres?.map(({ name }) => name), originCountries: countryCodesFor(item.countries),
    match: Math.round(Math.min(99, Math.max(50, (item.rating?.kp ?? 6) * 10))),
    sourceNames: ['PoiskKino'],
  }
}
