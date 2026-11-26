import { omdbProvider } from './providers/omdbProvider'
import { poiskKinoProvider } from './providers/kinopoiskDevProvider'
import { tmdbProvider } from './providers/tmdbProvider'
import { tvMazeProvider } from './providers/tvMazeProvider'
import type { CatalogItem, CatalogProvider } from './types'

const providers: CatalogProvider[] = [tmdbProvider, poiskKinoProvider, omdbProvider, tvMazeProvider]

export async function searchCatalog(query: string) {
  const settled = await Promise.allSettled(providers.filter((provider) => provider.isConfigured).map((provider) => provider.search(query)))
  if (settled.every((result) => result.status === 'rejected')) throw new Error('Search providers unavailable')
  const results = settled.flatMap((result) => result.status === 'fulfilled' ? result.value : [])
  return mergeCatalogItems(results, query).slice(0, 24)
}

export function getCatalogStatus() {
  return providers.map(({ name, isConfigured }) => ({ name, isConfigured }))
}

export function mergeCatalogItems(items: CatalogItem[], query?: string) {
  const uniqueItems = new Map<string, CatalogItem>()
  items.forEach((item) => {
    const key = `${item.kind}-${item.title.toLocaleLowerCase()}-${item.year ?? 'unknown'}`
    const savedItem = uniqueItems.get(key)
    if (!savedItem) return void uniqueItems.set(key, item)
    uniqueItems.set(key, {
      ...savedItem,
      match: Math.max(savedItem.match, item.match),
      originalTitle: savedItem.originalTitle ?? item.originalTitle,
      posterUrl: savedItem.posterUrl ?? item.posterUrl,
      overview: savedItem.overview ?? item.overview,
      originCountries: [...new Set([...(savedItem.originCountries ?? []), ...(item.originCountries ?? [])])],
      sourceNames: [...new Set([...savedItem.sourceNames, ...item.sourceNames])],
    })
  })
  const searchTitle = query?.trim().toLocaleLowerCase()
  const matchesTitle = (item: CatalogItem) => Boolean(searchTitle &&
    (item.title.toLocaleLowerCase() === searchTitle || item.originalTitle?.toLocaleLowerCase() === searchTitle))
  return [...uniqueItems.values()].sort((first, second) =>
    Number(matchesTitle(second)) - Number(matchesTitle(first)) || second.match - first.match)
}
