import type { LeadershipProfileData } from './teamTypes'
import { portraitFocus } from '../ppmd-people/portraitFraming'
import { LeadershipAmbient } from './LeadershipAmbient'
import s from '../TeamsAndPeople.module.css'

/**
 * One reusable leadership scene body — used for both the Senior Director
 * and the Department Head. The 4:5 portrait is an accessible button that
 * opens the shared profile-detail dialog.
 *
 * The scene is the portrait, the statement, and the ambient field behind
 * them; the field is what gives the chapter the width of the viewport
 * without giving it more to read.
 */
export function LeadershipProfile({
  data,
  onOpen,
  variant = 0,
  active = 1,
  reducedMotion = false,
}: {
  data: LeadershipProfileData
  onOpen: (data: LeadershipProfileData) => void
  /** 0 — Senior Director, 1 — Department Head. Mirrors the field. */
  variant?: number
  /** 0..1 chapter presence; the ambient field idles when it is 0. */
  active?: number
  reducedMotion?: boolean
}) {
  const monogram = data.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)

  return (
    <>
      <LeadershipAmbient
        accent={data.accent}
        variant={variant}
        active={active}
        reducedMotion={reducedMotion}
      />
      <div className={s.leaderInner}>
        <button type="button" className={s.leaderPortraitBtn} onClick={() => onOpen(data)}>
          <span className={s.leaderPortrait} style={{ borderColor: `${data.accent}55` }}>
            {data.photo ? (
              <img
                className={s.leaderPhoto}
                src={data.photo}
                alt={data.photoAlt ?? ''}
                style={{ objectPosition: portraitFocus(data.photoPosition) }}
              />
            ) : (
              <>
                <span
                  className={s.leaderWash}
                  aria-hidden="true"
                  style={{
                    background: `radial-gradient(120% 90% at 30% 18%, ${data.accent}33, transparent 60%), linear-gradient(165deg, rgba(245,239,228,0.07), transparent 70%)`,
                  }}
                />
                <span
                  className={s.leaderMonogram}
                  aria-hidden="true"
                  style={{ color: data.accent }}
                >
                  {monogram}
                </span>
              </>
            )}
          </span>
          <span className={s.srOnly}>
            {data.name}, {data.title}, {data.organisationalUnit} — open profile
          </span>
        </button>
        <div className={s.leaderText}>
          <p className={s.leaderKicker} style={{ color: data.accent }}>
            {data.sceneKicker}
          </p>
          <p className={s.leaderLabel}>{data.title}</p>
          <p className={s.leaderUnit}>{data.organisationalUnit}</p>
          <h3 className={s.leaderName}>{data.name}</h3>
          <p className={s.leaderStatement}>{data.statement}</p>
        </div>
      </div>
    </>
  )
}
