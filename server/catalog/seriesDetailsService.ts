import { env } from '../config/env'
import type { CatalogItem, SeriesDetails } from './types'
import { mapTmdbWatch, tmdbExternalLinks } from './watchOptions'
import { mapOmdbCast } from './omdbCast'
import { isActor } from './poiskCast'

export async function getSeriesDetails(catalogId: string): Promise<SeriesDetails | null> {
  const [provider, kind, id] = catalogId.split(':')
  if (kind !== 'series' || !id) return null
  if (provider === 'tmdb') return getTmdbDetails(id)
  if (provider === 'kinopoisk') return getPoiskKinoDetails(id)
  if (provider === 'tvmaze') return getTvMazeDetails(id)
  if (provider === 'omdb') return getOmdbSeries(id)
  return null
}

async function getTvMazeDetails(id: string): Promise<SeriesDetails | null> {
  const response = await fetch(`https://api.tvmaze.com/shows/${id}?embed=cast`, { signal: AbortSignal.timeout(4_000) })
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`TVmaze returned ${response.status}`)
  const item = await response.json() as TvMazeDetails
  return { id: `tvmaze:series:${item.id}`, title: item.name, kind: 'series', year: year(item.premiered), duration: item.averageRuntime ? `${item.averageRuntime} мин` : undefined, overview: item.summary?.replace(/<[^>]*>/g, ''), posterUrl: item.image?.original ?? item.image?.medium, rating: item.rating?.average, genres: item.genres, match: Math.round((item.rating?.average ?? 6) * 10), sourceNames: ['TVmaze'], status: item.status, country: item.network?.country?.name, watchOptions: [], externalLinks: item.url ? [{ name: 'TVmaze', url: item.url }] : [], cast: (item._embedded?.cast ?? []).slice(0, 8).map(({ person, character }) => ({ id: `tvmaze:person:${person.id}`, name: person.name, character: character.name, photoUrl: person.image?.medium })), similar: [] }
}

async function getOmdbSeries(id: string): Promise<SeriesDetails | null> {
  if (!env.omdbKey) return null
  const url = new URL('https://www.omdbapi.com/')
  url.searchParams.set('apikey', env.omdbKey); url.searchParams.set('i', id); url.searchParams.set('plot', 'full')
  const response = await fetch(url, { signal: AbortSignal.timeout(4_000) })
  const item = await response.json() as OmdbDetails
  if (!response.ok || item.Response === 'False') return null
  return { id: `omdb:series:${id}`, title: item.Title, kind: 'series', year: Number(item.Year?.slice(0, 4)) || undefined, duration: item.Runtime, overview: item.Plot, posterUrl: item.Poster === 'N/A' ? undefined : item.Poster, rating: Number(item.imdbRating) || undefined, genres: item.Genre?.split(', '), match: Math.round((Number(item.imdbRating) || 6) * 10), sourceNames: ['OMDb'], country: item.Country, watchOptions: [], externalLinks: [{ name: 'IMDb', url: `https://www.imdb.com/title/${id}/` }], cast: mapOmdbCast(item.Actors), similar: [] }
}

async function getTmdbDetails(id: string): Promise<SeriesDetails | null> {
  if (!env.tmdbApiKey) return null
  const url = new URL(`https://api.themoviedb.org/3/tv/${id}`)
  url.searchParams.set('language', 'ru-RU')
  url.searchParams.set('append_to_response', 'videos,credits,recommendations,watch/providers,external_ids')
  url.searchParams.set('api_key', env.tmdbApiKey)
  const response = await fetch(url, { signal: AbortSignal.timeout(4_000) })
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`TMDB returned ${response.status}`)
  return mapTmdbDetails(await response.json() as TmdbDetails)
}

async function getPoiskKinoDetails(id: string): Promise<SeriesDetails | null> {
  if (!env.kinopoiskDevToken) return null
  const response = await fetch(`https://api.poiskkino.dev/v1.4/movie/${id}`, {
    headers: { 'X-API-KEY': env.kinopoiskDevToken },
    signal: AbortSignal.timeout(4_000),
  })
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`PoiskKino returned ${response.status}`)
  return mapPoiskDetails(await response.json() as PoiskDetails)
}

function mapTmdbDetails(item: TmdbDetails): SeriesDetails {
  const trailer = item.videos?.results.find((video) => video.site === 'YouTube' && video.type === 'Trailer')
  return {
    id: `tmdb:series:${item.id}`, title: item.name, originalTitle: item.original_name, kind: 'series',
    year: year(item.first_air_date), overview: item.overview, duration: item.episode_run_time?.[0] ? `${item.episode_run_time[0]} мин` : undefined,
    posterUrl: image(item.poster_path), backdropUrl: image(item.backdrop_path, 'original'), rating: item.vote_average,
    voteCount: item.vote_count, genres: item.genres?.map(({ name }) => name), match: Math.round((item.vote_average ?? 6) * 10),
    sourceNames: ['TMDB'], status: item.status, seasons: item.number_of_seasons, episodes: item.number_of_episodes,
    country: item.production_countries?.[0]?.name, ageRating: undefined,
    trailerUrl: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : undefined,
    watchOptions: mapTmdbWatch(item['watch/providers']?.results),
    externalLinks: tmdbExternalLinks('tv', item.id, item.external_ids?.imdb_id),
    cast: (item.credits?.cast ?? []).slice(0, 8).map((person) => ({ id: `tmdb:person:${person.id}`, name: person.name, character: person.character, photoUrl: image(person.profile_path, 'w185') })),
    similar: (item.recommendations?.results ?? []).slice(0, 8).map(mapTmdbSimilar),
  }
}

