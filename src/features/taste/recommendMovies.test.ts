import { describe, expect, it } from 'vitest'
import type { Movie } from '../../entities/movie/model'
import { recommendMovies } from './recommendMovies'

const items: Movie[] = [
  { id: 'space', title: 'Космос', match: 90, genres: ['Фантастика'] },
  { id: 'case', title: 'Дело', match: 75, genres: ['Детектив'] },
]

describe('recommendMovies', () => {
  it('поднимает выбранные жанры выше базового рейтинга', () => {
    expect(recommendMovies(items, ['Детектив'], [])[0].id).toBe('case')
  })

  it('опускает отмеченные как неинтересные фильмы', () => {
    const reactions = [{ movie: items[0], value: 'dislike' as const }]
    expect(recommendMovies(items, [], reactions)[0].id).toBe('case')
  })
})
