export function mapOmdbCast(actors?: string) {
  if (!actors || actors === 'N/A') return []
  return actors.split(',').map((name) => name.trim()).filter(Boolean).slice(0, 10).map((name) => ({
    id: `search:person:${name}`,
    name,
  }))
}
