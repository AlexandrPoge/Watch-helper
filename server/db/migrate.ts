import 'dotenv/config'
import { readFile, readdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pool } from './pool'

export async function migrate() {
  const directory = fileURLToPath(new URL('./migrations/', import.meta.url))
  const files = (await readdir(directory)).filter((file) => file.endsWith('.sql')).sort()
  const client = await pool.connect()
  const lock = 819377
  try {
    await client.query('SELECT pg_advisory_lock($1)', [lock])
    await client.query('CREATE TABLE IF NOT EXISTS schema_migrations(name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())')
    for (const file of files) {
      await client.query('BEGIN')
      try {
        const applied = await client.query('SELECT 1 FROM schema_migrations WHERE name=$1', [file])
        if (!applied.rowCount) {
          await client.query(await readFile(resolve(directory, file), 'utf8'))
          await client.query('INSERT INTO schema_migrations(name) VALUES($1)', [file])
        }
        await client.query('COMMIT')
      } catch (error) {
        await client.query('ROLLBACK')
        throw error
      }
    }
  } finally {
    await client.query('SELECT pg_advisory_unlock($1)', [lock])
    client.release()
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  migrate().then(() => pool.end()).catch(async (error) => {
    console.error('Database migration failed', error)
    await pool.end()
    process.exitCode = 1
  })
}
