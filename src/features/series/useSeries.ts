import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { fetchSeries, fetchSeriesDetails } from './api/seriesApi'
import type { SeriesFilters } from './model'

export function useSeries(filters: SeriesFilters) {
  return useInfiniteQuery({
    queryKey: ['series', filters],
    queryFn: ({ pageParam }) => fetchSeries(filters, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.items.length ? lastPage.page + 1 : undefined,
    staleTime: 5 * 60_000,
  })
}

export function useSeriesDetails(catalogId?: string) {
  return useQuery({
    queryKey: ['series-details', catalogId],
    queryFn: () => fetchSeriesDetails(catalogId!),
    enabled: Boolean(catalogId),
    staleTime: 10 * 60_000,
  })
}
