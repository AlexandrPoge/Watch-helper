export function PagesPreviewNotice() {
  if (import.meta.env.MODE !== 'pages') return null
  const fullUrl = import.meta.env.VITE_FULL_APP_URL
  return (
    <aside className="relative z-40 border-b border-violet-300/20 bg-[#171429] px-4 py-2 text-center text-sm text-slate-200">
      GitHub Pages показывает демоверсию. Живой каталог и комнаты доступны на сервере Watch Helper.
      {fullUrl?.startsWith('https://') && <a href={fullUrl} className="ml-2 font-semibold text-violet-200 underline">Открыть полную версию</a>}
    </aside>
  )
}
