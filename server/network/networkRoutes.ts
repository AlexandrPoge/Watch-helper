import { networkInterfaces } from 'node:os'
import { Router } from 'express'
import { env } from '../config/env'

export const networkRouter = Router()

networkRouter.get('/api/network/share', (_, response) => {
  const localUrls = Object.values(networkInterfaces()).flatMap((addresses) => (addresses ?? []).flatMap((address) => {
    if (address.family !== 'IPv4' || address.internal) return []
    return [`http://${address.address}:${env.webPort}`]
  }))
  const urls = [...new Set([...(env.publicAppUrl ? [env.publicAppUrl] : []), ...localUrls])]
  response.json({ urls, scope: env.publicAppUrl ? 'public' : 'local-network' })
})
