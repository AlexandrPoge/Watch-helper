export function sample<T>(items: T[], count = items.length) {
  const shuffled = [...items]
  for (let index = shuffled.length - 1; index > 0; index--) {
    const swap = Math.floor(Math.random() * (index + 1))
    const item = shuffled[index]
    shuffled[index] = shuffled[swap]
    shuffled[swap] = item
  }
  return shuffled.slice(0, count)
}
