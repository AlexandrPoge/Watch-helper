import { createHash, randomBytes } from 'node:crypto'
import type { Request, Response } from 'express'

const cookieName = 'watchly_guest'

export function readGuest(request: Request) {
  return guestFromCookie(request.headers.cookie)
}

export function createGuest(response: Response) {
  const token = randomBytes(32).toString('hex')
  response.cookie(cookieName, token, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 90, path: '/',
  })
  return hashGuest(token)
}

function hashGuest(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export function guestFromCookie(header?: string) {
  const value = header?.split(';').map((item) => item.trim()).find((item) => item.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1)
  return value && /^[a-f0-9]{64}$/.test(value) ? hashGuest(value) : undefined
}
