import { afterEach, describe, expect, it, vi } from 'vitest'
import { browseMovies } from './movieBrowseService'

vi.mock('../config/env', () => ({
  env: { tmdbApiKey: 'test', kinopoiskDevToken: 'test' },
}))

afterEach(() => vi.unstubAllGlobals())

describe('movie browsing', () => {
  it('filters both providers by production country and prioritizes Russian catalog', async () => {
    const requests: URL[] = []
    vi.stubGlobal('fetch', vi.fn(async (input: URL) => {
      requests.push(input)
      const body = input.hostname === 'api.poiskkino.dev'
        ? { docs: [{ id: 41519, name: 'Брат', year: 1997, countries: [{ name: 'Россия' }], votes: { kp: 1_000_000 } }] }
        : { results: [{ id: 1, title: 'Test', release_date: '2020-01-01', vote_average: 9, popularity: 100 }] }
      return new Response(JSON.stringify(body), { status: 200 })
    }))

    const result = await browseMovies({ country: 'RU', sort: 'popular', page: 1 })

    expect(result.partial).toBe(false)
    expect(result.items[0].id).toBe('kinopoisk:movie:41519')
    expect(requests.find((url) => url.hostname === 'api.poiskkino.dev')?.searchParams.get('countries.name')).toBe('Россия')
    expect(requests.find((url) => url.hostname === 'api.poiskkino.dev')?.searchParams.get('sortField')).toBe('votes.kp')
    expect(requests.find((url) => url.hostname === 'api.themoviedb.org')?.searchParams.get('with_origin_country')).toBe('RU')
  })

  it('marks incomplete results when a provider times out', async () => {
    vi.stubGlobal('fetch', vi.fn(async (input: URL) => {
      if (input.hostname === 'api.poiskkino.dev') throw new Error('timeout')
      return new Response(JSON.stringify({ results: [{ id: 1, title: 'Test', release_date: '2020-01-01' }] }), { status: 200 })
    }))

    const result = await browseMovies({ country: 'RU' })

    expect(result.partial).toBe(true)
    expect(result.items).toHaveLength(1)
  })
})
