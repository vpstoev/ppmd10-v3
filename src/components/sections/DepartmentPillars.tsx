import type { CSSProperties } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Container } from '../ui/Container'
import { SectionHeading } from '../ui/SectionHeading'
import { pillarIcons } from '../ui/iconMap'
import { departmentPillars } from '../../data/pillars'
import type { Pillar } from '../../data/types'
import { plainUp, staggerContainer, staggerItem, viewportOnce } from '../../lib/motion'
import styles from './DepartmentPillars.module.css'

/**
 * Per-pillar bento placement + warm accent. A1 red leads on the wide feature
 * tile; the rest carry the warm PPMD family (magenta / coral / amber) as
 * accents only — never as a flood. Keyed by the data `icon` so content and
 * layout stay decoupled.
 */
const layout: Partial<
  Record<Pillar['icon'], { area: string; variant?: 'feature' | 'tall'; cap: string; glow: string }>
> = {
  delivery: { area: 'delivery', variant: 'feature', cap: 'var(--accent-2)', glow: 'var(--accent-glow)' },
  governance: { area: 'process', cap: 'var(--team-pp)', glow: 'var(--team-pp-glow)' },
  transform: { area: 'transform', variant: 'tall', cap: 'var(--team-bpt)', glow: 'var(--team-bpt-glow)' },
  quality: { area: 'quality', cap: 'var(--amber)', glow: 'var(--amber-glow)' },
}

/**
 * The four pillars PPMD is built on — an asymmetric bento, not a row of KPI
 * tiles. Project Delivery leads as the wide feature; Business Transformation
 * anchors the tall right rail; Process Excellence and Testing & Quality complete
 * the grid.
 */
export function DepartmentPillars() {
  const reduce = useReducedMotion()
  const item = reduce ? plainUp : staggerItem

  return (
    <section className={styles.section} aria-label="What PPMD does">
      <Container>
        <SectionHeading
          eyebrow="What we do"
          title="Four pillars,"
          highlight="one department"
          description="The disciplines PPMD is built on — how initiatives, processes, change and quality come together as one way of working."
        />

        <motion.div
          className={styles.grid}
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          {departmentPillars.map((p) => {
            const Icon = pillarIcons[p.icon]
            const l = layout[p.icon] ?? layout.delivery!
            const variantClass = l.variant ? styles[l.variant] : ''
            return (
              <motion.article
                key={p.title}
                className={`${styles.tile} ${variantClass}`}
                style={{ gridArea: l.area, '--cap': l.cap, '--cap-glow': l.glow } as CSSProperties}
                variants={item}
              >
                <span className={styles.iconWrap}>
                  <Icon width={24} height={24} />
                </span>
                <span className={styles.short}>{p.short}</span>
                <h3 className={styles.title}>{p.title}</h3>
                <p className={styles.text}>{p.description}</p>
              </motion.article>
            )
          })}
        </motion.div>
      </Container>
    </section>
  )
}
