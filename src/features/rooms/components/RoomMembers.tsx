import { Crown, X } from 'lucide-react'
import type { Room } from '../../../entities/room/model'

type Props = {
  room: Room
  onlineIds: string[]
  onRemove: (memberId: string) => void
}

export function RoomMembers({ room, onlineIds, onRemove }: Props) {
  const canRemove = room.status === 'open' && room.me?.isHost && room.round?.status !== 'active'

  return <section className="rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6">
    <h2 className="font-bold">Участники</h2>
    <div className="mt-4 grid gap-2 sm:grid-cols-2">
      {room.members.map((member) => <div key={member.id} className="flex items-center gap-3 rounded-2xl bg-slate-950/55 p-3">
        <span className={`size-2 shrink-0 rounded-full ${onlineIds.includes(member.id) ? 'bg-emerald-300' : 'bg-slate-600'}`} />
        <span className="min-w-0 flex-1 truncate text-sm font-bold">{member.name}</span>
        {member.isHost && <Crown size={15} className="text-amber-300" />}
        {canRemove && !member.isHost && <button onClick={() => onRemove(member.id)} aria-label={`Удалить ${member.name}`} className="rounded-lg p-1 text-slate-500 hover:bg-white/10 hover:text-rose-300"><X size={16} /></button>}
      </div>)}
    </div>
  </section>
}
