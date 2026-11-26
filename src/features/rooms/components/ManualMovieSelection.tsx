import type { Ref } from 'react'
import { maxManualCandidates, minManualCandidates } from '../../../entities/room/roundLimits'
import { RoomMoviePicker, type RoomMovieOption } from './RoomMoviePicker'

type Props = { selected: RoomMovieOption[]; onChange: (movies: RoomMovieOption[]) => void; disabled: boolean; listHeadingRef: Ref<HTMLHeadingElement> }

export function ManualMovieSelection({ selected, onChange, disabled, listHeadingRef }: Props) {
  return (
    <div className="mt-4 space-y-3">
      <RoomMoviePicker selectedIds={new Set(selected.map(movie => movie.id))}
        disabled={disabled} selectionDisabled={selected.length >= maxManualCandidates} onSelect={movie => onChange([...selected, movie])}
        actionLabel="Добавить" selectedLabel="Добавлен" />
      <h3 ref={listHeadingRef} tabIndex={-1} className="scroll-mt-24 text-sm font-bold">Список голосования</h3>
      <p role="status" className="text-sm text-slate-300">Выбрано {selected.length} из {maxManualCandidates}. Для раунда нужно минимум {minManualCandidates} фильма.</p>
      {selected.length > 0 && <ol aria-label="Фильмы для голосования" className="space-y-2">{selected.map(movie =>
        <li key={movie.id} className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-3 py-2 text-sm">
          <span>{movie.title}{movie.year ? ` · ${movie.year}` : ''}</span>
          <button type="button" disabled={disabled} onClick={() => onChange(selected.filter(item => item.id !== movie.id))}
            aria-label={`Убрать «${movie.title}» из списка`} className="shrink-0 rounded-lg px-2 py-2 text-violet-200 underline disabled:opacity-50">Убрать</button>
        </li>,
      )}</ol>}
    </div>
  )
}
