import { useQuery } from '@tanstack/react-query'
import { fetchPerson, searchPeople } from './api/peopleApi'

export function usePeopleSearch(query: string) {
  return useQuery({ queryKey: ['people-search', query], queryFn: () => searchPeople(query), enabled: query.trim().length >= 2, staleTime: 5 * 60_000 })
}

export function usePerson(catalogId?: string) {
  return useQuery({ queryKey: ['person', catalogId], queryFn: () => fetchPerson(catalogId!), enabled: Boolean(catalogId), staleTime: 10 * 60_000, retry: 1 })
}
