import type { VoteValue } from './types'

type Vote = { member_id: string; movie_id: string; value: VoteValue }

export function getWinners(mode: 'couple' | 'group', movieIds: string[], memberIds: string[], votes: Vote[]) {
  if (!movieIds.length || !memberIds.length) return []
  if (mode === 'couple') return movieIds.filter((id) => memberIds.every((member) => votes.some((vote) => vote.member_id === member && vote.movie_id === id && vote.value === 'up'))).slice(0, 1)
  const scores = movieIds.map((id) => ({ id, score: votes.filter((vote) => vote.movie_id === id && vote.value === 'up').length }))
  const max = Math.max(...scores.map((item) => item.score))
  return max ? scores.filter((item) => item.score === max).map((item) => item.id) : []
}

export function isRoundDone(mode: 'couple' | 'group', movieIds: string[], memberIds: string[], votes: Vote[]) {
  if (mode === 'couple' && getWinners(mode, movieIds, memberIds, votes).length) return true
  return memberIds.every((member) => movieIds.every((id) => votes.some((vote) => vote.member_id === member && vote.movie_id === id)))
}
