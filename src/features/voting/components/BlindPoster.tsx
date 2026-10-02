import { Clapperboard, Sparkles } from 'lucide-react'

export function BlindPoster({ number, compact = false, short = false }: { number: number; compact?: boolean; short?: boolean }) {
  return <div aria-hidden="true" className={`relative grid w-full place-items-center overflow-hidden bg-[radial-gradient(circle_at_50%_35%,#51349a_0%,#17112e_45%,#090914_85%)] ${short ? 'h-48 sm:h-56' : compact ? 'aspect-[4/3]' : 'aspect-[2/3]'}`}>
    <span className="absolute left-4 top-4 rounded-lg border border-white/15 bg-black/20 px-2 py-1 text-xs font-bold text-violet-100">№{number}</span>
    <div className="absolute inset-[9%] rounded-[45%] border border-violet-300/10" />
    <div className="absolute inset-[20%] rounded-[45%] border border-violet-300/10" />
    <div className="relative grid place-items-center gap-4 text-center">
      <Sparkles className="text-amber-200" size={22} />
      <Clapperboard className="text-violet-200" size={48} strokeWidth={1.3} />
    </div>
  </div>
}
