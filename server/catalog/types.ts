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
  match: number
  sourceNames: string[]
}

export type CatalogProvider = {
  name: string
  isConfigured: boolean
  search: (query: string) => Promise<CatalogItem[]>
}
