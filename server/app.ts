import express from 'express'
import { getCatalogStatus, searchCatalog } from './catalog/catalogService'
import { getSeriesDetails } from './catalog/seriesDetailsService'
import { browseSeries, type SeriesFilters } from './catalog/seriesService'
import { getMovieDetails } from './catalog/movieDetailsService'
import { getPersonDetails, searchPeople } from './catalog/peopleService'
import { getRandomMovie } from './catalog/randomMovieService'
import { networkRouter } from './network/networkRoutes'
import { imageProxyRouter } from './media/imageProxyRoutes'
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

app.get('/api/movies/random', async (request, response) => {
  try {
    const item = await getRandomMovie({ genre: stringParam(request.query.genre), maxRuntime: Number(request.query.maxRuntime) || undefined })
    return item ? response.json({ item }) : response.status(404).json({ message: 'Movie not found.' })
  } catch (error) {
    console.error('Random movie failed', error)
    return response.status(502).json({ message: 'Movie provider is temporarily unavailable.' })
  }
})

app.get('/api/movies/:catalogId', async (request, response) => {
  try {
    const item = await getMovieDetails(request.params.catalogId)
    return item ? response.json({ item }) : response.status(404).json({ message: 'Movie not found.' })
  } catch (error) {
    console.error('Movie details failed', error)
    return response.status(502).json({ message: 'Movie provider is temporarily unavailable.' })
  }
})

app.get('/api/people/search', async (request, response) => {
  const query = String(request.query.q ?? '').trim()
  if (query.length < 2) return response.status(400).json({ message: 'Query must contain at least 2 characters.' })
  try {
    return response.json({ items: await searchPeople(query) })
  } catch (error) {
    console.error('People search failed', error)
    return response.status(502).json({ message: 'People provider is temporarily unavailable.' })
  }
})

app.get('/api/people/:catalogId', async (request, response) => {
  try {
    const item = await getPersonDetails(request.params.catalogId)
    return item ? response.json({ item }) : response.status(404).json({ message: 'Person not found.' })
  } catch (error) {
    console.error('Person details failed', error)
    return response.status(502).json({ message: 'People provider is temporarily unavailable.' })
  }
})

app.use(roomRouter)
app.use(networkRouter)
app.use(imageProxyRouter)

const stringParam = (value: unknown) => typeof value === 'string' && value ? value : undefined
const sortParam = (value: unknown): SeriesFilters['sort'] => ['popular', 'rating', 'newest'].includes(String(value)) ? value as SeriesFilters['sort'] : 'popular'
