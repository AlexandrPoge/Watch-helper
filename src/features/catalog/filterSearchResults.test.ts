import { describe, expect, it } from 'vitest'
import { filterSearchResults } from './filterSearchResults'
import type { CatalogFilters } from './model'

const filters: CatalogFilters = { genre: 'animation', country: 'RU', year: '2024', rating: '7', sort: 'rating' }

describe('catalog search filters', () => {
  it('keeps only matching media with a verified genre and sorts by rating', () => {
    const items = [
      { id: 'a', title: 'Первый', kind: 'movie' as const, year: 2024, rating: 7.2, genres: ['Анимация'], originCountries: ['RU'], match: 80 },
      { id: 'b', title: 'Второй', kind: 'movie' as const, year: 2024, rating: 8.1, genres: ['мультфильм'], originCountries: ['RU'], match: 70 },
      { id: 'c', title: 'Сериал', kind: 'series' as const, year: 2024, rating: 9, genres: ['Анимация'], originCountries: ['RU'], match: 90 },
      { id: 'd', title: 'Без жанра', kind: 'movie' as const, year: 2024, rating: 8, match: 60 },
      { id: 'e', title: 'Не из России', kind: 'movie' as const, year: 2024, rating: 9, genres: ['Анимация'], originCountries: ['US'], match: 90 },
    ]
    expect(filterSearchResults(items, 'movie', filters).map((item) => item.id)).toEqual(['b', 'a'])
  })
})
