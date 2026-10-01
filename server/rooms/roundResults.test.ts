import { describe, expect, it } from 'vitest'
import { getWinners, isRoundDone } from './roundResults'

const movies = ['a', 'b']
const members = ['one', 'two']
const vote = (member_id: string, movie_id: string, value: 'up' | 'skip') => ({ member_id, movie_id, value })

describe('round results', () => {
  it('does not reveal a pair match after only one vote', () => {
    const votes = [vote('one', 'a', 'up')]
    expect(isRoundDone('couple', movies, members, votes)).toBe(false)
    expect(getWinners('couple', movies, members, votes)).toEqual([])
  })
  it('finishes a pair round as soon as both like the same film', () => {
    const votes = [vote('one', 'a', 'up'), vote('two', 'a', 'up')]
    expect(isRoundDone('couple', movies, members, votes)).toBe(true)
    expect(getWinners('couple', movies, members, votes)).toEqual(['a'])
  })
  it('returns a tie only after all group votes arrive', () => {
    const votes = [vote('one', 'a', 'up'), vote('one', 'b', 'skip'), vote('two', 'a', 'skip'), vote('two', 'b', 'up')]
    expect(isRoundDone('group', movies, members, votes.slice(0, 3))).toBe(false)
    expect(isRoundDone('group', movies, members, votes)).toBe(true)
    expect(getWinners('group', movies, members, votes)).toEqual(['a', 'b'])
  })
  it('completes without a winner when everyone skips', () => {
    const votes = members.flatMap((member) => movies.map((movie) => vote(member, movie, 'skip')))
    expect(isRoundDone('group', movies, members, votes)).toBe(true)
    expect(getWinners('group', movies, members, votes)).toEqual([])
  })
})
