export class RoomError extends Error {
  constructor(public code: string, public status = 400) { super(code) }
}

export function roomError(error: unknown) {
  return error instanceof RoomError ? { status: error.status, message: error.code } : { status: 500, message: 'ROOM_ERROR' }
}
