import { useRef } from 'react'
import { useSectionProgress } from './ppmd-shared/sectionHooks'
import { fadeWindow, smoothstep } from './hg-hero/heroTheme'
import s from './FinalClosing.module.css'

const CLOSING_VH = 360

/**
 * Final closing — the website's strands return as one calm iridescent
 * horizon (CSS/SVG only), two closing statements and the identity block,
 * ending with a single minimal anniversary line.
 */
export default function FinalClosing() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const p = useSectionProgress(containerRef)

  const stmt1 = fadeWindow(p, 0.06, 0.16, 0.36, 0.46)
  const stmt2 = smoothstep(0.5, 0.62, p)
  const identity = smoothstep(0.68, 0.8, p)
  const horizonO = 0.35 + smoothstep(0.4, 0.7, p) * 0.65

  return (
    <>
      <section
        ref={containerRef}
        className={s.container}
        style={{ height: `${CLOSING_VH}vh` }}
        aria-label="Closing"
      >
        <div className={s.sticky}>
          {/* Returning strands + calm iridescent horizon (decorative) */}
          <div className={s.scene} aria-hidden="true" style={{ opacity: horizonO }}>
            <svg className={s.strands} viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
              <path d="M -60 220 C 420 300 900 430 1660 500" stroke="#ff6e79" strokeWidth="2" fill="none" opacity="0.35" />
              <path d="M -60 720 C 480 640 980 560 1660 505" stroke="#9d6bff" strokeWidth="2" fill="none" opacity="0.35" />
              <path d="M -60 120 C 520 260 1040 420 1660 498" stroke="#7cc4ff" strokeWidth="1.5" fill="none" opacity="0.3" />
              <path d="M -60 820 C 560 700 1080 580 1660 508" stroke="#e8c188" strokeWidth="1.5" fill="none" opacity="0.3" />
            </svg>
            <span className={s.horizonGlow} />
            <span className={s.horizonLine} />
          </div>

          <div className={s.overlay}>
            <div
              className={s.block}
              style={{
                opacity: stmt1,
                transform: `translateY(${(1 - Math.min(1, stmt1 * 1.4)) * 24}px)`,
                visibility: stmt1 <= 0.01 ? 'hidden' : undefined,
              }}
            >
              <h2 className={s.statement}>
                <span className={s.line}>TEN YEARS OF</span>
                <span className={s.line}>PEOPLE, STRUCTURE</span>
                <span className={s.line}>AND DELIVERY.</span>
              </h2>
            </div>

            <div
              className={s.block}
              style={{
                opacity: stmt2 * (1 - identity * 0.35),
                transform: `translateY(${(1 - stmt2) * 24}px)`,
                visibility: stmt2 <= 0.01 ? 'hidden' : undefined,
              }}
            >
              <h2 className={s.statement}>
                <span className={s.line}>THE NEXT CHAPTER</span>
                <span className={`${s.line} ${s.lineGradient}`}>STARTS NOW.</span>
              </h2>
            </div>

            <div
              className={s.identity}
              style={{
                opacity: identity,
                transform: `translateY(${(1 - identity) * 18}px)`,
                visibility: identity <= 0.01 ? 'hidden' : undefined,
              }}
            >
              <p className={s.identityName}>PPMD</p>
              <p className={s.identityDept}>Project &amp; Processes Management Department</p>
              <p className={s.identityMeta}>A1 Bulgaria · 2016&mdash;2026</p>
            </div>
          </div>
        </div>
      </section>

      {/* The only footer content */}
      <footer className={s.footer}>
        <p>PPMD · 10th Anniversary · 2016&mdash;2026</p>
      </footer>
    </>
  )
}
