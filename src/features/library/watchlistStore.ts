import type { Movie } from '../../entities/movie/model'

const storageKey = 'watchly.watchlist.v1'
const changeEvent = 'watchly:watchlist-change'
let cache: Movie[] | undefined

export function getWatchlist() {
  if (cache) return cache
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) ?? '[]')
    cache = Array.isArray(value) ? value.filter(isMovie).slice(0, 100) : []
  } catch {
    cache = []
  }
  return cache
}

export function toggleWatchlist(movie: Movie) {
  const current = getWatchlist()
  cache = current.some((item) => sameId(item.id, movie.id))
    ? current.filter((item) => !sameId(item.id, movie.id))
    : [compactMovie(movie), ...current].slice(0, 100)
  localStorage.setItem(storageKey, JSON.stringify(cache))
  window.dispatchEvent(new Event(changeEvent))
}

export function subscribeWatchlist(callback: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== storageKey) return
    cache = undefined
    callback()
  }
  window.addEventListener(changeEvent, callback)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(changeEvent, callback)
    window.removeEventListener('storage', onStorage)
  }
}

const sameId = (first: Movie['id'], second: Movie['id']) => String(first) === String(second)

function compactMovie(movie: Movie): Movie {
  const { id, title, originalTitle, kind, year, duration, match, posterUrl, backdropUrl, overview, rating, genres, sourceNames } = movie
  return { id, title, originalTitle, kind, year, duration, match, posterUrl, backdropUrl, overview, rating, genres, sourceNames }
}

function isMovie(value: unknown): value is Movie {
  if (!value || typeof value !== 'object') return false
  const item = value as Partial<Movie>
  return (typeof item.id === 'string' || typeof item.id === 'number') && typeof item.title === 'string' && typeof item.match === 'number'
}
