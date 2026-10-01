import { describe, expect, it } from 'vitest'
import { isActor } from './poiskCast'

describe('PoiskKino cast filtering', () => {
  it('accepts English and Russian actor professions', () => {
    expect(isActor({ enProfession: 'actor' })).toBe(true)
    expect(isActor({ enProfession: 'actress' })).toBe(true)
    expect(isActor({ profession: 'Актёр' })).toBe(true)
    expect(isActor({ profession: 'Актриса' })).toBe(true)
  })

  it('omits people with unrelated roles', () => {
    expect(isActor({ enProfession: 'director' })).toBe(false)
    expect(isActor({ profession: 'Режиссёр' })).toBe(false)
  })
})
