import type { Movie } from '../../entities/movie/model'

export type TasteReaction = { movie: Movie; value: 'like' | 'dislike' }
export type TasteState = { genres: string[]; reactions: TasteReaction[] }

const storageKey = 'watchly.taste.v1'
const changeEvent = 'watchly:taste-change'
const empty: TasteState = { genres: [], reactions: [] }
let cache: TasteState | undefined

export function getTaste() {
  if (cache) return cache
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey) ?? '{}') as Partial<TasteState>
    cache = { genres: Array.isArray(parsed.genres) ? parsed.genres.filter((item): item is string => typeof item === 'string') : [], reactions: Array.isArray(parsed.reactions) ? parsed.reactions.filter(isReaction) : [] }
  } catch {
    cache = empty
  }
  return cache
}

export function reactToMovie(movie: Movie, value: TasteReaction['value']) {
  const state = getTaste()
  const existing = state.reactions.find((item) => String(item.movie.id) === String(movie.id))
  const reactions = state.reactions.filter((item) => String(item.movie.id) !== String(movie.id))
  save({ ...state, reactions: existing?.value === value ? reactions : [{ movie: compact(movie), value }, ...reactions].slice(0, 200) })
}

export function toggleTasteGenre(genre: string) {
  const state = getTaste()
  const genres = state.genres.includes(genre) ? state.genres.filter((item) => item !== genre) : [...state.genres, genre]
  save({ ...state, genres })
}

export function subscribeTaste(callback: () => void) {
  const onStorage = (event: StorageEvent) => { if (event.key === storageKey) { cache = undefined; callback() } }
  window.addEventListener(changeEvent, callback)
  window.addEventListener('storage', onStorage)
  return () => { window.removeEventListener(changeEvent, callback); window.removeEventListener('storage', onStorage) }
}

function save(state: TasteState) {
  cache = state
  localStorage.setItem(storageKey, JSON.stringify(state))
  window.dispatchEvent(new Event(changeEvent))
}

function compact(movie: Movie): Movie {
  const { id, title, kind, year, match, posterUrl, overview, rating, genres, sourceNames } = movie
  return { id, title, kind, year, match, posterUrl, overview, rating, genres, sourceNames }
}

function isReaction(value: unknown): value is TasteReaction {
  if (!value || typeof value !== 'object') return false
  const item = value as Partial<TasteReaction>
  return (item.value === 'like' || item.value === 'dislike') && Boolean(item.movie?.id && item.movie.title)
}
