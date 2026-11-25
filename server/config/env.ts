function portNumber(name: string, fallback: number) {
  const value = Number(process.env[name] ?? fallback)
  if (!Number.isInteger(value) || value < 1 || value > 65535) throw new Error(`Invalid ${name}: expected port 1-65535`)
  return value
}

export const env = {
  port: process.env.NODE_ENV === 'production' && process.env.PORT !== undefined
    ? portNumber('PORT', 3001) : portNumber('API_PORT', 3001),
  webPort: portNumber('WEB_PORT', 5173),
  publicAppUrl: (process.env.PUBLIC_APP_URL || process.env.RENDER_EXTERNAL_URL)?.replace(/\/$/, ''),
  tmdbApiKey: process.env.TMDB_API_KEY,
  omdbKey: process.env.OMDB_API_KEY,
  kinopoiskDevToken: process.env.KINOPOISK_DEV_TOKEN,
}
