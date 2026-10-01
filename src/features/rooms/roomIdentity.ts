const displayNameKey = 'watchly.display-name'

export function getDisplayName() {
  return localStorage.getItem(displayNameKey) ?? ''
}

export function saveDisplayName(name: string) {
  localStorage.setItem(displayNameKey, name)
}
