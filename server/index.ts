import 'dotenv/config'
import { app } from './app'
import { env } from './config/env'
import { pool } from './db/pool'
import { migrate } from './db/migrate'
import { startSocketHub } from './rooms/socketHub'

if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) throw new Error('DATABASE_URL is required in production')

await migrate()
const server = app.listen(env.port, () => console.log(`Watch Helper API is running at http://localhost:${env.port}`))
startSocketHub(server)
process.on('SIGTERM', () => { server.close(); void pool.end() })
