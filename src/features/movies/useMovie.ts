import { useQuery } from '@tanstack/react-query'
import { fetchMovieDetails } from './api/movieApi'

export function useMovie(catalogId?: string) {
  return useQuery({ queryKey: ['movie', catalogId], queryFn: () => fetchMovieDetails(catalogId!), enabled: Boolean(catalogId), staleTime: 10 * 60_000 })
}
