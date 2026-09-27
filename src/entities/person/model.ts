import type { Movie } from '../movie/model'

export type Person = {
  id: string
  name: string
  department?: string
  photoUrl?: string
  knownFor: string[]
}

export type PersonDetails = Person & {
  biography?: string
  birthday?: string
  placeOfBirth?: string
  credits: Movie[]
}
