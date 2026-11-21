import { afterEach, expect, it, vi } from 'vitest'
import { copyLink, shareLink } from './shareLink'

const data = { title: 'Film', text: 'Invite', url: 'https://example.test' }
afterEach(() => vi.unstubAllGlobals())

it('handles missing clipboard and denied permissions', async () => {
  vi.stubGlobal('navigator', {})
  expect(await copyLink(data.url)).toBe(false)
  vi.stubGlobal('navigator', { clipboard: { writeText: vi.fn().mockRejectedValue(new Error('Denied')) } })
  expect(await shareLink(data)).toBe('failed')
})

it('treats cancellation as a normal outcome', async () => {
  vi.stubGlobal('navigator', { share: vi.fn().mockRejectedValue(new DOMException('Cancelled', 'AbortError')) })
  expect(await shareLink(data)).toBe('cancelled')
})

it('copies the URL when native sharing is unavailable', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined)
  vi.stubGlobal('navigator', { clipboard: { writeText } })
  expect(await shareLink(data)).toBe('copied')
  expect(writeText).toHaveBeenCalledWith(data.url)
})
