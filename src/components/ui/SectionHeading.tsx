import { motion, useReducedMotion } from 'motion/react'
import { maskUp, plainUp, staggerContainer, staggerItem, viewportOnce } from '../../lib/motion'
import { Badge } from './Badge'
import styles from './SectionHeading.module.css'

interface SectionHeadingProps {
  eyebrow?: string
  title: string
  /** Optional segment of the title rendered with the brand gradient. */
  highlight?: string
  description?: string
  align?: 'center' | 'left'
  /** Editorial chapter marker, e.g. "02" — rendered as "02 / 06". */
  index?: string
}

const TOTAL = '06'

/** Reusable eyebrow + title + description block with a cinematic reveal. */
export function SectionHeading({
  eyebrow,
  title,
  highlight,
  description,
  align = 'center',
  index,
}: SectionHeadingProps) {
  const reduce = useReducedMotion()
  const titleVariant = reduce ? plainUp : maskUp

  return (
    <motion.div
      className={`${styles.wrap} ${align === 'left' ? styles.left : ''}`}
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
    >
      {index && (
        <motion.div className={styles.index} variants={staggerItem}>
          <span className={styles.indexNum}>{index}</span>
          <span className={styles.indexRule} aria-hidden />
          <span className={styles.indexTotal}>{TOTAL}</span>
        </motion.div>
      )}

      {eyebrow && (
        <motion.div variants={staggerItem}>
          <Badge>{eyebrow}</Badge>
        </motion.div>
      )}

      <motion.h2 className={styles.title} variants={titleVariant}>
        {title} {highlight && <span className="gradient-text">{highlight}</span>}
      </motion.h2>

      {description && (
        <motion.p className={styles.desc} variants={staggerItem}>
          {description}
        </motion.p>
      )}
    </motion.div>
  )
}
