import { useState } from 'react'

type Props = { text: string; className?: string; lines?: 3 | 4 | 5 }

export function ExpandableText({ text, className = '', lines = 4 }: Props) {
  const [expanded, setExpanded] = useState(false)
  const clamp = lines === 3 ? 'line-clamp-3' : lines === 5 ? 'line-clamp-5' : 'line-clamp-4'
  if (text.length < 280) return <p className={className}>{text}</p>
  return <div><p className={`${className} ${expanded ? '' : clamp}`}>{text}</p><button onClick={() => setExpanded(!expanded)} className="mt-2 text-sm font-bold text-violet-300 hover:text-violet-200">{expanded ? 'Свернуть' : 'Показать ещё'}</button></div>
}
