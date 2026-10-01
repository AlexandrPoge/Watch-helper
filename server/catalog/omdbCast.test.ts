import { describe, expect, it } from 'vitest'
import { mapOmdbCast } from './omdbCast'

describe('OMDb cast mapping', () => {
  it('keeps actor names available for in-app search', () => {
    expect(mapOmdbCast('Tom Hanks, Meg Ryan')).toEqual([
      { id: 'search:person:Tom Hanks', name: 'Tom Hanks' },
      { id: 'search:person:Meg Ryan', name: 'Meg Ryan' },
    ])
  })
  it('does not display placeholder actors', () => {
    expect(mapOmdbCast('N/A')).toEqual([])
  })
})
