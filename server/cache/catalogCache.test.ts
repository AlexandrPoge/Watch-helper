import { describe, expect, it } from 'vitest'
import { isCacheableApiPath } from './catalogCache'

describe('catalog cache routes', () => {
  it('кэширует каталоги, поиск и детали', () => {
    expect(isCacheableApiPath('/api/movies/search')).toBe(true)
    expect(isCacheableApiPath('/api/movies/tmdb:movie:42')).toBe(true)
    expect(isCacheableApiPath('/api/series')).toBe(true)
    expect(isCacheableApiPath('/api/people/tmdb:person:1')).toBe(true)
  })

  it('не кэширует случайный выбор и комнаты', () => {
    expect(isCacheableApiPath('/api/movies/random')).toBe(false)
    expect(isCacheableApiPath('/api/rooms/ABC')).toBe(false)
  })
})
