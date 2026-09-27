import type { Movie, SeriesDetails } from '../../entities/movie/model'

export type SeriesFilters = {
  genre: string
  year: string
  rating: string
  sort: 'popular' | 'rating' | 'newest'
}

export type SeriesResponse = { items: Movie[]; page: number }
export type SeriesDetailsResponse = { item: SeriesDetails }

export const defaultSeriesFilters: SeriesFilters = {
  genre: '', year: '', rating: '', sort: 'popular',
}
