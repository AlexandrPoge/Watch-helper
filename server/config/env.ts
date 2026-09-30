const port = Number.parseInt(process.env.API_PORT ?? '3001', 10)
const webPort = Number.parseInt(process.env.WEB_PORT ?? '5173', 10)

export const env = {
  port: Number.isFinite(port) ? port : 3001,
  webPort: Number.isFinite(webPort) ? webPort : 5173,
  publicAppUrl: process.env.PUBLIC_APP_URL?.replace(/\/$/, ''),
  tmdbApiKey: process.env.TMDB_API_KEY,
  omdbKey: process.env.OMDB_API_KEY,
  kinopoiskDevToken: process.env.KINOPOISK_DEV_TOKEN,
}
