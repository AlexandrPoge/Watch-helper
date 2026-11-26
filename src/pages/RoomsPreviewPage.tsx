import { Link, useLocation } from 'react-router-dom'
import { fullAppUrl } from '../shared/config/pagesPreview'
import { AppHeader } from './components/AppHeader'

export function RoomsPreviewPage() {
  const { pathname, search } = useLocation()

  return <main className="min-h-screen bg-[#090914] text-white">
    <AppHeader />
    <section className="mx-auto max-w-2xl px-4 pb-28 pt-10 sm:px-6 sm:pt-16">
      <div className="tech-panel rounded-3xl border border-violet-300/20 bg-white/5 p-5 sm:p-8">
        <h1 className="text-3xl font-black">Кинокомнаты в полной версии</h1>
        <p className="mt-3 text-slate-300">Для создания комнаты, входа по приглашению и голосования нужен сервер Watch Helper.</p>
        {fullAppUrl
          ? <a href={`${fullAppUrl}${pathname}${search}`} className="mt-5 inline-flex rounded-xl bg-violet-500 px-4 py-3 font-bold hover:bg-violet-400">Продолжить в полной версии</a>
          : <><p className="mt-3 text-sm text-slate-400">Публичная ссылка на полную версию пока не настроена.</p>
            <Link to="/" className="mt-5 inline-flex rounded-xl bg-white/10 px-4 py-3 font-bold hover:bg-white/15">На главную</Link></>}
      </div>
    </section>
  </main>
}
