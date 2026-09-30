import { Router, type Response } from 'express'

const maxImageBytes = 8 * 1024 * 1024
const allowedContentTypes = new Set(['image/avif', 'image/gif', 'image/jpeg', 'image/png', 'image/webp'])
const allowedHosts = [
  'image.tmdb.org', 'media.themoviedb.org', 'st.kp.yandex.net',
  'avatars.mds.yandex.net', 'image.openmoviedb.com', 'static.tvmaze.com',
  'm.media-amazon.com',
]

export const imageProxyRouter = Router()

imageProxyRouter.get('/api/images', async (request, response) => {
  const source = typeof request.query.url === 'string' ? request.query.url : ''
  if (!isAllowedImageUrl(source)) return response.status(400).json({ message: 'Unsupported image source.' })
  try {
    const upstream = await fetchAllowedImage(source)
    if (!upstream.ok || !isAllowedImageUrl(upstream.url)) return sendPlaceholder(response)
    const contentType = (upstream.headers.get('content-type') ?? '').split(';')[0]
    const contentLength = Number(upstream.headers.get('content-length') ?? 0)
    if (!allowedContentTypes.has(contentType) || contentLength > maxImageBytes) return sendPlaceholder(response)
    const body = await readLimited(upstream)
    response.set({ 'Content-Type': contentType, 'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800', 'X-Content-Type-Options': 'nosniff' })
    return response.send(body)
  } catch {
    return sendPlaceholder(response)
  }
})

async function fetchAllowedImage(source: string) {
  let current = source
  for (let redirect = 0; redirect <= 3; redirect += 1) {
    const response = await fetch(current, {
      headers: { Accept: 'image/avif,image/webp,image/png,image/jpeg,image/gif' },
      redirect: 'manual', signal: AbortSignal.timeout(7_000),
    })
    if (response.status < 300 || response.status >= 400) return response
    const location = response.headers.get('location')
    if (!location) throw new Error('Image redirect has no location.')
    current = new URL(location, current).toString()
    if (!isAllowedImageUrl(current)) throw new Error('Image redirect is not allowed.')
  }
  throw new Error('Too many image redirects.')
}

async function readLimited(response: globalThis.Response) {
  if (!response.body) throw new Error('Image response has no body.')
  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let total = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    total += value.byteLength
    if (total > maxImageBytes) {
      await reader.cancel()
      throw new Error('Image is too large.')
    }
    chunks.push(value)
  }
  return Buffer.concat(chunks, total)
}

export function isAllowedImageUrl(source: string) {
  try {
    const url = new URL(source)
    return url.protocol === 'https:' && allowedHosts.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`))
  } catch {
    return false
  }
}

function sendPlaceholder(response: Response) {
  response.set({ 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=300' })
  return response.status(200).send('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 750"><defs><linearGradient id="g"><stop stop-color="#312e81"/><stop offset="1" stop-color="#090914"/></linearGradient></defs><rect width="500" height="750" fill="url(#g)"/><text x="250" y="375" text-anchor="middle" fill="#c4b5fd" font-family="system-ui" font-size="42" font-weight="700">watchly</text></svg>')
}
