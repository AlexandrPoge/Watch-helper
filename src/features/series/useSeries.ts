import { useQuery } from '@tanstack/react-query'
import { fetchSeriesDetails } from './api/seriesApi'

export function useSeriesDetails(catalogId?: string) {
  return useQuery({
    queryKey: ['series-details', catalogId],
    queryFn: () => fetchSeriesDetails(catalogId!),
    enabled: Boolean(catalogId),
    staleTime: 10 * 60_000,
    retry: 1,
  })
}
