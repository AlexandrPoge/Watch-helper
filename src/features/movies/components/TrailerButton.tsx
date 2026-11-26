import { CirclePlay, ExternalLink, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { getYoutubeEmbedUrl } from '../lib/trailerUrl'

export function TrailerButton({ url }: { url: string }) {
  const [open, setOpen] = useState(false)
  const dialog = useRef<HTMLDialogElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const embedUrl = getYoutubeEmbedUrl(url, window.location.origin)
  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previousOverflow }
  }, [open])

  return <>
    <button ref={trigger} type="button" onClick={() => { dialog.current?.showModal(); setOpen(true) }}
      className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-violet-200"><CirclePlay size={19} />Смотреть трейлер</button>
    <dialog ref={dialog} aria-labelledby="trailer-title"
      className="fixed inset-0 m-auto max-h-[calc(100dvh-1rem)] w-[calc(100%-1rem)] max-w-4xl overflow-y-auto rounded-2xl border border-white/12 bg-[#11111d] text-white shadow-2xl backdrop:bg-black/90 backdrop:backdrop-blur sm:max-h-[calc(100dvh-2rem)] sm:w-[calc(100%-2rem)] sm:rounded-3xl"
      onClick={event => { if (event.target === event.currentTarget) event.currentTarget.close() }}
      onClose={() => {
        if (dialog.current?.open) return
        setOpen(false)
        trigger.current?.focus({ preventScroll: true })
      }}>
      <div className="flex items-start justify-between gap-3 p-3 sm:p-4">
        <div><h2 id="trailer-title" className="font-black">Трейлер</h2><p className="mt-1 text-xs text-slate-500">Нажми Play — автовоспроизведение отключено.</p></div>
        <button type="button" onClick={() => dialog.current?.close()} aria-label="Закрыть трейлер" className="grid size-9 shrink-0 place-items-center rounded-xl hover:bg-white/10"><X size={19} /></button>
      </div>
      {open && (embedUrl ? <iframe src={embedUrl} title="Трейлер" referrerPolicy="strict-origin-when-cross-origin" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen className="aspect-video w-full bg-black" />
        : <TrailerFallback url={url} />)}
      <div className="flex flex-col items-stretch gap-3 border-t border-white/8 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <p className="text-xs text-slate-500">Если YouTube ограничен в твоём регионе, открой оригинал.</p>
        <a href={url} target="_blank" rel="noreferrer" className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/12 px-3 py-2 text-xs font-bold hover:bg-white/8"><ExternalLink size={14} />Открыть отдельно</a>
      </div>
    </dialog>
  </>
}

function TrailerFallback({ url }: { url: string }) {
  return <div className="grid aspect-video place-items-center bg-black"><a href={url} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-slate-950"><ExternalLink size={18} />Открыть трейлер</a></div>
}
