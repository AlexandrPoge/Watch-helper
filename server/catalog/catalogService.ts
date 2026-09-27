import { omdbProvider } from './providers/omdbProvider'
import { kinopoiskDevProvider } from './providers/kinopoiskDevProvider'
import { tmdbProvider } from './providers/tmdbProvider'
import { tvMazeProvider } from './providers/tvMazeProvider'
import type { CatalogItem, CatalogProvider } from './types'

const providers: CatalogProvider[] = [tmdbProvider, kinopoiskDevProvider, omdbProvider, tvMazeProvider]

export async function searchCatalog(query: string) {
  const settled = await Promise.allSettled(providers.map((provider) => provider.search(query)))
  const results = settled.flatMap((result) => result.status === 'fulfilled' ? result.value : [])
  return mergeCatalogItems(results).slice(0, 24)
}

export function getCatalogStatus() {
  return providers.map(({ name, isConfigured }) => ({ name, isConfigured }))
}

export function mergeCatalogItems(items: CatalogItem[]) {
  const uniqueItems = new Map<string, CatalogItem>()
  items.forEach((item) => {
    const key = `${item.title.toLocaleLowerCase()}-${item.year ?? 'unknown'}`
    const savedItem = uniqueItems.get(key)
    if (!savedItem) return void uniqueItems.set(key, item)
    uniqueItems.set(key, {
      ...savedItem,
      match: Math.max(savedItem.match, item.match),
      posterUrl: savedItem.posterUrl ?? item.posterUrl,
      overview: savedItem.overview ?? item.overview,
      sourceNames: [...new Set([...savedItem.sourceNames, ...item.sourceNames])],
    })
  })
  return [...uniqueItems.values()].sort((first, second) => second.match - first.match)
}
