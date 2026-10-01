import { afterEach, describe, expect, it, vi } from 'vitest'
import { getPersonDetails } from './peopleService'

afterEach(() => vi.unstubAllGlobals())

describe('TVMaze actor profiles', () => {
  it('includes linked series and deduplicates repeated roles', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ name: 'Example Actor', birthday: '1980-01-01', image: { medium: 'https://example.com/person.jpg' } })))
      .mockResolvedValueOnce(new Response(JSON.stringify([
        { _embedded: { show: { id: 12, name: 'First Show' } } },
        { _embedded: { show: { id: 12, name: 'First Show' } } },
        { _embedded: { show: { id: 13, name: 'Second Show' } } },
      ])))
    vi.stubGlobal('fetch', fetchMock)

    const person = await getPersonDetails('tvmaze:person:7')

    expect(person?.name).toBe('Example Actor')
    expect(person?.credits.map(({ id }) => id)).toEqual(['tvmaze:series:12', 'tvmaze:series:13'])
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('returns no profile for a missing actor', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 404 })))
    expect(await getPersonDetails('tvmaze:person:999')).toBeNull()
  })
})
