/**
 * Shared hooks for the new sections — one source for WebGL detection,
 * reduced-motion preference, scroll progress and viewport proximity
 * (so offscreen canvases can unmount and stop costing anything).
 */
import { useEffect, useState } from 'react'
import { computeProgress } from '../hg-hero/heroTheme'

export function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl2') || canvas.getContext('webgl'))
    )
  } catch {
    return false
  }
}

export function useReducedMotionPref(): boolean {
  const [reduced, setReduced] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}

/** rAF-throttled normalized progress of a tall sticky-scroll section. */
export function useSectionProgress(ref: React.RefObject<HTMLElement | null>): number {
  const [p, setP] = useState(0)
  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      setP(computeProgress(ref.current))
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [ref])
  return p
}

/**
 * True while the element is within `margin` px of the viewport.
 * Used to mount WebGL canvases only when their section is nearby.
 */
export function useNearViewport(
  ref: React.RefObject<HTMLElement | null>,
  margin = 1500,
): boolean {
  const [near, setNear] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => setNear(entries[0]?.isIntersecting ?? false),
      { rootMargin: `${margin}px 0px ${margin}px 0px` },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref, margin])
  return near
}
