import { env } from '../../config/env'
import type { CatalogProvider } from '../types'

type OmdbSearchItem = { imdbID: string; Title: string; Year: string; Type: 'movie' | 'series'; Poster: string }
type OmdbResponse = { Response: 'True' | 'False'; Search?: OmdbSearchItem[] }

export const omdbProvider: CatalogProvider = {
  name: 'OMDb',
  isConfigured: Boolean(env.omdbKey),
  async search(query) {
    if (!env.omdbKey) return []
    const url = new URL('https://www.omdbapi.com/')
    url.searchParams.set('apikey', env.omdbKey)
    url.searchParams.set('s', query)
    const response = await fetch(url)
    if (!response.ok) throw new Error(`OMDb returned ${response.status}`)
    const data = await response.json() as OmdbResponse
    if (data.Response === 'False') return []
    return (data.Search ?? []).map((item) => ({
      id: `omdb:${item.Type}:${item.imdbID}`,
      title: item.Title,
      kind: item.Type,
      year: Number.parseInt(item.Year, 10),
      posterUrl: item.Poster === 'N/A' ? undefined : item.Poster,
      match: 70,
      sourceNames: ['OMDb'],
    }))
  },
}
