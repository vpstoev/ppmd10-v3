import styles from './LightTrails.module.css'

/** A flowing red light streak traveling along a bezier curve. */
interface Trail {
  d: string
  duration: number
  delay: number
  width: number
  opacity: number
}

const trails: Trail[] = [
  { d: 'M-100 180 C 250 60, 500 320, 760 180 S 1150 60, 1360 220', duration: 7, delay: 0, width: 2, opacity: 0.9 },
  { d: 'M-100 420 C 300 520, 520 240, 820 420 S 1180 560, 1360 380', duration: 9, delay: 1.2, width: 1.6, opacity: 0.7 },
  { d: 'M-100 620 C 240 700, 560 480, 800 640 S 1160 720, 1360 560', duration: 8, delay: 2.4, width: 1.4, opacity: 0.6 },
  { d: 'M-100 80 C 360 200, 600 -40, 900 120 S 1220 240, 1360 60', duration: 10, delay: 0.6, width: 1.2, opacity: 0.5 },
]

/**
 * Abstract A1-style light trails for the hero background.
 * Pure SVG + CSS so it stays crisp and cheap; freezes when the user
 * prefers reduced motion (handled in the stylesheet).
 */
export function LightTrails() {
  return (
    <svg
      className={styles.svg}
      viewBox="0 0 1260 800"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <linearGradient id="trail-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ff3b3b" stopOpacity="0" />
          <stop offset="45%" stopColor="#ff2e43" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="55%" stopColor="#e2001a" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#e2001a" stopOpacity="0" />
        </linearGradient>
        <filter id="trail-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      {/* Faint guide curves */}
      {trails.map((t, i) => (
        <path key={`base-${i}`} className={styles.base} d={t.d} />
      ))}

      {/* Glowing traveling streaks (blurred halo + bright core) */}
      {trails.map((t, i) => {
        const vars = {
          ['--dur' as string]: `${t.duration}s`,
          ['--delay' as string]: `${t.delay}s`,
        }
        return (
          <g key={`trail-${i}`} style={vars} opacity={t.opacity}>
            <path
              className={styles.trail}
              d={t.d}
              stroke="url(#trail-grad)"
              strokeWidth={t.width * 3}
              filter="url(#trail-blur)"
            />
            <path
              className={styles.trail}
              d={t.d}
              stroke="url(#trail-grad)"
              strokeWidth={t.width}
            />
          </g>
        )
      })}
    </svg>
  )
}
