import { Check, Share2 } from 'lucide-react'
import { useState } from 'react'

export function ShareMovieButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false)
  const share = async () => {
    const data = { title, text: `Посмотри «${title}» в Watchly`, url: window.location.href }
    if (navigator.share) await navigator.share(data)
    else { await navigator.clipboard.writeText(data.url); setCopied(true); window.setTimeout(() => setCopied(false), 2_000) }
  }
  return <button onClick={share} className="grid size-11 place-items-center rounded-xl border border-white/15 bg-black/20 transition hover:bg-white/10" title="Поделиться">{copied ? <Check size={18} /> : <Share2 size={18} />}</button>
}
