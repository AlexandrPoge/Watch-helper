import { networkInterfaces } from 'node:os'
import { Router } from 'express'
import { env } from '../config/env'

export const networkRouter = Router()

networkRouter.get('/api/network/share', (_, response) => {
  if (env.publicAppUrl) return response.json({ urls: [env.publicAppUrl], scope: 'public' })
  const localUrls = Object.values(networkInterfaces()).flatMap((addresses) => (addresses ?? []).flatMap((address) => {
    if (address.family !== 'IPv4' || address.internal) return []
    return [`http://${address.address}:${env.webPort}`]
  }))
  response.json({ urls: [...new Set(localUrls)], scope: 'local-network' })
})
