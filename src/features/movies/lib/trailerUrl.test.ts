import { describe, expect, it } from 'vitest'
import { getYoutubeEmbedUrl } from './trailerUrl'

describe('youtube trailer url', () => {
  it('создаёт embed URL с origin', () => {
    const result = getYoutubeEmbedUrl('https://www.youtube.com/watch?v=abc123', 'http://localhost:5173')
    expect(result).toContain('https://www.youtube.com/embed/abc123')
    expect(result).toContain('origin=http%3A%2F%2Flocalhost%3A5173')
  })

  it('поддерживает короткие и shorts ссылки', () => {
    expect(getYoutubeEmbedUrl('https://youtu.be/short-id', 'https://watch.ly')).toContain('/embed/short-id')
    expect(getYoutubeEmbedUrl('https://youtube.com/shorts/clip-id', 'https://watch.ly')).toContain('/embed/clip-id')
  })
})
