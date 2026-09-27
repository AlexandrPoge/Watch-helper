import express from 'express'
import { getCatalogStatus, searchCatalog } from './catalog/catalogService'

export const app = express()

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
