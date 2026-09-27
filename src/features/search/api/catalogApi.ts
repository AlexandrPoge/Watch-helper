import type { Movie } from '../../../entities/movie/model'

type CatalogResponse = { items: Movie[] }

export async function searchCatalog(query: string) {
  const response = await fetch(`/api/movies/search?q=${encodeURIComponent(query)}`)
  if (!response.ok) throw new Error('Не удалось получить фильмы из каталогов.')
  const data = await response.json() as CatalogResponse
  return data.items
}
