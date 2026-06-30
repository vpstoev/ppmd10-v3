import { useRef } from 'react'
import type { ReactNode } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useSceneActivation } from '../layout/SceneBackground'
import styles from './Section.module.css'

interface SectionProps {
  children: ReactNode
  id?: string
  className?: string
  /** Disable the scroll-driven scene transform (e.g. for static blocks). */
  reveal?: boolean
}

/**
 * Vertical rhythm wrapper that doubles as a presentation "scene": its content
 * rises and scales into focus as it enters, and gently recedes as the next
 * scene takes over — a reversible, scroll-driven cross-dissolve. It also reports
 * itself as the active scene so the shared background can morph to match.
 */
export function Section({ children, id, className = '', reveal = true }: SectionProps) {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  useSceneActivation(ref, id)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  // Entrance-only reveal: rise + fade in over the first ~15% of travel, then
  // hold. Deliberately no scroll-driven `scale` or recede — scaling a section
  // full of backdrop-filter cards re-rasterizes every blur each frame, which
  // was the main source of scroll jank. Transform/opacity only, set once.
  const opacity = useTransform(scrollYProgress, [0, 0.15], [0, 1])
  const y = useTransform(scrollYProgress, [0, 0.15], [40, 0])

  const style = reduce || !reveal ? undefined : { opacity, y }

  return (
    <motion.section
      id={id}
      ref={ref}
      className={`${styles.section} ${className}`}
      style={style}
    >
      {children}
    </motion.section>
  )
}
