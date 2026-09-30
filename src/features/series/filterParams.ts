import type { SeriesFilters } from './model'
import { defaultSeriesFilters } from './model'

export function readSeriesFilters(params: URLSearchParams): SeriesFilters {
  const sort = params.get('sort')
  return {
    genre: params.get('genre') ?? '',
    year: params.get('year') ?? '',
    rating: params.get('rating') ?? '',
    sort: sort === 'rating' || sort === 'newest' ? sort : 'popular',
  }
}

export function writeSeriesParams(filters: SeriesFilters, search: string) {
  const params = new URLSearchParams()
  if (search) params.set('q', search)
  for (const key of ['genre', 'year', 'rating'] as const) {
    if (filters[key]) params.set(key, filters[key])
  }
  if (filters.sort !== defaultSeriesFilters.sort) params.set('sort', filters.sort)
  return params
}
