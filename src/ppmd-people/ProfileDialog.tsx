import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { XIcon } from 'lucide-react'
import type { ProfileDetailData } from './peopleTypes'
import { portraitFocus } from './portraitFraming'
import { EmphasizedText } from '../ppmd-content/EmphasizedText'
import s from './ProfileDialog.module.css'

interface ProfileDialogProps {
  profile: ProfileDetailData | null
  onClose: () => void
}

/**
 * The ONE shared editorial profile-detail dialog — used for the Senior
 * Director, Department Head, team leadership and every team member.
 * Two columns: a centred, softly vignetted 4:5 portrait (roughly a third
 * of the scene) and a wide, readable content column that takes the rest.
 * Escape closes, focus is trapped while open and returns to the
 * originating tile; page scroll is locked behind it.
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
    /* The global section rail intentionally stays visible above this
       full-screen scene. Close the scene before its navigation handler
       runs so a rail click never leaves an invisible modal behind. */
    const onSectionNavigation = (e: MouseEvent) => {
      const target = e.target instanceof Element ? e.target : null
      if (target?.closest('nav[aria-label="Sections"] button')) onClose()
    }
    window.addEventListener('keydown', onKey)
    document.addEventListener('click', onSectionNavigation, true)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('click', onSectionNavigation, true)
      document.body.style.overflow = prevOverflow
      openerRef.current?.focus()
    }
  }, [profile, onClose])

  if (!profile) return null

  const isLeadership =
    profile.profileType === 'senior-director' || profile.profileType === 'department-head'
  /* A testimonial rather than a colleague: no portrait exists for these,
     so the panel is the quote and the attribution, full width. */
  const isVoice = profile.profileType === 'voice'
  /* Nothing but identity to show — see `.panelBrief`. */
  const brief = !(
    profile.quote ||
    profile.shortBio ||
    profile.keyContribution ||
    profile.personalFact
  )
  const monogram = profile.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
  /* Do not repeat the same title three times. Leadership records arrive
     with the full title as both label and role, while the organisational
     unit is often already the second half of that title. */
  const identityKey = (value?: string) =>
    value?.toLocaleLowerCase().replace(/[^a-z0-9]+/g, ' ').trim() ?? ''
  const roleKey = identityKey(profile.role)
  const unitKey = identityKey(profile.unit)
  const displayLabel = profile.role ? undefined : profile.label
  const displayUnit = unitKey && !roleKey.includes(unitKey) ? profile.unit : undefined

  return createPortal(
    <div className={s.backdrop} onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-dialog-name"
        aria-describedby="profile-dialog-desc"
        className={[
          s.panel,
          isLeadership ? s.panelLead : '',
          isVoice ? s.panelVoice : '',
          brief && !isVoice ? s.panelBrief : '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={{
          ['--panel-accent' as string]: profile.accent,
          ['--detail-role-accent' as string]: isLeadership ? '#76d9ff' : profile.accent,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeRef}
          type="button"
          className={s.close}
          onClick={onClose}
          aria-label="Close profile"
        >
          <XIcon aria-hidden="true" size={22} strokeWidth={1.8} />
        </button>

        {/* Portrait column — a major visual element, never a thumbnail.
            Absent for testimonials, which have no photograph to show. */}
        {!isVoice && (
        <div className={s.portraitCol}>
          {profile.photo ? (
            <div className={s.portraitFrame}>
              <img
                className={s.photoBackdrop}
                src={profile.photo}
                alt=""
                aria-hidden="true"
                decoding="async"
                style={{ objectPosition: portraitFocus(profile.photoPosition) }}
              />
              <img
                className={s.photo}
                src={profile.photo}
                alt={profile.photoAlt ?? ''}
                loading="eager"
                decoding="async"
                style={{ objectPosition: portraitFocus(profile.photoPosition) }}
              />
            </div>
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
        )}

        {/* Content column — scrolls on desktop; mobile uses one natural
            scroll container for the complete profile. */}
        <div
          className={s.contentCol}
          tabIndex={0}
          role="document"
          aria-label={`${profile.name} profile details`}
        >
          {!isVoice && (
            <p className={s.kicker}>{isLeadership ? 'People' : 'Teams'}</p>
          )}
          {displayLabel && (
            <p className={s.label} style={{ color: profile.accent }}>
              {displayLabel}
            </p>
          )}
          <h3 id="profile-dialog-name" className={s.name}>
            {profile.name}
          </h3>
          {/* Only what is known. A colleague whose title has not been
              confirmed yet gets their name and their team, and no line
              apologising for the gap. */}
          <div id="profile-dialog-desc" className={s.identity}>
            {profile.role && <p className={s.role}>{profile.role}</p>}
            {displayUnit && <p className={s.unit}>{displayUnit}</p>}
          </div>

          {profile.quote && <blockquote className={s.quote}>&ldquo;{profile.quote}&rdquo;</blockquote>}

          {profile.shortBio && (
            <div
              className={`${s.section} ${s.sectionAbout}`}
              style={{ ['--section-order' as string]: 0 }}
            >
              <p className={s.sectionLabel}>About</p>
              <p className={s.sectionText}><EmphasizedText text={profile.shortBio} phrases={profile.shortBioEmphasis} className={s.textEmphasis} /></p>
            </div>
          )}
          {profile.keyContribution && (
            <div
              className={`${s.section} ${s.sectionContribution}`}
              style={{ ['--section-order' as string]: 1 }}
            >
              <p className={s.sectionLabel}>Contribution</p>
              <p className={s.sectionText}><EmphasizedText text={profile.keyContribution} phrases={profile.keyContributionEmphasis} className={s.textEmphasis} /></p>
            </div>
          )}
          {profile.personalFact && (
            <div
              className={`${s.section} ${s.sectionBeyond}`}
              style={{ ['--section-order' as string]: 2 }}
            >
              <p className={s.sectionLabel}>Beyond the role</p>
              <p className={s.sectionText}><EmphasizedText text={profile.personalFact} phrases={profile.personalFactEmphasis} className={s.textEmphasis} /></p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
