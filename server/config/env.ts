const port = Number.parseInt(process.env.API_PORT ?? '3001', 10)

export const env = {
  port: Number.isFinite(port) ? port : 3001,
  tmdbToken: process.env.TMDB_API_TOKEN,
  omdbKey: process.env.OMDB_API_KEY,
}
