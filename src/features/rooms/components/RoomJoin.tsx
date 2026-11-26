import { UserPlus } from 'lucide-react'

type Props = { name: string; busy: boolean; onNameChange: (name: string) => void; onJoin: () => void }

export function RoomJoin({ name, busy, onNameChange, onJoin }: Props) {
  return <form aria-labelledby="room-join-title" className="mb-4 rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6"
    onSubmit={event => {
      event.preventDefault()
      if (name.trim() && !busy) onJoin()
    }}>
    <h2 id="room-join-title" className="flex items-center gap-2 font-bold"><UserPlus size={18} />Присоединиться</h2>
    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
      <label htmlFor="room-guest-name" className="sr-only">Твоё имя</label>
      <input id="room-guest-name" value={name} maxLength={24} required autoComplete="nickname" enterKeyHint="go"
        onChange={event => onNameChange(event.target.value)} placeholder="Твоё имя" className="min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-950 px-4 py-3" />
      <button type="submit" disabled={!name.trim() || busy} className="rounded-xl bg-violet-500 px-5 py-3 font-bold disabled:opacity-50">{busy ? 'Входим…' : 'Войти'}</button>
    </div>
  </form>
}
