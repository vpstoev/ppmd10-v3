import type { MouseEvent } from 'react'
import { useMotionValue, useReducedMotion, useSpring } from 'motion/react'

/**
 * Pointer-driven 3D tilt + spotlight for cards.
 * Spread the returned props onto a `motion` element and merge `style`.
 * Fully inert when the user prefers reduced motion.
 */
export function useTilt(max = 6) {
  const reduce = useReducedMotion()
  const rx = useSpring(useMotionValue(0), { stiffness: 200, damping: 18 })
  const ry = useSpring(useMotionValue(0), { stiffness: 200, damping: 18 })

  const onMouseMove = (e: MouseEvent<HTMLElement>) => {
    if (reduce) return
    const el = e.currentTarget
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    ry.set((px - 0.5) * max * 2)
    rx.set((0.5 - py) * max * 2)
    // Drive the CSS spotlight position.
    el.style.setProperty('--mx', `${e.clientX - r.left}px`)
    el.style.setProperty('--my', `${e.clientY - r.top}px`)
  }

  const onMouseLeave = () => {
    rx.set(0)
    ry.set(0)
  }

  return {
    onMouseMove,
    onMouseLeave,
    style: { rotateX: rx, rotateY: ry, transformPerspective: 900 },
  }
}
