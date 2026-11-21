import { Check, Share2 } from 'lucide-react'
import { useState } from 'react'
import { shareLink } from '../../../shared/lib/shareLink'

export function ShareMovieButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const share = async () => {
    setError('')
    const data = { title, text: `Посмотри «${title}» в Watchly`, url: window.location.href }
    const result = await shareLink(data)
    if (result === 'copied') { setCopied(true); window.setTimeout(() => setCopied(false), 2_000) }
    if (result === 'failed') setError('Не удалось поделиться. Скопируй адрес из строки браузера.')
  }
  return <div><button onClick={share} className="grid size-11 place-items-center rounded-xl border border-white/15 bg-black/20 transition hover:bg-white/10" title="Поделиться">{copied ? <Check size={18} /> : <Share2 size={18} />}</button><p role="status" className="max-w-48 text-xs text-amber-200">{error || (copied ? 'Ссылка скопирована' : '')}</p></div>
}
