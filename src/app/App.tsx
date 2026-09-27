import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-100">
        <section className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-indigo-300">
            Watch Helper
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Найдём фильм для любого вечера
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-slate-300">
            Персональные рекомендации, выбор для пары и совместные кинопросмотры.
          </p>
        </section>
      </main>
    </QueryClientProvider>
  )
}
