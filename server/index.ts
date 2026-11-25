import 'dotenv/config'
import { fileURLToPath } from 'node:url'
import { app } from './app'
import { env } from './config/env'
import { pool } from './db/pool'
import { migrate } from './db/migrate'
import { startSocketHub } from './rooms/socketHub'
import { serveFrontend } from './http/serveFrontend'

if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) throw new Error('DATABASE_URL is required in production')

if (process.env.SERVE_WEB === '1') serveFrontend(app, fileURLToPath(new URL('../dist/', import.meta.url)))
await migrate()
const server = app.listen(env.port, '0.0.0.0', () => console.log(`Watch Helper listening on port ${env.port}`))
const sockets = startSocketHub(server)
process.once('SIGTERM', () => {
  void sockets.close().then(() => pool.end()).catch((error: unknown) => {
    console.error('Shutdown failed', error)
    process.exitCode = 1
  })
})
