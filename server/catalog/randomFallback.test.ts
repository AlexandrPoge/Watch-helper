import { afterEach, expect, it, vi } from 'vitest'
import { getRandomMovie, getVotingMovies } from './randomMovieService'

vi.mock('../config/env', () => ({ env: { tmdbApiKey: 'test', kinopoiskDevToken: 'test' } }))
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks() })

it('varies fallback rounds and retries page one for narrow filters', async () => {
  const pages: number[] = []
  vi.stubGlobal('fetch', async (url: URL) => {
    if (url.hostname === 'api.themoviedb.org') throw new Error('timeout')
    const page = Number(url.searchParams.get('page'))
    pages.push(page)
    return Response.json({ docs: page === 1 ? [{ id: 1 }, { id: 2 }] : [] })
  })
  const random = vi.spyOn(Math, 'random').mockReturnValue(0)
  const first = await getVotingMovies(1)
  random.mockReturnValue(0.9)
  const second = await getVotingMovies(1)
  expect(pages).toEqual([1, 14, 1])
  expect(second[0].id).not.toBe(first[0].id)
})

it('keeps genre and runtime constraints when TMDB is unavailable', async () => {
  const movie = { id: 42, name: 'Example', poster: { url: 'https://example.test/poster' } }
  vi.stubGlobal('fetch', async (url: URL) => {
    if (url.hostname === 'api.themoviedb.org') throw new Error('timeout')
    expect(url.searchParams.get('genres.name')).toBe('комедия')
    expect(url.searchParams.get('movieLength')).toBe('1-90')
    return Response.json(url.pathname.endsWith('/random') ? movie : { docs: [movie] })
  })
  const filters = { genre: 'comedy', maxRuntime: 90 }
  expect((await getRandomMovie(filters))?.id).toBe('kinopoisk:movie:42')
  expect((await getVotingMovies(3, filters)).map(item => item.id)).toEqual(['kinopoisk:movie:42'])
})
