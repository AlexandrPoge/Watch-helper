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
  watchOptions: WatchOption[]
  externalLinks: { name: string; url: string }[]
  cast: { id: string; name: string; character?: string; photoUrl?: string }[]
  similar: Movie[]
}

export type WatchOption = { name: string; type: 'stream' | 'free' | 'rent' | 'buy'; logoUrl?: string; url: string; region?: string }
