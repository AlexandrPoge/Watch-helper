import type { ErrorRequestHandler, RequestHandler } from 'express'

export const notFound: RequestHandler = (_, response) => {
  response.status(404).json({ message: 'API endpoint not found.' })
}

export const errorHandler: ErrorRequestHandler = (error, _, response, next) => {
  if (response.headersSent) return next(error)
  const status = error?.status === 413 ? 413 : error?.status === 400 ? 400 : 500
  const message = status === 413 ? 'Request body is too large.'
    : status === 400 ? 'Invalid request body or URL.'
      : 'Internal server error.'
  if (status === 500) console.error('Unhandled API error', error)
  response.status(status).json({ message })
}
