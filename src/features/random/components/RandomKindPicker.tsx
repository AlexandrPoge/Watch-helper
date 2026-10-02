import { Clapperboard, Film, Tv } from 'lucide-react'

export type RandomKind = 'movie' | 'animation' | 'series'
const choices = [
  { kind: 'movie' as const, label: 'Фильм', icon: Film, detail: 'Полный метр' },
  { kind: 'animation' as const, label: 'Мультфильм', icon: Clapperboard, detail: 'Анимация' },
  { kind: 'series' as const, label: 'Сериал', icon: Tv, detail: 'История надолго' },
]

export function RandomKindPicker({ value, onChange }: { value: RandomKind; onChange: (kind: RandomKind) => void }) {
  return <div role="group" aria-label="Что выбрать" className="grid grid-cols-3 gap-2 sm:gap-3">{choices.map(({ kind, label, icon: Icon, detail }) => <button key={kind} type="button" aria-pressed={value === kind} onClick={() => onChange(kind)} className={`interactive-control flex min-w-0 flex-col items-center gap-1 rounded-2xl border p-3 text-center transition sm:p-4 ${value === kind ? 'border-violet-300 bg-violet-400/20 shadow-[0_0_25px_rgb(167_139_250/.12)]' : 'border-white/10 bg-white/4 hover:border-white/30 hover:bg-white/8'}`}><Icon size={22} className={value === kind ? 'text-violet-200' : 'text-slate-400'} /><span className="text-xs font-black sm:text-sm">{label}</span><span className="hidden text-[11px] text-slate-400 sm:block">{detail}</span></button>)}</div>
}