function mapPoiskDetails(item: PoiskDetails): SeriesDetails {
  const trailer = item.videos?.trailers?.find((video) => video.url)
  return {
    id: `kinopoisk:series:${item.id}`, title: item.name ?? item.alternativeName ?? 'Без названия', originalTitle: item.alternativeName,
    kind: 'series', year: item.year, overview: item.description, duration: item.seriesLength ? `${item.seriesLength} мин` : undefined,
    posterUrl: item.poster?.url, backdropUrl: item.backdrop?.url, rating: item.rating?.kp, voteCount: item.votes?.kp,
    genres: item.genres?.map(({ name }) => name), match: Math.round((item.rating?.kp ?? 6) * 10), sourceNames: ['PoiskKino'],
    status: item.status, seasons: item.seasonsInfo?.length, episodes: item.releaseYears?.reduce((sum, value) => sum + (value.episodesCount ?? 0), 0),
    country: item.countries?.map(({ name }) => name).join(', '), ageRating: item.ageRating ? `${item.ageRating}+` : undefined,
    trailerUrl: trailer?.url,
    watchOptions: (item.watchability?.items ?? []).flatMap((option) => option.url ? [{ name: option.name, type: 'stream' as const, logoUrl: option.logo?.url, url: option.url }] : []),
    externalLinks: [{ name: 'Кинопоиск', url: `https://www.kinopoisk.ru/series/${item.id}/` }, ...(item.externalId?.imdb ? [{ name: 'IMDb', url: `https://www.imdb.com/title/${item.externalId.imdb}/` }] : [])],
    cast: (item.persons ?? []).filter((person) => isActor(person)).slice(0, 8).map((person) => ({ id: `kinopoisk:person:${person.id}`, name: person.name ?? person.enName ?? 'Актёр', character: person.description, photoUrl: person.photo })),
    similar: (item.similarMovies ?? []).slice(0, 8).map((movie) => ({ id: `kinopoisk:series:${movie.id}`, title: movie.name ?? movie.alternativeName ?? 'Без названия', kind: 'series', year: movie.year, posterUrl: movie.poster?.url, match: 70, sourceNames: ['PoiskKino'] })),
  }
}

function mapTmdbSimilar(item: TmdbSimilar): CatalogItem {
  return { id: `tmdb:series:${item.id}`, title: item.name, kind: 'series', year: year(item.first_air_date), overview: item.overview, posterUrl: image(item.poster_path), rating: item.vote_average, match: Math.round((item.vote_average ?? 6) * 10), sourceNames: ['TMDB'] }
}

const year = (date?: string) => Number(date?.slice(0, 4)) || undefined
const image = (path?: string, size = 'w500') => path ? `https://image.tmdb.org/t/p/${size}${path}` : undefined

type TmdbSimilar = { id: number; name: string; first_air_date?: string; overview?: string; poster_path?: string; vote_average?: number }
type TmdbDetails = TmdbSimilar & { original_name?: string; backdrop_path?: string; vote_count?: number; episode_run_time?: number[]; genres?: { name: string }[]; status?: string; number_of_seasons?: number; number_of_episodes?: number; production_countries?: { name: string }[]; videos?: { results: { site: string; type: string; key: string }[] }; credits?: { cast: { id: number; name: string; character?: string; profile_path?: string }[] }; recommendations?: { results: TmdbSimilar[] }; 'watch/providers'?: { results?: Record<string, never> }; external_ids?: { imdb_id?: string } }
type PoiskSimilar = { id: number; name?: string; alternativeName?: string; year?: number; poster?: { url?: string } }
type PoiskDetails = PoiskSimilar & { description?: string; seriesLength?: number; backdrop?: { url?: string }; rating?: { kp?: number }; votes?: { kp?: number }; genres?: { name: string }[]; countries?: { name: string }[]; status?: string; ageRating?: number; seasonsInfo?: unknown[]; releaseYears?: { episodesCount?: number }[]; videos?: { trailers?: { url?: string }[] }; persons?: { id: number; name?: string; enName?: string; enProfession?: string; profession?: string; description?: string; photo?: string }[]; similarMovies?: PoiskSimilar[]; watchability?: { items?: { name: string; url?: string; logo?: { url?: string } }[] }; externalId?: { imdb?: string } }
type TvMazeDetails = { id: number; name: string; url?: string; premiered?: string; averageRuntime?: number; summary?: string; image?: { medium?: string; original?: string }; rating?: { average?: number }; genres?: string[]; status?: string; network?: { country?: { name?: string } }; _embedded?: { cast: { person: { id: number; name: string; image?: { medium?: string } }; character: { name?: string } }[] } }
type OmdbDetails = { Response: 'True' | 'False'; Title: string; Year?: string; Runtime?: string; Plot?: string; Poster?: string; imdbRating?: string; Genre?: string; Country?: string; Actors?: string }
