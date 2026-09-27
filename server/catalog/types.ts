export type MediaKind = 'movie' | 'series'

export type CatalogItem = {
  id: string
  title: string
  originalTitle?: string
  kind: MediaKind
  year?: number
  duration?: string
  overview?: string
  posterUrl?: string
  backdropUrl?: string
  rating?: number
  voteCount?: number
  genres?: string[]
  match: number
  sourceNames: string[]
}

export type SeriesDetails = CatalogItem & {
  status?: string
  seasons?: number
  episodes?: number
  country?: string
  ageRating?: string
  trailerUrl?: string
  cast: { id: string; name: string; character?: string; photoUrl?: string }[]
  similar: CatalogItem[]
}

export type CatalogProvider = {
  name: string
  isConfigured: boolean
  search: (query: string) => Promise<CatalogItem[]>
}
