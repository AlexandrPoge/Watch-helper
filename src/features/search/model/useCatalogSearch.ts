import { useQuery } from '@tanstack/react-query'
import { searchCatalog } from '../api/catalogApi'

export function useCatalogSearch(query: string) {
  return useQuery({
    queryKey: ['catalog-search', query],
    queryFn: () => searchCatalog(query),
    enabled: query.trim().length >= 2,
    staleTime: 60_000,
  })
}
