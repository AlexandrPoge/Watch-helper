import { describe, expect, it } from 'vitest'
import { isAllowedImageUrl } from './imageProxyRoutes'

describe('image proxy allowlist', () => {
  it('разрешает только известные HTTPS-хосты изображений', () => {
    expect(isAllowedImageUrl('https://image.tmdb.org/t/p/w500/poster.jpg')).toBe(true)
    expect(isAllowedImageUrl('https://static.tvmaze.com/uploads/images/a.jpg')).toBe(true)
    expect(isAllowedImageUrl('http://image.tmdb.org/poster.jpg')).toBe(false)
  })

  it('блокирует локальные адреса и похожие домены', () => {
    expect(isAllowedImageUrl('https://image.tmdb.org.evil.test/a.jpg')).toBe(false)
    expect(isAllowedImageUrl('https://127.0.0.1/private')).toBe(false)
  })
})
