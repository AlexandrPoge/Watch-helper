import { afterEach, describe, expect, it, vi } from 'vitest'
import { getRandomPoisk, randomPoiskUrl } from './randomPoisk'

afterEach(() => vi.unstubAllGlobals())

describe('PoiskKino random choice', () => {
  it('applies country, format, genre, duration and previous-title exclusion', () => {
    const url = randomPoiskUrl({ kind: 'series', country: 'RU', genre: 'comedy', maxRuntime: 60, excludeId: 'kinopoisk:series:42' })
    expect(url.searchParams.get('countries.name')).toBe('Россия')
    expect(url.searchParams.get('type')).toBe('tv-series')
    expect(url.searchParams.get('genres.name')).toBe('комедия')
    expect(url.searchParams.get('seriesLength')).toBe('1-60')
    expect(url.searchParams.get('id')).toBe('!42')
    expect(randomPoiskUrl({ kind: 'animation', country: 'SU' }).searchParams.get('type')).toBe('cartoon')
  })

  it('maps a Russian film into a usable detail link', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({
      id: 41519, name: 'Брат', year: 1997, rating: { kp: 8.4 },
      countries: [{ name: 'Россия' }], poster: { url: 'https://example.com/poster.jpg' },
    }), { status: 200 })))

    const item = await getRandomPoisk({ kind: 'movie', country: 'RU' }, 'test')

    expect(item?.id).toBe('kinopoisk:movie:41519')
    expect(item?.originCountries).toEqual(['RU'])
    expect(item?.sourceNames).toEqual(['PoiskKino'])
  })
})
