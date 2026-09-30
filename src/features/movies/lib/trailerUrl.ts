export function getYoutubeEmbedUrl(source: string, origin: string) {
  try {
    const url = new URL(source)
    const id = videoId(url)
    const query = new URLSearchParams({ rel: '0', playsinline: '1', origin })
    return id ? `https://www.youtube.com/embed/${encodeURIComponent(id)}?${query}` : undefined
  } catch {
    return undefined
  }
}

function videoId(url: URL) {
  if (url.hostname.includes('youtu.be')) return url.pathname.slice(1)
  if (url.pathname.startsWith('/embed/') || url.pathname.startsWith('/shorts/')) return url.pathname.split('/')[2]
  return url.searchParams.get('v') ?? undefined
}
