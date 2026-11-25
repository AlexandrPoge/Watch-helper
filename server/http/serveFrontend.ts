import { accessSync, constants } from 'node:fs'
import { join } from 'node:path'
import express, { type Express } from 'express'

export function serveFrontend(app: Express, directory: string) {
  const index = join(directory, 'index.html')
  accessSync(index, constants.R_OK)

  app.use('/assets', express.static(join(directory, 'assets'), { immutable: true, maxAge: '1y' }))
  app.use('/assets', (_, response) => { response.sendStatus(404) })
  app.use(express.static(directory, { index: false }))
  app.get('/{*path}', (request, response, next) => {
    if (!request.get('accept')?.includes('text/html')) return next()
    response.set('Cache-Control', 'no-cache').sendFile(index)
  })
}
