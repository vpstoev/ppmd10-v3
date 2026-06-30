import type { CSSProperties } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Container } from '../ui/Container'
import { Section } from '../ui/Section'
import { SectionHeading } from '../ui/SectionHeading'
import { pillarIcons } from '../ui/iconMap'
import { departmentPillars } from '../../data/pillars'
import type { Pillar } from '../../data/types'
import { plainUp, staggerContainer, staggerItem, viewportOnce } from '../../lib/motion'
import styles from './DepartmentPillars.module.css'

/** Warm accent per pillar — A1 red leads, then the warm PPMD family. Accent only. */
const pillarCap: Partial<Record<Pillar['icon'], string>> = {
  delivery: 'var(--accent-2)',
  governance: 'var(--team-pp)',
  transform: 'var(--team-bpt)',
  quality: 'var(--amber)',
}

/**
 * The four pillars as a *value foundation* — not a grid of KPI tiles but a
 * confident editorial ledger: each value is one large row with an oversized
 * index, a strong title and a single supporting line. All four carry equal
 * weight; only the accent shifts.
 */
export function DepartmentPillars() {
  const reduce = useReducedMotion()
  const item = reduce ? plainUp : staggerItem

  return (
    <Section>
      <Container>
        <SectionHeading
          eyebrow="What we stand on"
          title="Four values that hold"
          highlight="the work together"
          description="Everything PPMD does rests on the same four foundations — how initiatives, processes, change and quality become one way of working."
        />

        <motion.ol
          className={styles.ledger}
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          {departmentPillars.map((p, i) => {
            const Icon = pillarIcons[p.icon]
            return (
              <motion.li
                key={p.title}
                className={styles.row}
                style={{ '--cap': pillarCap[p.icon] ?? 'var(--accent-2)' } as CSSProperties}
                variants={item}
              >
                <span className={styles.index} aria-hidden>
                  {String(i + 1).padStart(2, '0')}
                </span>

                <span className={styles.icon} aria-hidden>
                  <Icon width={26} height={26} />
                </span>

                <div className={styles.body}>
                  <div className={styles.head}>
                    <h3 className={styles.title}>{p.title}</h3>
                    <span className={styles.short}>{p.short}</span>
                  </div>
                  <p className={styles.text}>{p.description}</p>
                </div>
              </motion.li>
            )
          })}
        </motion.ol>
      </Container>
    </Section>
  )
}
