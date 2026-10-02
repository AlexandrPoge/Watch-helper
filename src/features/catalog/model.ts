export type CatalogKind = 'movie' | 'series'
export type CatalogFilters = {
  genre: string
  country: string
  year: string
  rating: string
  sort: 'popular' | 'rating' | 'newest'
}

export const defaultCatalogFilters: CatalogFilters = { genre: '', country: '', year: '', rating: '', sort: 'popular' }
