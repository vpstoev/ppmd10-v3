import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useSpring } from 'motion/react'
import { Container } from '../ui/Container'
import { Section } from '../ui/Section'
import { SectionHeading } from '../ui/SectionHeading'
import { timeline } from '../../data/timeline'
import { easeOut, viewportOnce } from '../../lib/motion'
import styles from './JourneyTimeline.module.css'

/**
 * The decade as a single travelled path: a glowing vertical spine with the
 * YEAR as the anchor of each entry. Primary milestones (`major`) get a large
 * amber year, a glowing node and a glass card; secondary years stay quiet —
 * warm-white year, small node, borderless row — so the eye reads movement and
 * hierarchy instead of a uniform stack of cards.
 */
export function JourneyTimeline() {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 80%', 'end 60%'],
  })
  const progress = useSpring(scrollYProgress, { stiffness: 80, damping: 26 })

  return (
    <Section id="timeline">
      <Container>
        <SectionHeading
          index="04"
          eyebrow="The Journey"
          title="Ten years,"
          highlight="one continuous path"
          description="From a few people with a shared idea to the department we are today — the milestones that shaped the decade."
        />

        <div className={styles.path} ref={ref}>
          <div className={styles.rail} aria-hidden>
            <motion.span className={styles.railFill} style={{ scaleY: reduce ? 1 : progress }} />
          </div>

          {timeline.map((m) => (
            <motion.div
              key={m.year}
              className={`${styles.stop} ${m.major ? styles.major : ''}`}
              initial={reduce ? { opacity: 0 } : { opacity: 0, x: -24 }}
              whileInView={reduce ? { opacity: 1 } : { opacity: 1, x: 0 }}
              viewport={viewportOnce}
              transition={{ duration: 0.6, ease: easeOut }}
            >
              <span className={styles.node} aria-hidden />
              <span className={styles.year}>{m.year}</span>
              <div className={styles.content}>
                {m.major && <span className={styles.flag}>Milestone</span>}
                <h3 className={styles.title}>{m.title}</h3>
                <p className={styles.desc}>{m.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  )
}
