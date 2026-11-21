import { describe, expect, it } from 'vitest'
import { mergeCatalogItems } from './catalogService'

describe('mergeCatalogItems', () => {
  it('keeps a film and a series with the same title and year distinct', () => {
    const movie = { id: 'film', title: 'Home', kind: 'movie' as const, year: 2020, match: 76, sourceNames: ['TMDB'] }
    expect(mergeCatalogItems([movie, { ...movie, id: 'show', kind: 'series' }])).toHaveLength(2)
  })
  it('объединяет одинаковые фильмы и сохраняет их источники', () => {
    const base = { title: 'Дюна', kind: 'movie' as const, year: 2021, match: 70 }
    const result = mergeCatalogItems([
      { ...base, id: 'tmdb:1', sourceNames: ['TMDB'] },
      { ...base, id: 'omdb:1', match: 85, sourceNames: ['OMDb'] },
    ])

    expect(result).toEqual([expect.objectContaining({
      id: 'tmdb:1',
      match: 85,
      sourceNames: ['TMDB', 'OMDb'],
    })])
  })
})
