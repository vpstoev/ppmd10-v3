import { useEffect, useRef } from 'react'
import type { ProfileDetailData } from './peopleTypes'
import s from './ProfileDialog.module.css'

interface ProfileDialogProps {
  profile: ProfileDetailData | null
  onClose: () => void
}

/**
 * The ONE shared editorial profile-detail dialog — used for the Senior
 * Director, Department Head, team leadership and every team member.
 * Large two-column layout: a prominent 4:5 portrait column (fixed) and a
 * scrollable content column. Escape closes, focus is trapped while open
 * and returns to the originating tile; page scroll is locked behind it.
 */
export function ProfileDialog({ profile, onClose }: ProfileDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const openerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!profile) return
    openerRef.current = document.activeElement as HTMLElement
    closeRef.current?.focus()

    /* Lock page scroll behind the dialog; restore exactly on close. */
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], [tabindex]:not([tabindex="-1"])',
        )
        if (focusables.length === 0) return
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
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      openerRef.current?.focus()
    }
  }, [profile, onClose])

  if (!profile) return null

  const isLeadership =
    profile.profileType === 'senior-director' || profile.profileType === 'department-head'
  const monogram = profile.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)

  return (
    <div className={s.backdrop} onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-dialog-name"
        aria-describedby="profile-dialog-desc"
        className={isLeadership ? `${s.panel} ${s.panelLead}` : s.panel}
        style={{ borderTopColor: profile.accent }}
        onClick={(e) => e.stopPropagation()}
      >
        <button ref={closeRef} type="button" className={s.close} onClick={onClose}>
          <span aria-hidden="true">×</span>
          <span className={s.srOnly}>Close profile</span>
        </button>

        {/* Portrait column — a major visual element, never a thumbnail */}
        <div className={s.portraitCol}>
          {profile.photo ? (
            <img
              className={s.photo}
              src={profile.photo}
              alt={profile.photoAlt ?? ''}
              style={{ objectPosition: profile.photoPosition ?? 'center' }}
            />
          ) : (
            <>
              <span
                className={s.wash}
                aria-hidden="true"
                style={{
                  background: `radial-gradient(130% 90% at 30% 16%, ${profile.accent}30, transparent 60%), linear-gradient(168deg, rgba(245,239,228,0.08) 0%, rgba(245,239,228,0.02) 45%, transparent 75%)`,
                }}
              />
              <span className={s.monogram} aria-hidden="true" style={{ color: profile.accent }}>
                {monogram}
              </span>
            </>
          )}
        </div>

        {/* Content column — the only part that scrolls */}
        <div className={s.contentCol}>
          <p className={s.label} style={{ color: profile.accent }}>
            {profile.label}
          </p>
          <h3 id="profile-dialog-name" className={s.name}>
            {profile.name}
          </h3>
          <div id="profile-dialog-desc" className={s.identity}>
            <p className={s.role}>{profile.role}</p>
            <p className={s.unit}>{profile.unit}</p>
          </div>

          {profile.quote && <blockquote className={s.quote}>&ldquo;{profile.quote}&rdquo;</blockquote>}

          {profile.shortBio && (
            <div className={s.section}>
              <p className={s.sectionLabel}>About</p>
              <p className={s.sectionText}>{profile.shortBio}</p>
            </div>
          )}
          {profile.keyContribution && (
            <div className={s.section}>
              <p className={s.sectionLabel}>Contribution</p>
              <p className={s.sectionText}>{profile.keyContribution}</p>
            </div>
          )}
          {profile.personalFact && (
            <div className={s.section}>
              <p className={s.sectionLabel}>Beyond the role</p>
              <p className={s.sectionText}>{profile.personalFact}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
