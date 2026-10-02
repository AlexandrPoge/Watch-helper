export function scrollToFocus(element: HTMLElement | null) {
  if (!element) return
  const reduced = document.documentElement.dataset.motion === 'less' || window.matchMedia('(prefers-reduced-motion: reduce)').matches
  element.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' })
}
