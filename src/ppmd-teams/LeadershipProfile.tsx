import type { LeadershipProfileData } from './teamTypes'
import s from '../TeamsAndPeople.module.css'

/**
 * One reusable leadership scene body — used for both the Senior Director
 * and the Department Head. The 4:5 portrait is an accessible button that
 * opens the shared profile-detail dialog.
 */
export function LeadershipProfile({
  data,
  onOpen,
}: {
  data: LeadershipProfileData
  onOpen: (data: LeadershipProfileData) => void
}) {
  const monogram = data.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)

  return (
    <div className={s.leaderInner}>
      <button
        type="button"
        className={s.leaderPortraitBtn}
        onClick={() => onOpen(data)}
      >
        <span className={s.leaderPortrait} style={{ borderColor: `${data.accent}55` }}>
          {data.photo ? (
            <img
              className={s.leaderPhoto}
              src={data.photo}
              alt={data.photoAlt ?? ''}
              style={{ objectPosition: data.photoPosition ?? 'center' }}
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
              <span className={s.leaderMonogram} aria-hidden="true" style={{ color: data.accent }}>
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
  )
}
