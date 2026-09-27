import type { SeriesDetailsResponse, SeriesFilters, SeriesResponse } from '../model'

export async function fetchSeries(filters: SeriesFilters, page = 1) {
  const query = new URLSearchParams({ page: String(page) })
  Object.entries(filters).forEach(([key, value]) => value && query.set(key, value))
  const response = await fetch(`/api/series?${query}`)
  if (!response.ok) throw new Error('Не удалось загрузить каталог сериалов.')
  return response.json() as Promise<SeriesResponse>
}

export async function fetchSeriesDetails(catalogId: string) {
  const response = await fetch(`/api/series/${encodeURIComponent(catalogId)}`)
  if (!response.ok) throw new Error(response.status === 404 ? 'Сериал не найден.' : 'Не удалось загрузить сериал.')
  const data = await response.json() as SeriesDetailsResponse
  return data.item
}
