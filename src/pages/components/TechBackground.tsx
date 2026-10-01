import { useEffect, useRef } from 'react'

export function TechBackground() {
  const sceneRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scene = sceneRef.current
    if (!scene) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    let frame = 0
    const updateLight = (event: PointerEvent) => {
      if (document.documentElement.dataset.motion === 'less' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        scene.style.setProperty('--pointer-x', `${event.clientX}px`)
        scene.style.setProperty('--pointer-y', `${event.clientY}px`)
      })
    }
    window.addEventListener('pointermove', updateLight, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', updateLight)
    }
  }, [])

  return (
    <div ref={sceneRef} className="tech-background" aria-hidden="true">
      <div className="tech-grid" />
      <div className="tech-orb tech-orb-one" />
      <div className="tech-orb tech-orb-two" />
      <div className="tech-pointer-light" />
      <div className="tech-noise" />
    </div>
  )
}
