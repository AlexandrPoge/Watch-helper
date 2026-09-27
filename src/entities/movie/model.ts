export type Movie = {
  id: string | number
  title: string
  originalTitle?: string
  kind?: 'movie' | 'series'
  year?: number
  duration?: string
  match: number
  posterUrl?: string
  backdropUrl?: string
  overview?: string
  rating?: number
  voteCount?: number
  genres?: string[]
  accent?: string
  sourceNames?: string[]
}

export type SeriesDetails = Movie & {
  status?: string
  seasons?: number
  episodes?: number
  country?: string
  ageRating?: string
  trailerUrl?: string
  cast: { id: string; name: string; character?: string; photoUrl?: string }[]
  similar: Movie[]
}
