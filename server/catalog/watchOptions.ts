import type { ExternalLink, WatchOption } from './types'

type Provider = { provider_id: number; provider_name: string; logo_path?: string }
type Region = { link?: string; flatrate?: Provider[]; free?: Provider[]; ads?: Provider[]; rent?: Provider[]; buy?: Provider[] }

export function mapTmdbWatch(results?: Record<string, Region>): WatchOption[] {
  if (!results) return []
  const regionCode = ['BY', 'RU'].find((code) => results[code]?.link)
  if (!regionCode) return []
  const region = results[regionCode]
  if (!region?.link) return []
  const groups: [WatchOption['type'], Provider[] | undefined][] = [
    ['stream', region.flatrate], ['free', [...(region.free ?? []), ...(region.ads ?? [])]],
    ['rent', region.rent], ['buy', region.buy],
  ]
  const seen = new Set<string>()
  return groups.flatMap(([type, providers]) => (providers ?? []).flatMap((provider) => {
    const key = `${type}:${provider.provider_id}`
    if (seen.has(key)) return []
    seen.add(key)
    return [{ name: provider.provider_name, type, logoUrl: provider.logo_path ? `https://image.tmdb.org/t/p/w92${provider.logo_path}` : undefined, url: region.link!, region: regionCode }]
  }))
}

export function tmdbExternalLinks(kind: 'movie' | 'tv', id: number, imdbId?: string): ExternalLink[] {
  return [
    { name: 'TMDB', url: `https://www.themoviedb.org/${kind}/${id}` },
    ...(imdbId ? [{ name: 'IMDb', url: `https://www.imdb.com/title/${imdbId}/` }] : []),
  ]
}
