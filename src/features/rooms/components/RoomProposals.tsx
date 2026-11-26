import type { Room, RoomMovie } from '../../../entities/room/model'
import { maxManualCandidates, maxRoomProposals } from '../../../entities/room/roundLimits'
import { RoomMoviePicker } from './RoomMoviePicker'

type Props = {
  room: Room
  selectedIds: ReadonlySet<string>
  busy: boolean
  error?: string
  onPropose: (movieId: string) => void
  onRemove: (movieId: string) => void
  onAddToRound: (movie: RoomMovie) => void
}

export function RoomProposals({ room, selectedIds, busy, error, onPropose, onRemove, onAddToRound }: Props) {
  const { me, proposals = [] } = room
  if (!me || room.status !== 'open' || room.round?.status === 'active') return null

  const full = proposals.length >= maxRoomProposals
  const roundListFull = selectedIds.size >= maxManualCandidates

  return <section className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6">
    <h2 className="text-xl font-black">Предложения фильмов</h2>
    {proposals.length === 0
      ? <p className="mt-2 text-sm text-slate-400">Пока никто не предложил фильм.</p>
      : <ul aria-label="Предложенные фильмы" className="mt-4 space-y-2">{proposals.map(({ movie, memberId, memberName }) => {
        const selected = selectedIds.has(movie.id)
        return <li key={movie.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/5 px-3 py-2 text-sm">
          <div className="min-w-0 break-words">
            <p className="font-semibold">{movie.title}{movie.year ? ` · ${movie.year}` : ''}</p>
            <p className="mt-1 text-xs text-slate-400">Предложение от {memberName}</p>
          </div>
          <div className="flex flex-wrap gap-1">
            {me.isHost && <button type="button" disabled={busy || selected || roundListFull} onClick={() => onAddToRound(movie)}
              className="rounded-lg px-2 py-2 font-semibold text-violet-200 hover:bg-white/10 disabled:opacity-50">
              {selected ? 'В списке голосования' : 'В список голосования'}
            </button>}
            {(me.isHost || me.id === memberId) && <button type="button" disabled={busy} onClick={() => onRemove(movie.id)}
              aria-label={`Снять предложение «${movie.title}»`} className="rounded-lg px-2 py-2 text-slate-300 hover:bg-white/10 hover:text-rose-200 disabled:opacity-50">
              Снять
            </button>}
          </div>
        </li>
      })}</ul>}
    {me.isHost && roundListFull && proposals.some(({ movie }) => !selectedIds.has(movie.id)) &&
      <p className="mt-3 text-sm text-slate-400">В списке голосования уже {maxManualCandidates} фильмов. Убери один из списка, чтобы добавить другой.</p>}
    {full
      ? <p className="mt-3 text-sm text-slate-400">В комнате уже {maxRoomProposals} предложений.</p>
      : <details className="mt-3 rounded-xl border border-white/10 px-3 py-2">
        <summary className="cursor-pointer py-1 text-sm font-semibold text-violet-200">Предложить фильм</summary>
        <div className="mt-3 space-y-3">
          <RoomMoviePicker selectedIds={new Set(proposals.map(({ movie }) => movie.id))} disabled={busy}
            onSelect={movie => onPropose(movie.id)} actionLabel="Предложить" selectedLabel="Уже предложен" />
        </div>
      </details>}
    {error && <p role="alert" className="mt-3 rounded-xl border border-rose-300/20 bg-rose-300/10 p-3 text-sm text-rose-200">{error}</p>}
  </section>
}
