import { UserPlus } from 'lucide-react'

type Props = { name: string; busy: boolean; onNameChange: (name: string) => void; onJoin: () => void }

export function RoomJoin({ name, busy, onNameChange, onJoin }: Props) {
  return <section className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6">
    <h2 className="flex items-center gap-2 font-bold"><UserPlus size={18} />Присоединиться</h2>
    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
      <input value={name} maxLength={24} onChange={(event) => onNameChange(event.target.value)} placeholder="Твоё имя" className="min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-950 px-4 py-3 outline-none" />
      <button disabled={!name.trim() || busy} onClick={onJoin} className="rounded-xl bg-violet-500 px-5 py-3 font-bold disabled:opacity-50">Войти</button>
    </div>
  </section>
}
