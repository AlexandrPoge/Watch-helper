import { ArrowLeft, LoaderCircle, RotateCcw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AppHeader } from './AppHeader'

type Props = {
  loading: boolean
  title: string
  backTo: string
  onRetry: () => void
}

export function DetailState({ loading, title, backTo, onRetry }: Props) {
  return <main className="min-h-screen bg-[#090914] text-white">
    <AppHeader />
    <div className="mx-auto grid min-h-[65vh] max-w-xl place-items-center px-5 text-center">
      <div role={loading ? 'status' : 'alert'}>
        {loading ? <LoaderCircle className="mx-auto animate-spin text-violet-300" size={34} /> : <p className="text-5xl">🍿</p>}
        <h1 className="mt-5 text-2xl font-black">{loading ? 'Собираем информацию…' : title}</h1>
        {!loading && <>
          <p className="mt-2 text-sm text-slate-400">Источник может быть временно недоступен. Попробуй ещё раз или вернись к поиску.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button onClick={onRetry} className="inline-flex items-center gap-2 rounded-xl bg-violet-500 px-5 py-3 text-sm font-bold hover:bg-violet-400"><RotateCcw size={17} />Повторить</button>
            <Link to={backTo} className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3 text-sm font-bold hover:bg-white/8"><ArrowLeft size={17} />Назад</Link>
          </div>
        </>}
      </div>
    </div>
  </main>
}
