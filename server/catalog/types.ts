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
  watchOptions: WatchOption[]
  externalLinks: ExternalLink[]
  cast: { id: string; name: string; character?: string; photoUrl?: string }[]
  similar: CatalogItem[]
}

export type WatchOption = { name: string; type: 'stream' | 'free' | 'rent' | 'buy'; logoUrl?: string; url: string; region?: string }
export type ExternalLink = { name: string; url: string }

export type PersonSummary = {
  id: string
  name: string
  department?: string
  photoUrl?: string
  knownFor: string[]
}

export type PersonDetails = PersonSummary & {
  biography?: string
  birthday?: string
  placeOfBirth?: string
  country?: string
  credits: CatalogItem[]
}

export type CatalogProvider = {
  name: string
  isConfigured: boolean
  search: (query: string) => Promise<CatalogItem[]>
}
