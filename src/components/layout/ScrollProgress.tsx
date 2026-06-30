import { motion, useScroll, useSpring, useTransform } from 'motion/react'
import styles from './ScrollProgress.module.css'

/** Thin gradient beam that tracks reading progress, with a leading glow node. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  })
  const left = useTransform(progress, (v) => `${v * 100}%`)

  return (
    <>
      <motion.div className={styles.bar} style={{ scaleX: progress }} aria-hidden />
      <motion.span className={styles.node} style={{ left }} aria-hidden />
    </>
  )
}
