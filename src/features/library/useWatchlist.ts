import { useSyncExternalStore } from 'react'
import type { Movie } from '../../entities/movie/model'
import { getWatchlist, subscribeWatchlist, toggleWatchlist } from './watchlistStore'

const empty: Movie[] = []

export function useWatchlist() {
  const items = useSyncExternalStore(subscribeWatchlist, getWatchlist, () => empty)
  return {
    items,
    ids: items.map((item) => item.id),
    has: (id: Movie['id']) => items.some((item) => String(item.id) === String(id)),
    toggle: toggleWatchlist,
  }
}
