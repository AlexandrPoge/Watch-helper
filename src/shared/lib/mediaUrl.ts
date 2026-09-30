export function mediaUrl(source?: string) {
  if (!source || source.startsWith('/') || source.startsWith('data:')) return source
  return `/api/images?url=${encodeURIComponent(source)}`
}
