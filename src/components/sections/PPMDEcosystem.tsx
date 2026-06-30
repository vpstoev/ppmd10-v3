import type { CSSProperties } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Container } from '../ui/Container'
import { Section } from '../ui/Section'
import { teamsById } from '../../data/teams'
import type { TeamId } from '../../data/types'
import { fadeUp, plainUp, staggerContainer, staggerItem, viewportOnce } from '../../lib/motion'
import styles from './PPMDEcosystem.module.css'

/** Pillar accents — A1 red used once, the rest warm (magenta / amber / coral). */
const pillarCap: Record<string, string> = {
  'Project Delivery': 'var(--accent-2)',
  'Process Excellence': 'var(--team-pp)',
  'Business Transformation': 'var(--amber)',
  'Testing & Quality': 'var(--team-bpt)',
}

interface TeamCard {
  id: TeamId
  index: string
  name: string
  role: string
  tags: string[]
}

const teamCards: TeamCard[] = [
  {
    id: 'pm',
    index: '01',
    name: 'Project Management Team',
    role: 'Turns complexity into coordinated delivery.',
    tags: ['Project Delivery', 'Business Transformation'],
  },
  {
    id: 'pp',
    index: '02',
    name: 'Process & Procedures Management Team',
    role: 'Turns knowledge and standards into a consistent way of working.',
    tags: ['Process Excellence', 'Business Transformation'],
  },
  {
    id: 'bpt',
    index: '03',
    name: 'BPT & Testing Team',
    role: 'Turns change into validated, ready and reliable outcomes.',
    tags: ['Testing & Quality', 'Business Transformation'],
  },
]

const pillars = [
  { name: 'Project Delivery' },
  { name: 'Process Excellence' },
  { name: 'Business Transformation', shared: true },
  { name: 'Testing & Quality' },
]

/**
 * "From Pillars to People" — a premium editorial bridge section (deliberately
 * NOT a diagram). An asymmetric split: a sticky oversized editorial column beside
 * three large stepped team cards, closed by a top-ruled pillar index strip. Shows
 * how the four pillars become real through the three teams, with Business
 * Transformation as the shared cross-team pillar. No connectors, no org-chart.
 */
export function PPMDEcosystem() {
  const reduce = useReducedMotion()
  const item = reduce ? plainUp : staggerItem
  // Transform+opacity reveal (no animated blur) — premium and cheap.
  const titleVar = reduce ? plainUp : fadeUp

  return (
    <Section id="universe">
      <Container>
        <div className={styles.shell}>
          {/* Left — sticky editorial block */}
          <motion.div
            className={styles.editorial}
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
              The values of PPMD become real through the people and teams who carry them every day.
            </motion.p>
            <motion.p className={styles.support} variants={item}>
              Four pillars guide the work. Three teams turn them into structure, delivery and quality.
            </motion.p>
          </motion.div>

          {/* Right — three large stepped team cards */}
          <motion.div
            className={styles.cards}
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
          >
            <motion.span className={styles.cardsKicker} variants={item}>
              Carried by three teams
            </motion.span>
            {teamCards.map((c) => (
              <motion.article
                key={c.id}
                className={styles.card}
                style={{ '--cap': `var(${teamsById[c.id].accentVar})` } as CSSProperties}
                variants={item}
              >
                <span className={styles.cardNum} aria-hidden>
                  {c.index}
                </span>
                <div className={styles.cardMain}>
                  <h3 className={styles.cardName}>{c.name}</h3>
                  <p className={styles.cardRole}>{c.role}</p>
                  <div className={styles.cardTags}>
                    {c.tags.map((t) => (
                      <span
                        key={t}
                        className={styles.cardTag}
                        style={{ '--dot': pillarCap[t] } as CSSProperties}
                      >
                        <span className={styles.cardDot} aria-hidden />
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </div>

        {/* Full-width pillar index strip */}
        <motion.div
          className={styles.pillars}
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          <motion.span className={styles.pillarsLead} variants={item}>
            Guided by four pillars
          </motion.span>
          <div className={styles.pillarRow}>
            {pillars.map((p) => (
              <motion.div
                key={p.name}
                className={`${styles.pillar} ${p.shared ? styles.pillarShared : ''}`}
                style={{ '--cap': pillarCap[p.name] } as CSSProperties}
                variants={item}
              >
                <span className={styles.pillarBar} aria-hidden />
                <span className={styles.pillarName}>{p.name}</span>
                {p.shared && (
                  <span className={styles.pillarNote}>Shared across all three teams</span>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        <p className={styles.closing}>
          Four pillars. Three teams. <span className="gradient-text">One shared standard of work.</span>
        </p>
      </Container>
    </Section>
  )
}
