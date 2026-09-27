import type { Person, PersonDetails } from '../../../entities/person/model'

export async function searchPeople(query: string) {
  const response = await fetch(`/api/people/search?q=${encodeURIComponent(query)}`)
  if (!response.ok) throw new Error('Не удалось найти актёров.')
  const data = await response.json() as { items: Person[] }
  return data.items
}

export async function fetchPerson(catalogId: string) {
  const response = await fetch(`/api/people/${encodeURIComponent(catalogId)}`)
  if (!response.ok) throw new Error('Не удалось загрузить актёра.')
  const data = await response.json() as { item: PersonDetails }
  return data.item
}
