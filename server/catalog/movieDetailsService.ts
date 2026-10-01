import { env } from '../config/env'
import type { SeriesDetails } from './types'
import { mapTmdbWatch, tmdbExternalLinks } from './watchOptions'
import { mapOmdbCast } from './omdbCast'
import { isActor } from './poiskCast'

export async function getMovieDetails(catalogId: string): Promise<SeriesDetails | null> {
  const [provider, kind, id] = catalogId.split(':')
  if (kind !== 'movie' || !id) return null
  if (provider === 'tmdb') return getTmdbMovie(id)
  if (provider === 'kinopoisk') return getPoiskMovie(id)
  if (provider === 'omdb') return getOmdbMovie(id)
  return null
}

async function getTmdbMovie(id: string): Promise<SeriesDetails | null> {
  if (!env.tmdbApiKey) return null
  const url = new URL(`https://api.themoviedb.org/3/movie/${id}`)
  url.searchParams.set('api_key', env.tmdbApiKey)
  url.searchParams.set('language', 'ru-RU')
  url.searchParams.set('append_to_response', 'videos,credits,recommendations,watch/providers,external_ids')
  const response = await fetch(url, { signal: AbortSignal.timeout(4_000) })
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`TMDB returned ${response.status}`)
  const item = await response.json() as TmdbMovie
  const trailer = item.videos?.results.find((video) => video.site === 'YouTube' && video.type === 'Trailer')
  return { id: `tmdb:movie:${item.id}`, title: item.title, originalTitle: item.original_title, kind: 'movie', year: year(item.release_date), duration: item.runtime ? `${item.runtime} мин` : undefined, overview: item.overview, posterUrl: image(item.poster_path), backdropUrl: image(item.backdrop_path, 'original'), rating: item.vote_average, voteCount: item.vote_count, genres: item.genres?.map(({ name }) => name), match: Math.round((item.vote_average ?? 6) * 10), sourceNames: ['TMDB'], status: item.status, country: item.production_countries?.[0]?.name, trailerUrl: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : undefined, watchOptions: mapTmdbWatch(item['watch/providers']?.results), externalLinks: tmdbExternalLinks('movie', item.id, item.external_ids?.imdb_id), cast: (item.credits?.cast ?? []).slice(0, 10).map((person) => ({ id: `tmdb:person:${person.id}`, name: person.name, character: person.character, photoUrl: image(person.profile_path, 'w185') })), similar: (item.recommendations?.results ?? []).slice(0, 10).map((movie) => ({ id: `tmdb:movie:${movie.id}`, title: movie.title, kind: 'movie', year: year(movie.release_date), posterUrl: image(movie.poster_path), rating: movie.vote_average, match: Math.round((movie.vote_average ?? 6) * 10), sourceNames: ['TMDB'] })) }
}

async function getPoiskMovie(id: string): Promise<SeriesDetails | null> {
  if (!env.kinopoiskDevToken) return null
  const response = await fetch(`https://api.poiskkino.dev/v1.4/movie/${id}`, { headers: { 'X-API-KEY': env.kinopoiskDevToken }, signal: AbortSignal.timeout(4_000) })
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`PoiskKino returned ${response.status}`)
  const item = await response.json() as PoiskMovie
  return { id: `kinopoisk:movie:${item.id}`, title: item.name ?? item.alternativeName ?? 'Без названия', originalTitle: item.alternativeName, kind: 'movie', year: item.year, duration: item.movieLength ? `${item.movieLength} мин` : undefined, overview: item.description, posterUrl: item.poster?.url, backdropUrl: item.backdrop?.url, rating: item.rating?.kp, voteCount: item.votes?.kp, genres: item.genres?.map(({ name }) => name), match: Math.round((item.rating?.kp ?? 6) * 10), sourceNames: ['PoiskKino'], country: item.countries?.map(({ name }) => name).join(', '), ageRating: item.ageRating ? `${item.ageRating}+` : undefined, watchOptions: (item.watchability?.items ?? []).flatMap((option) => option.url ? [{ name: option.name, type: 'stream' as const, logoUrl: option.logo?.url, url: option.url }] : []), externalLinks: [{ name: 'Кинопоиск', url: `https://www.kinopoisk.ru/film/${item.id}/` }, ...(item.externalId?.imdb ? [{ name: 'IMDb', url: `https://www.imdb.com/title/${item.externalId.imdb}/` }] : [])], cast: (item.persons ?? []).filter((person) => isActor(person)).slice(0, 10).map((person) => ({ id: `kinopoisk:person:${person.id}`, name: person.name ?? 'Актёр', character: person.description, photoUrl: person.photo })), similar: [] }
}

async function getOmdbMovie(id: string): Promise<SeriesDetails | null> {
  if (!env.omdbKey) return null
  const url = new URL('https://www.omdbapi.com/')
  url.searchParams.set('apikey', env.omdbKey); url.searchParams.set('i', id); url.searchParams.set('plot', 'full')
  const response = await fetch(url, { signal: AbortSignal.timeout(4_000) })
  const item = await response.json() as OmdbMovie
  if (!response.ok || item.Response === 'False') return null
  return { id: `omdb:movie:${id}`, title: item.Title, kind: 'movie', year: Number(item.Year) || undefined, duration: item.Runtime, overview: item.Plot, posterUrl: item.Poster === 'N/A' ? undefined : item.Poster, rating: Number(item.imdbRating) || undefined, genres: item.Genre?.split(', '), match: Math.round((Number(item.imdbRating) || 6) * 10), sourceNames: ['OMDb'], country: item.Country, watchOptions: [], externalLinks: [{ name: 'IMDb', url: `https://www.imdb.com/title/${id}/` }], cast: mapOmdbCast(item.Actors), similar: [] }
}

const year = (date?: string) => Number(date?.slice(0, 4)) || undefined
const image = (path?: string, size = 'w500') => path ? `https://image.tmdb.org/t/p/${size}${path}` : undefined
type TmdbMini = { id: number; title: string; release_date?: string; poster_path?: string; vote_average?: number }
type TmdbMovie = TmdbMini & { original_title?: string; runtime?: number; overview?: string; backdrop_path?: string; vote_count?: number; genres?: { name: string }[]; status?: string; production_countries?: { name: string }[]; videos?: { results: { site: string; type: string; key: string }[] }; credits?: { cast: { id: number; name: string; character?: string; profile_path?: string }[] }; recommendations?: { results: TmdbMini[] }; 'watch/providers'?: { results?: Record<string, never> }; external_ids?: { imdb_id?: string } }
type PoiskMovie = { id: number; name?: string; alternativeName?: string; year?: number; movieLength?: number; description?: string; poster?: { url?: string }; backdrop?: { url?: string }; rating?: { kp?: number }; votes?: { kp?: number }; genres?: { name: string }[]; countries?: { name: string }[]; ageRating?: number; persons?: { id: number; name?: string; enProfession?: string; profession?: string; description?: string; photo?: string }[]; watchability?: { items?: { name: string; url?: string; logo?: { url?: string } }[] }; externalId?: { imdb?: string } }
type OmdbMovie = { Response: 'True' | 'False'; Title: string; Year?: string; Runtime?: string; Plot?: string; Poster?: string; imdbRating?: string; Genre?: string; Country?: string; Actors?: string }
