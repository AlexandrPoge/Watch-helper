import type { Round } from './types'

export function presentRound(round: Round, voteIds: Map<string, string>): Round {
  if (!round.blind || round.status !== 'active') return round
  return {
    ...round,
    candidates: round.candidates.map((movie, index) => ({
      id: voteIds.get(movie.id) ?? '',
      title: `Тайный фильм №${index + 1}`,
      year: 0,
      posterUrl: '',
      overview: clue(movie.title, movie.overview, movie.year),
    })),
    myVotes: round.myVotes.map((vote) => ({ ...vote, movieId: voteIds.get(vote.movieId) ?? '' })),
    winners: [],
  }
}

function clue(title: string, overview?: string, year?: number) {
  const decade = year ? `${Math.floor(year / 10) * 10}-е` : 'неизвестное десятилетие'
  const plot = overview?.trim().replace(new RegExp(escapeRegExp(title), 'gi'), 'эта история').replace(/\s+/g, ' ')
  const short = plot && plot.length > 160 ? `${plot.slice(0, 160).replace(/\s+\S*$/, '')}…` : plot
  return `${decade} · ${short || 'Сюжет держим в секрете — доверься интуиции.'}`
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
