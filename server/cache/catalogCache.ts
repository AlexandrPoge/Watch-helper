import type { RequestHandler } from 'express'

type Entry = { body: unknown; expiresAt: number }
const cache = new Map<string, Entry>()
const maxEntries = 500

export const catalogCache: RequestHandler = (request, response, next) => {
  if (request.method !== 'GET' || !isCacheableApiPath(request.path)) return next()
  const key = request.originalUrl
  const cached = cache.get(key)
  if (cached && cached.expiresAt > Date.now()) {
    response.set({ 'X-Watchly-Cache': 'HIT', 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' })
    return response.json(cached.body)
  }
  if (cached) cache.delete(key)
  const originalJson = response.json.bind(response)
  response.json = ((body: unknown) => {
    if (response.statusCode === 200 && response.getHeader('X-Watchly-Partial') !== '1') {
      pruneCache()
      cache.set(key, { body, expiresAt: Date.now() + ttlFor(request.path) })
      response.set({ 'X-Watchly-Cache': 'MISS', 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' })
    }
    if (response.getHeader('X-Watchly-Partial') === '1') response.set('Cache-Control', 'no-store')
    return originalJson(body)
  }) as typeof response.json
  return next()
}

export function isCacheableApiPath(path: string) {
  if (path === '/api/movies/random') return false
  return path === '/api/movies' || path.startsWith('/api/movies/search') || path.startsWith('/api/movies/') || path.startsWith('/api/series') || path.startsWith('/api/people')
}

function ttlFor(path: string) {
  const isDetails = /^\/api\/(movies|series|people)\/[^/]+$/.test(path)
  return isDetails ? 30 * 60_000 : 5 * 60_000
}

function pruneCache() {
  if (cache.size < maxEntries) return
  const oldestKey = cache.keys().next().value
  if (oldestKey) cache.delete(oldestKey)
}
