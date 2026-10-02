import type { CatalogItem } from './types'

export type BrowseFilters = {
  genre?: string
  year?: string
  rating?: string
  sort?: 'popular' | 'rating' | 'newest'
  page?: number
}

export function sortCatalogItems(items: CatalogItem[], sort: BrowseFilters['sort'] = 'popular') {
  return [...items].sort((a, b) => {
    if (sort === 'newest') return (b.year ?? 0) - (a.year ?? 0)
    if (sort === 'rating') return (b.rating ?? 0) - (a.rating ?? 0)
    return b.match - a.match
  })
}
