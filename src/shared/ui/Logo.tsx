import { Clapperboard } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Logo() {
  return (
    <Link className="flex items-center gap-2.5 text-lg font-black tracking-tight" to="/">
      <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/25"><Clapperboard size={19} strokeWidth={2.6} /></span>
      watch<span className="text-violet-300">ly</span>
    </Link>
  )
}
