import type { Movie } from '../../../entities/movie/model'
import type { CatalogFilters, CatalogKind } from '../model'

export type BrowseResponse = { items: Movie[]; page: number; partial?: boolean }

export async function fetchBrowse(kind: CatalogKind, filters: CatalogFilters, page = 1) {
  const query = new URLSearchParams({ page: String(page) })
  Object.entries(filters).forEach(([key, value]) => value && query.set(key, value))
  const response = await fetch(`/api/${kind === 'movie' ? 'movies' : 'series'}?${query}`)
  if (!response.ok) throw new Error('Не удалось загрузить каталог.')
  return response.json() as Promise<BrowseResponse>
}
