import type { CSSProperties } from 'react'
import { motion } from 'motion/react'
import { Container } from '../ui/Container'
import { Section } from '../ui/Section'
import { SectionHeading } from '../ui/SectionHeading'
import { SparkIcon } from '../ui/icons'
import { messages } from '../../data/messages'
import type { FeedbackCategory } from '../../data/types'
import { easeOut, staggerContainer, staggerItem, viewportOnce } from '../../lib/motion'
import styles from './CelebrationWall.module.css'

/** Hand-placed sparkles scattered around the finale — twinkle is CSS, reduced-motion safe. */
const SPARKS = [
  { left: '8%', top: '24%', size: 16, delay: 0 },
  { left: '23%', top: '68%', size: 11, delay: 1.1 },
  { left: '50%', top: '12%', size: 13, delay: 0.5 },
  { left: '74%', top: '60%', size: 12, delay: 1.6 },
  { left: '90%', top: '28%', size: 17, delay: 0.8 },
  { left: '62%', top: '80%', size: 10, delay: 2.1 },
] as const

/** Each testimonial theme maps to a color-coded tag (warm spine + one subtle violet). */
const categoryStyle: Record<
  FeedbackCategory,
  { accent: string; glow: string; label: string }
> = {
  delivery: { accent: 'var(--accent)', glow: 'var(--accent-glow)', label: 'Delivery' },
  collaboration: { accent: 'var(--team-pp)', glow: 'var(--team-pp-glow)', label: 'Collaboration' },
  support: { accent: 'var(--team-bpt)', glow: 'var(--team-bpt-glow)', label: 'Support' },
  quality: { accent: 'var(--accent-3)', glow: 'var(--accent-glow)', label: 'Quality' },
  partnership: { accent: '#a855f7', glow: 'rgba(168, 85, 247, 0.4)', label: 'Partnership' },
}

export function CelebrationWall() {
  return (
    <Section id="wall" className={styles.section}>
      <span className={styles.backdrop} aria-hidden />
      <Container>
        <SectionHeading
          index="06"
          eyebrow="Voices from the Organization"
          title="What colleagues say about"
          highlight="working with us"
          description="Ten years of impact is best told by the people we serve. These are words from colleagues across A1 — outside the department — on what it’s like to work with PPMD."
        />

        <motion.div
          className={styles.mosaic}
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          {messages.map((msg, i) => {
            const cat = categoryStyle[msg.category]
            const style = {
              '--accent': cat.accent,
              '--accent-glow': cat.glow,
            } as CSSProperties
            return (
              <motion.figure
                key={i}
                className={styles.note}
                style={style}
                variants={staggerItem}
                whileHover={{ y: -5, rotate: i % 2 ? 0.5 : -0.5 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              >
                <span className={styles.tag}>{cat.label}</span>
                <span className={styles.mark}>“</span>
                <blockquote className={styles.text}>{msg.text}</blockquote>
                <figcaption className={styles.author}>
                  <span className={styles.avatar} aria-hidden>
                    {msg.author.charAt(0)}
                  </span>
                  <span className={styles.authorMeta}>
                    <strong>{msg.author}</strong>
                    <span className={styles.role}>
                      {msg.role} · {msg.department}
                    </span>
                    <span className={styles.relationship}>{msg.relationship}</span>
                  </span>
                </figcaption>
              </motion.figure>
            )
          })}

          {/* Inviting placeholder — these voices come from across the organization */}
          <motion.figure className={styles.invite} variants={staggerItem}>
            <span className={styles.inviteIcon} aria-hidden>
              <SparkIcon width={20} height={20} />
            </span>
            <blockquote className={styles.inviteText}>
              Worked with PPMD? Your words belong here.
            </blockquote>
            <figcaption className={styles.inviteCap}>
              Collected from colleagues across A1
            </figcaption>
          </motion.figure>
        </motion.div>

        <motion.div
          className={styles.finale}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportOnce}
          transition={{ duration: 0.7, ease: easeOut }}
        >
          <span className={styles.finaleGlow} aria-hidden />
          <span className={styles.sparks} aria-hidden>
            {SPARKS.map((s, i) => (
              <SparkIcon
                key={i}
                className={styles.spark}
                width={s.size}
                height={s.size}
                style={
                  {
                    left: s.left,
                    top: s.top,
                    '--delay': `${s.delay}s`,
                  } as CSSProperties
                }
              />
            ))}
          </span>

          <span className={styles.finaleEyebrow}>Est. 2015 — 2025</span>
          <p className={styles.closing}>
            Here&apos;s to the <span className={styles.closingAmber}>next ten years</span>.
          </p>
          <SparkIcon className={styles.closingSpark} width={26} height={26} aria-hidden />
        </motion.div>
      </Container>
    </Section>
  )
}
