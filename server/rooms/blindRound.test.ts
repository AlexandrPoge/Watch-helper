import { describe, expect, it } from 'vitest'
import { presentRound } from './blindRound'
import type { Round } from './types'

const original: Round = {
  id: 'round-1', ordinal: 1, status: 'active', blind: true, mood: {},
  candidates: [{ id: 'tmdb:movie:42', title: 'Тайна', year: 2024, posterUrl: 'https://example.test/poster.jpg', rating: 8, overview: 'Тайна начинается в городе.' }],
  myVotes: [{ movieId: 'tmdb:movie:42', value: 'up' }], voteCount: 1, totalVotes: 2, winners: [], eligible: true,
}

describe('blind round presentation', () => {
  it('does not expose title, image, rating or real identifier during voting', () => {
    const view = presentRound(original, new Map([['tmdb:movie:42', 'opaque-vote-id']]))
    expect(view.candidates[0]).toMatchObject({ id: 'opaque-vote-id', title: 'Тайный фильм №1', posterUrl: '', year: 0 })
    expect(view.myVotes[0].movieId).toBe('opaque-vote-id')
    expect(JSON.stringify(view)).not.toMatch(/tmdb:movie:42|example\.test|"Тайна"|"rating"/)
  })

  it('reveals the original candidate after completion', () => {
    expect(presentRound({ ...original, status: 'completed' }, new Map()).candidates).toEqual(original.candidates)
  })

  it('keeps normal rounds unchanged', () => {
    expect(presentRound({ ...original, blind: false }, new Map()).candidates).toEqual(original.candidates)
  })
})
