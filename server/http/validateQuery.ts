import type { RequestHandler } from 'express'

export const validateQuery: RequestHandler = (request, response, next) => {
  const ranges: Record<string, [number, number, boolean]> = {
    page: [1, 500, true], year: [1870, 2200, true],
    rating: [0, 10, false], maxRuntime: [1, 600, true],
  }
  for (const [name, [minimum, maximum, integer]] of Object.entries(ranges)) {
    const raw = request.query[name]
    if (raw === undefined) continue
    const value = typeof raw === 'string' && raw.trim() ? Number(raw) : NaN
    if (!Number.isFinite(value) || value < minimum || value > maximum || (integer && !Number.isSafeInteger(value))) {
      response.status(400).json({ message: `Invalid ${name} query parameter.` })
      return
    }
  }
  next()
}
