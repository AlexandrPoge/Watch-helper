import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchBrowse } from './api/browseApi'
import type { CatalogFilters, CatalogKind } from './model'

export function useBrowseCatalog(kind: CatalogKind, filters: CatalogFilters, enabled: boolean) {
  return useInfiniteQuery({
    queryKey: ['browse-catalog', kind, filters],
    queryFn: ({ pageParam }) => fetchBrowse(kind, filters, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.items.length ? lastPage.page + 1 : undefined,
    enabled,
    staleTime: (query) => query.state.data?.pages.some((page) => page.partial) ? 30_000 : 5 * 60_000,
  })
}
