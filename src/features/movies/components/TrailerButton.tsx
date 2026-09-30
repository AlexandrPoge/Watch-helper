import { CirclePlay, ExternalLink, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getYoutubeEmbedUrl } from '../lib/trailerUrl'

export function TrailerButton({ url }: { url: string }) {
  const [open, setOpen] = useState(false)
  const embedUrl = getYoutubeEmbedUrl(url, window.location.origin)
  useEffect(() => {
    if (!open) return
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', close)
    return () => { window.removeEventListener('keydown', close); document.body.style.overflow = previousOverflow }
  }, [open])
  return <><button onClick={() => setOpen(true)} className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-violet-200"><CirclePlay size={19} />Смотреть трейлер</button>{open && <div role="dialog" aria-modal="true" aria-label="Трейлер" className="fixed inset-0 z-[70] grid place-items-center bg-black/90 p-4 backdrop-blur" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false) }}><div className="w-full max-w-4xl overflow-hidden rounded-3xl border border-white/12 bg-[#11111d] shadow-2xl"><div className="flex items-center justify-between p-4"><div><p className="font-black">Трейлер</p><p className="text-xs text-slate-500">Нажми Play — автовоспроизведение отключено для стабильной работы.</p></div><button onClick={() => setOpen(false)} aria-label="Закрыть трейлер" className="grid size-9 place-items-center rounded-xl hover:bg-white/10"><X size={19} /></button></div>{embedUrl ? <iframe src={embedUrl} title="Трейлер" referrerPolicy="strict-origin-when-cross-origin" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen className="aspect-video w-full bg-black" /> : <TrailerFallback url={url} />}<div className="flex items-center justify-between gap-3 border-t border-white/8 p-4"><p className="text-xs text-slate-500">Если YouTube ограничен в твоём регионе, открой оригинал.</p><a href={url} target="_blank" rel="noreferrer" className="flex shrink-0 items-center gap-2 rounded-xl border border-white/12 px-3 py-2 text-xs font-bold hover:bg-white/8"><ExternalLink size={14} />Открыть отдельно</a></div></div></div>}</>
}

function TrailerFallback({ url }: { url: string }) {
  return <div className="grid aspect-video place-items-center bg-black"><a href={url} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-slate-950"><ExternalLink size={18} />Открыть трейлер</a></div>
}
