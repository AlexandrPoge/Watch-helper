import type { CatalogProvider } from '../types'

type TvMazeSearchResult = {
  score: number
  show: {
    id: number
    name: string
    premiered?: string
    summary?: string
    image?: { medium?: string }
    averageRuntime?: number
    genres?: string[]
  }
}

export const tvMazeProvider: CatalogProvider = {
  name: 'TVmaze',
  isConfigured: true,
  async search(query) {
    const url = new URL('https://api.tvmaze.com/search/shows')
    url.searchParams.set('q', query)
    const response = await fetch(url, { signal: AbortSignal.timeout(4_000) })
    if (!response.ok) throw new Error(`TVmaze returned ${response.status}`)
    const data = await response.json() as TvMazeSearchResult[]
    return data.map(({ score, show }) => ({
      id: `tvmaze:series:${show.id}`,
      title: show.name,
      kind: 'series',
      year: show.premiered ? Number.parseInt(show.premiered, 10) : undefined,
      duration: show.averageRuntime ? `${show.averageRuntime} мин` : undefined,
      overview: show.summary?.replace(/<[^>]*>/g, ''),
      genres: show.genres,
      posterUrl: show.image?.medium,
      match: Math.round(Math.min(99, Math.max(50, score * 100))),
      sourceNames: ['TVmaze'],
    }))
  },
}
