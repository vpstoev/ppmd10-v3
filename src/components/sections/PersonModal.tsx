import { useEffect, useRef } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Avatar } from '../ui/Avatar'
import { CloseIcon, QuoteIcon } from '../ui/icons'
import { teams, teamsById } from '../../data/teams'
import type { Person } from '../../data/types'
import { staggerContainer, staggerItem } from '../../lib/motion'
import styles from './PersonModal.module.css'

interface PersonModalProps {
  person: Person | null
  onClose: () => void
}

export function PersonModal({ person, onClose }: PersonModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  // Escape to close, scroll lock, focus trap + focus restore while open.
  useEffect(() => {
    if (!person) return

    // Remember what had focus so we can return to it on close.
    const trigger = document.activeElement as HTMLElement | null

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab') return
      // Trap Tab focus inside the dialog.
      const focusables = modalRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (!focusables || focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    // Move focus into the dialog once it has mounted.
    const id = requestAnimationFrame(() => {
      modalRef.current
        ?.querySelector<HTMLElement>('button, a[href], [tabindex]:not([tabindex="-1"])')
        ?.focus()
    })

    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      cancelAnimationFrame(id)
      trigger?.focus?.()
    }
  }, [person, onClose])

  return (
    <AnimatePresence>
      {person && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={`${person.name} profile`}
        >
          <motion.div
            ref={modalRef}
            className={styles.modal}
            style={
              {
                '--accent': `var(${teamsById[person.team].accentVar})`,
                '--accent-glow': `var(${teamsById[person.team].accentGlowVar})`,
              } as CSSProperties
            }
            initial={{ opacity: 0, y: 40, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className={styles.close} onClick={onClose} aria-label="Close profile">
              <CloseIcon width={20} height={20} />
            </button>

            <div className={styles.banner} aria-hidden>
              <span className={styles.bannerOrbit} />
              <span className={styles.bannerOrbit2} />
            </div>

            <motion.div variants={staggerContainer} initial="hidden" animate="visible">
              <motion.header className={styles.head} variants={staggerItem}>
                <span className={styles.avatarNode}>
                  <span className={styles.avatarRing} aria-hidden />
                  <Avatar person={person} size={96} />
                </span>
                <div className={styles.headText}>
                  <span className={styles.team}>{teamsById[person.team].name}</span>
                  <h3 className={styles.name}>{person.name}</h3>
                  <p className={styles.role}>{person.role}</p>
                  <span className={styles.node}>
                    {teamsById[person.team].codename} · node {person.id}
                  </span>
                </div>
              </motion.header>

              <div className={styles.body}>
                <Field label="Known for">{person.superpower}</Field>
                <Field label="Contribution to the department">
                  {person.contribution}
                </Field>
                <Field label="Fun fact">{person.funFact}</Field>

                <motion.figure className={styles.quote} variants={staggerItem}>
                  <QuoteIcon width={26} height={26} className={styles.quoteMark} />
                  <blockquote>{person.quote}</blockquote>
                  <figcaption>10-year message</figcaption>
                </motion.figure>

                <motion.div className={styles.connections} variants={staggerItem}>
                  <span className={styles.connLabel}>Place in the system</span>
                  <div className={styles.connNodes}>
                    {teams.map((t) => (
                      <span
                        key={t.id}
                        className={`${styles.connNode} ${
                          t.id === person.team ? styles.connActive : ''
                        }`}
                        style={{ '--accent': `var(${t.accentVar})` } as CSSProperties}
                      >
                        {t.short}
                      </span>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <motion.div className={styles.field} variants={staggerItem}>
      <span className={styles.fieldLabel}>{label}</span>
      <p className={styles.fieldValue}>{children}</p>
    </motion.div>
  )
}
