const memberPrefix = 'watchly.room-member.'
const displayNameKey = 'watchly.display-name'

export function getRoomMember(roomId: string) {
  return localStorage.getItem(`${memberPrefix}${roomId}`) ?? undefined
}

export function saveRoomMember(roomId: string, memberId: string, displayName?: string) {
  localStorage.setItem(`${memberPrefix}${roomId}`, memberId)
  if (displayName) localStorage.setItem(displayNameKey, displayName)
}

export function getDisplayName() {
  return localStorage.getItem(displayNameKey) ?? ''
}
