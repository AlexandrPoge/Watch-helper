import { parseCatalogId } from '../catalog/catalogId'
import { getMovieDetails } from '../catalog/movieDetailsService'
import { getVotingMovies } from '../catalog/randomMovieService'
import { sample } from '../catalog/sample'
import type { CatalogItem } from '../catalog/types'
import { maxManualCandidates, minManualCandidates } from '../../src/entities/room/roundLimits'
import { RoomError } from './roomErrors'
import type { MovieCandidate, RoundSetup } from './types'

export async function resolveRoundCandidates(setup: RoundSetup, selection: unknown): Promise<MovieCandidate[]> {
  if (selection === undefined) {
    const movies = await getVotingMovies(12, setup).catch(() => { throw new RoomError('NO_CANDIDATES', 502) })
    return movies.flatMap(movie => movie.posterUrl ? [toCandidate(movie, setup.blind)] : [])
  }

  const ids = readSelection(selection)
  const movies = await Promise.all(ids.map(id => getMovieDetails(id)))
    .catch(() => { throw new RoomError('MANUAL_CATALOG_UNAVAILABLE', 502) })
  const candidates = movies.map((movie, index) => {
    if (!movie?.posterUrl || movie.id !== ids[index]) throw new RoomError('MANUAL_MOVIE_UNAVAILABLE', 422)
    return toCandidate(movie, setup.blind)
  })
  return setup.blind ? sample(candidates) : candidates
}

function readSelection(value: unknown): string[] {
  if (!Array.isArray(value) || value.length < minManualCandidates || value.length > maxManualCandidates
    || !value.every(id => typeof id === 'string' && id.length <= 48 && parseCatalogId(id, 'movie'))
    || new Set(value).size !== value.length) {
    throw new RoomError('INVALID_MOVIE_SELECTION')
  }
  return value
}

function toCandidate(movie: CatalogItem, blind = false): MovieCandidate {
  const overview = blind ? `${movie.genres?.slice(0, 2).join(' / ') || 'Кино'} · ${movie.overview ?? ''}` : movie.overview
  return { id: movie.id, title: movie.title, year: movie.year ?? 0, posterUrl: movie.posterUrl ?? '', rating: movie.rating, overview }
}
