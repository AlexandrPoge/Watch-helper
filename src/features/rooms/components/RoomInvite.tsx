import { Check, Copy, Link2, QrCode, Share2 } from 'lucide-react'
import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'

type Props = { inviteUrl: string; roomCode: string; scope?: 'public' | 'local-network' }

export function RoomInvite({ inviteUrl, roomCode, scope }: Props) {
  const [copied, setCopied] = useState(false)
  const [showQr, setShowQr] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2_000)
  }
  const share = async () => {
    if (navigator.share) await navigator.share({ title: 'Кинокомната Watchly', text: 'Присоединяйся — выберем фильм вместе', url: inviteUrl })
    else await copy()
  }
  return (
    <aside className="rounded-3xl border border-violet-300/15 bg-violet-400/8 p-6"><Link2 className="text-violet-300" size={22} /><div className="mt-4 flex items-start justify-between gap-3"><div><h2 className="text-xl font-bold">Позови своих</h2><p className="mt-1 text-sm text-slate-400">Код комнаты <strong className="text-violet-200">{roomCode}</strong></p></div><button onClick={() => setShowQr(!showQr)} aria-label="Показать QR-код" className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/8 hover:bg-white/12"><QrCode size={19} /></button></div>
      {showQr && <div className="mx-auto mt-5 w-fit rounded-2xl bg-white p-3"><QRCodeSVG value={inviteUrl} size={164} bgColor="#ffffff" fgColor="#090914" level="M" /></div>}
      <p className="mt-4 break-all rounded-xl bg-black/20 p-3 text-xs text-violet-200">{inviteUrl}</p><p className="mt-2 text-xs text-slate-500">{scope === 'public' ? 'Ссылка доступна через интернет.' : 'Сейчас работает для устройств в одной Wi‑Fi сети.'}</p>
      <div className="mt-4 grid grid-cols-2 gap-2"><button onClick={copy} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-3 py-3 text-sm font-bold text-slate-950 hover:bg-violet-100">{copied ? <Check size={16} /> : <Copy size={16} />}{copied ? 'Готово' : 'Копировать'}</button><button onClick={share} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-3 py-3 text-sm font-bold hover:bg-white/8"><Share2 size={16} />Поделиться</button></div>
    </aside>
  )
}
