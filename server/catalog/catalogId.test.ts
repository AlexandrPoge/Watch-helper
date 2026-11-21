import { afterEach, expect, it, vi } from 'vitest'
import { getMovieDetails } from './movieDetailsService'
import { getSeriesDetails } from './seriesDetailsService'
import { getPersonDetails } from './peopleService'
import { parseCatalogId } from './catalogId'

afterEach(() => vi.unstubAllGlobals())
it.each(['../person/1', '1?key=value', '1#fragment', '1:extra', '%2F', '1/../../', ''])('rejects unsafe upstream ID %s before fetching', async (id) => {
  const fetch = vi.fn()
  vi.stubGlobal('fetch', fetch)
  expect(await getMovieDetails('kinopoisk:movie:' + id)).toBeNull()
  expect(await getSeriesDetails('tvmaze:series:' + id)).toBeNull()
  expect(await getPersonDetails('tmdb:person:' + id)).toBeNull()
  expect(fetch).not.toHaveBeenCalled()
})
it('accepts existing numeric and IMDb formats', () => {
  expect(parseCatalogId('tmdb:movie:1726', 'movie')?.id).toBe('1726')
  expect(parseCatalogId('omdb:series:tt1234567', 'series')?.id).toBe('tt1234567')
})
