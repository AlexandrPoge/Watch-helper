import { defaultCatalogFilters, type CatalogFilters } from './model'

export function readCatalogFilters(params: URLSearchParams): CatalogFilters {
  const sort = params.get('sort')
  return {
    genre: params.get('genre') ?? '',
    country: params.get('country') ?? '',
    year: params.get('year') ?? '',
    rating: params.get('rating') ?? '',
    sort: sort === 'rating' || sort === 'newest' ? sort : 'popular',
  }
}

export function writeCatalogParams(filters: CatalogFilters, query: string) {
  const params = new URLSearchParams()
  if (query) params.set('q', query)
  for (const key of ['genre', 'country', 'year', 'rating'] as const) {
    if (filters[key]) params.set(key, filters[key])
  }
  if (filters.sort !== defaultCatalogFilters.sort) params.set('sort', filters.sort)
  return params
}
