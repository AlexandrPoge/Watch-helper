export function parseCatalogId(value: string, kind: 'movie' | 'series' | 'person') {
  const [provider, type, id, extra] = value.split(':')
  if (extra !== undefined || type !== kind) return null
  if (provider === 'omdb') {
    return kind !== 'person' && /^tt\d{1,15}$/.test(id ?? '') ? { provider, id } : null
  }
  if (!['tmdb', 'kinopoisk', 'tvmaze'].includes(provider) || (provider === 'tvmaze' && kind === 'movie')) return null
  return /^[1-9]\d{0,14}$/.test(id ?? '') ? { provider, id } : null
}
