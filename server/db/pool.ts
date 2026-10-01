import pg, { type PoolClient } from 'pg'

const localUrl = 'postgres://watch_helper:watch_helper_local@127.0.0.1:5433/watch_helper'
const connectionString = process.env.DATABASE_URL ?? (process.env.NODE_ENV === 'production' ? undefined : localUrl)
export const pool = new pg.Pool({ connectionString, max: 10 })

export async function transaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await work(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
