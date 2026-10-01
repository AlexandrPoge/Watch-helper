import { env } from '../config/env'
import type { CatalogItem, PersonDetails, PersonSummary } from './types'

export async function searchPeople(query: string): Promise<PersonSummary[]> {
  if (!env.tmdbApiKey) return []
  const url = tmdbUrl('/search/person')
  url.searchParams.set('query', query)
  const response = await fetch(url, { signal: AbortSignal.timeout(4_000) })
  if (!response.ok) throw new Error(`TMDB returned ${response.status}`)
  const data = await response.json() as { results: TmdbPersonSearch[] }
  return data.results.slice(0, 8).map((person) => ({
    id: `tmdb:person:${person.id}`, name: person.name, department: person.known_for_department,
    photoUrl: image(person.profile_path, 'w185'),
    knownFor: person.known_for?.map((item) => item.title ?? item.name ?? '').filter(Boolean).slice(0, 3) ?? [],
  }))
}

export async function getPersonDetails(catalogId: string): Promise<PersonDetails | null> {
  const [provider, type, id] = catalogId.split(':')
  if (type !== 'person' || !id) return null
  if (provider === 'kinopoisk') return getPoiskPerson(catalogId, id)
  if (provider === 'tvmaze') return getTvMazePerson(catalogId, id)
  if (provider !== 'tmdb' || !env.tmdbApiKey) return null
  const url = tmdbUrl(`/person/${id}`)
  url.searchParams.set('append_to_response', 'combined_credits')
  const response = await fetch(url, { signal: AbortSignal.timeout(4_000) })
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`TMDB returned ${response.status}`)
  const person = await response.json() as TmdbPersonDetails
  const credits = uniqueCredits(person.combined_credits?.cast ?? [])
  const knownFor = (person.combined_credits?.cast ?? [])
    .filter((item) => item.media_type === 'movie' && (item.vote_count ?? 0) > 100)
    .sort((a, b) => (b.vote_count ?? 0) - (a.vote_count ?? 0))
    .slice(0, 3).map((item) => item.title ?? item.name ?? '').filter(Boolean)
  const biography = person.biography?.trim() || await englishBiography(id)
  return { id: catalogId, name: person.name, department: person.known_for_department, photoUrl: image(person.profile_path), knownFor: knownFor.length ? knownFor : credits.slice(0, 3).map((item) => item.title), biography, birthday: person.birthday, placeOfBirth: person.place_of_birth, credits }
}

async function englishBiography(id: string) {
  const url = tmdbUrl(`/person/${id}`)
  url.searchParams.set('language', 'en-US')
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(2_500) })
    return response.ok ? (await response.json() as { biography?: string }).biography?.trim() : undefined
  } catch { return undefined }
}

async function getTvMazePerson(catalogId: string, id: string): Promise<PersonDetails | null> {
  if (!/^\d+$/.test(id)) return null
  const [response, creditsResponse] = await Promise.all([
    fetch(`https://api.tvmaze.com/people/${id}`, { signal: AbortSignal.timeout(4_000) }),
    fetch(`https://api.tvmaze.com/people/${id}/castcredits?embed=show`, { signal: AbortSignal.timeout(4_000) }).catch(() => undefined),
  ])
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`TVMaze returned ${response.status}`)
  const person = await response.json() as TvMazePerson
  const entries = creditsResponse?.ok ? await creditsResponse.json() as TvMazeCredit[] : []
  const seen = new Set<number>()
  const credits: CatalogItem[] = entries.flatMap(({ _embedded }) => {
    const show = _embedded?.show
    if (!show?.id || seen.has(show.id)) return []
    seen.add(show.id)
    return [{ id: `tvmaze:series:${show.id}`, title: show.name, kind: 'series' as const, year: Number(show.premiered?.slice(0, 4)) || undefined, posterUrl: show.image?.medium, rating: show.rating?.average, match: Math.round((show.rating?.average ?? 6) * 10), sourceNames: ['TVMaze'] }]
  }).slice(0, 48)
  return { id: catalogId, name: person.name, department: 'Актёр', photoUrl: person.image?.original ?? person.image?.medium, knownFor: credits.slice(0, 3).map((item) => item.title), birthday: person.birthday, country: person.country?.name, credits }
}

