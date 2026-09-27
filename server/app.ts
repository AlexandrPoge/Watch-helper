import express from 'express'
import { getCatalogStatus, searchCatalog } from './catalog/catalogService'
import { getSeriesDetails } from './catalog/seriesDetailsService'
import { browseSeries, type SeriesFilters } from './catalog/seriesService'
import { roomRouter } from './rooms/roomRoutes'

export const app = express()

app.use(express.json())

app.get('/api/health', (_, response) => response.json({ status: 'ok' }))

app.get('/api/catalog/status', (_, response) => {
  response.json({ providers: getCatalogStatus() })
})

app.get('/api/movies/search', async (request, response) => {
  const query = String(request.query.q ?? '').trim()
  if (query.length < 2) return response.status(400).json({ message: 'Query must contain at least 2 characters.' })
  try {
    const items = await searchCatalog(query)
    return response.json({ items })
  } catch (error) {
    console.error('Catalog search failed', error)
    return response.status(502).json({ message: 'Catalog providers are temporarily unavailable.' })
  }
})

app.get('/api/series', async (request, response) => {
  const filters: SeriesFilters = {
    genre: stringParam(request.query.genre), year: stringParam(request.query.year),
    rating: stringParam(request.query.rating), sort: sortParam(request.query.sort),
    page: Math.max(1, Number(request.query.page) || 1),
  }
  try {
    return response.json({ items: await browseSeries(filters), page: filters.page })
  } catch (error) {
    console.error('Series catalog failed', error)
    return response.status(502).json({ message: 'Series providers are temporarily unavailable.' })
  }
})

app.get('/api/series/:catalogId', async (request, response) => {
  try {
    const item = await getSeriesDetails(request.params.catalogId)
    return item ? response.json({ item }) : response.status(404).json({ message: 'Series not found.' })
  } catch (error) {
    console.error('Series details failed', error)
    return response.status(502).json({ message: 'Series provider is temporarily unavailable.' })
  }
})

app.use(roomRouter)

const stringParam = (value: unknown) => typeof value === 'string' && value ? value : undefined
const sortParam = (value: unknown): SeriesFilters['sort'] => ['popular', 'rating', 'newest'].includes(String(value)) ? value as SeriesFilters['sort'] : 'popular'
