import { describe, expect, it } from 'vitest'
import { readCatalogFilters, writeCatalogParams } from './filterParams'

describe('catalog filter URLs', () => {
  it('keeps country with search and other filters', () => {
    const filters = { country: 'RU', genre: 'comedy', year: '2024', rating: '7', sort: 'rating' as const }
    const params = writeCatalogParams(filters, 'Тест')
    expect(params.get('country')).toBe('RU')
    expect(params.get('q')).toBe('Тест')
    expect(readCatalogFilters(params)).toEqual(filters)
  })
})
