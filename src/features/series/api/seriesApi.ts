import type { SeriesDetailsResponse } from '../model'

export async function fetchSeriesDetails(catalogId: string) {
  const response = await fetch(`/api/series/${encodeURIComponent(catalogId)}`)
  if (!response.ok) throw new Error(response.status === 404 ? 'Сериал не найден.' : 'Не удалось загрузить сериал.')
  const data = await response.json() as SeriesDetailsResponse
  return data.item
}
