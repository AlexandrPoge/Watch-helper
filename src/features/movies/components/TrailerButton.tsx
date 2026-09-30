import { CirclePlay, ExternalLink, X } from 'lucide-react'
import { useEffect, useState } from 'react'

export function TrailerButton({ url }: { url: string }) {
  const [open, setOpen] = useState(false)
  const embedUrl = youtubeEmbed(url)
  useEffect(() => {
    if (!open) return
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [open])
  return <><button onClick={() => setOpen(true)} className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-violet-200"><CirclePlay size={19} />Смотреть трейлер</button>{open && <div role="dialog" aria-modal="true" aria-label="Трейлер" className="fixed inset-0 z-[70] grid place-items-center bg-black/85 p-4 backdrop-blur" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false) }}><div className="w-full max-w-4xl overflow-hidden rounded-3xl border border-white/12 bg-[#11111d] shadow-2xl"><div className="flex items-center justify-between p-4"><p className="font-black">Трейлер</p><button onClick={() => setOpen(false)} aria-label="Закрыть трейлер" className="grid size-9 place-items-center rounded-xl hover:bg-white/10"><X size={19} /></button></div>{embedUrl ? <iframe src={embedUrl} title="Трейлер" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen className="aspect-video w-full bg-black" /> : <div className="grid aspect-video place-items-center"><a href={url} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-slate-950"><ExternalLink size={18} />Открыть трейлер</a></div>}</div></div>}</>
}

function youtubeEmbed(source: string) {
  try {
    const url = new URL(source)
    const id = url.hostname.includes('youtu.be') ? url.pathname.slice(1) : url.searchParams.get('v')
    return id ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1` : undefined
  } catch {
    return undefined
  }
}
