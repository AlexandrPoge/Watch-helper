export async function copyLink(url: string) {
  try {
    await navigator.clipboard.writeText(url)
    return true
  } catch {
    return false
  }
}

export async function shareLink(data: { title: string; text: string; url: string }) {
  if (!navigator.share) return await copyLink(data.url) ? 'copied' : 'failed'
  try {
    await navigator.share(data)
    return 'shared'
  } catch (error) {
    return error instanceof Error && error.name === 'AbortError' ? 'cancelled' : 'failed'
  }
}
