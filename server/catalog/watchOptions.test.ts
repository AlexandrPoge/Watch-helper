import { describe, expect, it } from 'vitest'
import { mapTmdbWatch, tmdbExternalLinks } from './watchOptions'

describe('watch options', () => {
  it('предпочитает ближайший регион и сохраняет тип просмотра', () => {
    const options = mapTmdbWatch({
      RU: { link: 'https://watch/ru', flatrate: [{ provider_id: 1, provider_name: 'Киносервис' }] },
      US: { link: 'https://watch/us', buy: [{ provider_id: 2, provider_name: 'Store' }] },
    })

    expect(options).toEqual([expect.objectContaining({
      name: 'Киносервис', type: 'stream', region: 'RU', url: 'https://watch/ru',
    })])
  })

  it('формирует ссылки на каталоги фильма', () => {
    expect(tmdbExternalLinks('movie', 42, 'tt0042')).toEqual([
      { name: 'TMDB', url: 'https://www.themoviedb.org/movie/42' },
      { name: 'IMDb', url: 'https://www.imdb.com/title/tt0042/' },
    ])
  })

  it('не предлагает зарубежные площадки как доступные локально', () => {
    expect(mapTmdbWatch({ US: { link: 'https://watch/us', flatrate: [{ provider_id: 3, provider_name: 'US Store' }] } })).toEqual([])
  })
})
