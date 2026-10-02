import { describe, expect, it } from 'vitest'
import { randomDiscoverUrl } from './randomDiscover'

describe('random discovery', () => {
  it('separates films from animation', () => {
    const movie = randomDiscoverUrl('key', { kind: 'movie', genre: 'comedy' }, 3)
    const animation = randomDiscoverUrl('key', { kind: 'animation', genre: 'comedy' }, 3)
    expect(movie.pathname).toBe('/3/discover/movie')
    expect(movie.searchParams.get('without_genres')).toBe('16')
    expect(movie.searchParams.get('with_genres')).toBe('35')
    expect(animation.searchParams.get('with_genres')).toBe('16,35')
    expect(animation.searchParams.has('without_genres')).toBe(false)
  })

  it('uses TV discovery and runtime for series', () => {
    const series = randomDiscoverUrl('key', { kind: 'series', genre: 'fantasy', country: 'RU', maxRuntime: 60 }, 2)
    expect(series.pathname).toBe('/3/discover/tv')
    expect(series.searchParams.get('with_genres')).toBe('10765')
    expect(series.searchParams.get('with_runtime.lte')).toBe('60')
    expect(series.searchParams.get('page')).toBe('2')
    expect(series.searchParams.get('with_origin_country')).toBe('RU')
  })
})
