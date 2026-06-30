import { motion, useReducedMotion } from 'motion/react'
import { Container } from '../ui/Container'
import { Section } from '../ui/Section'
import { fadeUp, plainUp, staggerContainer, staggerItem, viewportOnce } from '../../lib/motion'
import styles from './PPMDEcosystem.module.css'

/** The four pillars, shown as a quiet typographic rail — not boxes. */
const pillars = ['Project Delivery', 'Process Excellence', 'Business Transformation', 'Testing & Quality']

/**
 * "From Pillars to People" — a slim cinematic *bridge* between the pillars and
 * the teams. Deliberately not a content block and not a diagram: a single bold
 * editorial statement that carries the narrative ("values become work") with no
 * team cards, so the three teams are never set against each other here.
 */
export function PPMDEcosystem() {
  const reduce = useReducedMotion()
  const item = reduce ? plainUp : staggerItem
  const titleVar = reduce ? plainUp : fadeUp

  return (
    <Section id="universe">
      <Container>
        <motion.div
          className={styles.bridge}
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          <motion.span className={styles.kicker} variants={item}>
            <span className={styles.kickerIndex}>01</span>
            How values become work
          </motion.span>

          <motion.h2 className={styles.title} variants={titleVar}>
            From Pillars to <span className="gradient-text">People</span>
          </motion.h2>

          <motion.p className={styles.lead} variants={item}>
            The values of PPMD don&apos;t live on a slide — they become real through the people and
            teams who carry them every day.
          </motion.p>

          {/* The statement — the centerpiece of the bridge. */}
          <motion.p className={styles.statement} variants={item}>
            <span className={styles.line}>Four pillars.</span>{' '}
            <span className={styles.line}>Three teams.</span>{' '}
            <span className={`${styles.line} ${styles.lineAccent}`}>One shared standard of work.</span>
          </motion.p>

          {/* Quiet typographic pillar rail — names only, equal, no boxes. */}
          <motion.ul className={styles.rail} variants={item} aria-label="The four pillars">
            {pillars.map((p) => (
              <li key={p} className={styles.railItem}>
                <span className={styles.railDot} aria-hidden />
                {p}
              </li>
            ))}
          </motion.ul>
        </motion.div>
      </Container>
    </Section>
  )
}
