import type { CSSProperties } from 'react'
import { motion } from 'motion/react'
import { Container } from '../ui/Container'
import { Section } from '../ui/Section'
import { SectionHeading } from '../ui/SectionHeading'
import { processSteps } from '../../data/process'
import { teamsById } from '../../data/teams'
import type { TeamId } from '../../data/types'
import { staggerContainer, staggerItem, viewportOnce } from '../../lib/motion'
import styles from './RequestToImpactFlow.module.css'

const teamLabel = (id: TeamId | 'all') => (id === 'all' ? 'All teams' : teamsById[id].short)
const teamAccent = (id: TeamId | 'all') => (id === 'all' ? '--accent' : teamsById[id].accentVar)

/**
 * "From Request to Impact" — the six stages that turn a business request into
 * delivered value, with a clear lead, supporting teams and result per stage.
 */
export function RequestToImpactFlow() {
  return (
    <Section id="collaboration">
      <Container>
        <SectionHeading
          index="05"
          eyebrow="From Request to Impact"
          title="How a request becomes"
          highlight="delivered value"
          description="Every initiative travels the same six stages. Each one has a clear lead, the teams that support it, and a concrete result it hands to the next."
        />

        <motion.ol
          className={styles.flow}
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          {processSteps.map((step, i) => (
            <motion.li
              key={step.title}
              className={styles.step}
              style={{ '--accent': `var(${teamAccent(step.lead)})` } as CSSProperties}
              variants={staggerItem}
            >
              <span className={styles.num} aria-hidden>
                {String(i + 1).padStart(2, '0')}
              </span>

              <div className={styles.card}>
                <div className={styles.cardHead}>
                  <h3 className={styles.title}>{step.title}</h3>
                  <span className={styles.lead}>
                    <span className={styles.leadDot} aria-hidden />
                    Lead · {teamLabel(step.lead)}
                  </span>
                </div>

                <p className={styles.what}>{step.what}</p>

                <div className={styles.meta}>
                  {step.support.length > 0 && (
                    <span className={styles.support}>
                      Support
                      {step.support.map((s) => (
                        <span key={s} className={styles.supportTeam}>
                          {teamLabel(s)}
                        </span>
                      ))}
                    </span>
                  )}
                  <span className={styles.value}>
                    <span className={styles.valueLabel}>Value</span>
                    {step.value}
                  </span>
                </div>
              </div>
            </motion.li>
          ))}
        </motion.ol>
      </Container>
    </Section>
  )
}
