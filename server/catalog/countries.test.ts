import { describe, expect, it } from 'vitest'
import { countryCodeFor, countryCodesFor, countryNames } from './countries'

describe('production countries', () => {
  it('maps Russian sources to country codes', () => {
    expect(countryNames.RU).toBe('Россия')
    expect(countryCodeFor('СССР')).toBe('SU')
    expect(countryCodesFor([{ name: 'Россия' }, { name: 'Корея Южная' }])).toEqual(['RU', 'KR'])
  })
})
