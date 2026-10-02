import type { Movie } from '../../entities/movie/model'
import type { CatalogFilters, CatalogKind } from './model'

const genreNames: Record<string, string[]> = {
  action: ['боевик', 'action'], animation: ['анимация', 'мультфильм', 'animation'],
  comedy: ['комедия', 'comedy'], crime: ['криминал', 'crime'],
  documentary: ['документальный', 'documentary'], drama: ['драма', 'drama'],
  fantasy: ['фэнтези', 'fantasy'], horror: ['ужасы', 'horror'],
  romance: ['мелодрама', 'романтика', 'romance'], sciFi: ['фантастика', 'science-fiction', 'sci-fi'],
  thriller: ['триллер', 'thriller'],
}

export function filterSearchResults(items: Movie[], kind: CatalogKind, filters: CatalogFilters) {
  const filtered = items.filter((item) => {
    if ((item.kind ?? 'movie') !== kind) return false
    if (filters.country && !item.originCountries?.includes(filters.country)) return false
    if (filters.year && String(item.year) !== filters.year) return false
    if (filters.rating && (item.rating ?? 0) < Number(filters.rating)) return false
    const aliases = genreNames[filters.genre]
    return !aliases || item.genres?.some((genre) => aliases.some((alias) => genre.toLocaleLowerCase().includes(alias)))
  })
  return filtered.sort((a, b) => {
    if (filters.sort === 'newest') return (b.year ?? 0) - (a.year ?? 0)
    if (filters.sort === 'rating') return (b.rating ?? 0) - (a.rating ?? 0)
    return b.match - a.match
  })
}