async function getPoiskPerson(catalogId: string, id: string): Promise<PersonDetails | null> {
  if (!env.kinopoiskDevToken) return null
  const response = await fetch(`https://api.poiskkino.dev/v1.4/person/${id}`, { headers: { 'X-API-KEY': env.kinopoiskDevToken }, signal: AbortSignal.timeout(4_000) })
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`PoiskKino returned ${response.status}`)
  const person = await response.json() as PoiskPerson
  const credits: CatalogItem[] = (person.movies ?? []).filter((movie) => movie.id && (movie.name || movie.alternativeName)).slice(0, 48).map((movie) => {
    const kind = movie.type === 'tv-series' || movie.type === 'mini-series' ? 'series' as const : 'movie' as const
    return { id: `kinopoisk:${kind}:${movie.id}`, title: movie.name ?? movie.alternativeName ?? 'Без названия', kind, rating: movie.rating, match: Math.round((movie.rating ?? 6) * 10), sourceNames: ['PoiskKino'] }
  })
  return { id: catalogId, name: person.name ?? person.enName ?? 'Без имени', department: person.profession?.[0]?.value, photoUrl: person.photo, knownFor: credits.slice(0, 3).map((item) => item.title), biography: person.description, birthday: person.birthday, placeOfBirth: person.birthPlace?.map(({ value }) => value).join(', '), credits }
}

function uniqueCredits(items: TmdbCredit[]) {
  const seen = new Set<string>()
  return items.filter((item) => item.id && ['movie', 'tv'].includes(item.media_type) && !/self|archive footage/i.test(item.character ?? '')).sort((a, b) => (b.vote_count ?? 0) - (a.vote_count ?? 0) || (b.popularity ?? 0) - (a.popularity ?? 0)).flatMap((item) => {
    const mapped = mapCredit(item)
    if (seen.has(mapped.id)) return []
    seen.add(mapped.id)
    return [mapped]
  }).slice(0, 48)
}

function mapCredit(item: TmdbCredit): CatalogItem {
  const kind = item.media_type === 'tv' ? 'series' : 'movie'
  return { id: `tmdb:${kind}:${item.id}`, title: item.title ?? item.name ?? 'Без названия', kind, year: Number((item.release_date ?? item.first_air_date)?.slice(0, 4)) || undefined, overview: item.overview, posterUrl: image(item.poster_path), rating: item.vote_average, match: Math.min(99, Math.max(50, Math.round(item.popularity ?? 60))), sourceNames: ['TMDB'] }
}

function tmdbUrl(path: string) {
  const url = new URL(`https://api.themoviedb.org/3${path}`)
  url.searchParams.set('api_key', env.tmdbApiKey ?? '')
  url.searchParams.set('language', 'ru-RU')
  return url
}

const image = (path?: string, size = 'w500') => path ? `https://image.tmdb.org/t/p/${size}${path}` : undefined
type TmdbPersonSearch = { id: number; name: string; known_for_department?: string; profile_path?: string; known_for?: { title?: string; name?: string }[] }
type TmdbCredit = { id: number; media_type: 'movie' | 'tv'; title?: string; name?: string; character?: string; release_date?: string; first_air_date?: string; overview?: string; poster_path?: string; vote_average?: number; vote_count?: number; popularity?: number }
type TmdbPersonDetails = TmdbPersonSearch & { biography?: string; birthday?: string; place_of_birth?: string; combined_credits?: { cast: TmdbCredit[] } }
type PoiskPerson = { name?: string; enName?: string; photo?: string; description?: string; birthday?: string; profession?: { value: string }[]; birthPlace?: { value: string }[]; movies?: { id: number; name?: string; alternativeName?: string; rating?: number; type?: string }[] }
type TvMazePerson = { name: string; birthday?: string; country?: { name?: string }; image?: { medium?: string; original?: string } }
type TvMazeCredit = { _embedded?: { show?: { id: number; name: string; premiered?: string; image?: { medium?: string }; rating?: { average?: number } } } }
