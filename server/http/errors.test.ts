import { afterAll, beforeAll, expect, it } from 'vitest'
import type { Server } from 'node:http'
import { app } from '../app'

let server: Server
let base: string
beforeAll(async () => {
  await new Promise<void>((resolve, reject) => { server = app.listen(0, '127.0.0.1', error => error ? reject(error) : resolve()) })
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('Missing test server')
  base = `http://127.0.0.1:${address.port}`
})
afterAll(() => new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())))

it.each([
  ['/api/unknown', undefined, 404],
  ['/api/rooms', '{broken', 400],
  ['/api/rooms', JSON.stringify({ value: 'x'.repeat(33_000) }), 413],
  ['/api/rooms/%ZZ', undefined, 400],
  ['/api/movies?page=Infinity', undefined, 400],
  ['/api/series?page=-1', undefined, 400],
  ['/api/movies?page=1.5', undefined, 400],
  ['/api/movies/random?maxRuntime=Infinity', undefined, 400],
  ['/api/movies/random?maxRuntime=-1', undefined, 400],
  ['/api/movies?rating=11', undefined, 400],
] as const)('returns a JSON error for %s', async (path, body, status) => {
  const response = await fetch(base + path, {
    method: body ? 'POST' : 'GET', body,
    headers: { 'Content-Type': 'application/json' },
  })
  expect(response.status).toBe(status)
  expect(response.headers.get('content-type')).toContain('application/json')
  expect(await response.json()).toEqual({ message: expect.any(String) })
})
