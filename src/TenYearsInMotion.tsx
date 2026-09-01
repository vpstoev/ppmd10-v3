import { useEffect, useMemo, useRef, useState } from 'react'
import { TimelineVisual } from './ppmd-timeline/TimelineVisual'
import {
  CLOSING_LINE1_IN,
  CLOSING_LINE2_IN,
  MILESTONES,
  TIMELINE_VH,
  TITLE_OUT,
} from './ppmd-timeline/timelineData'
import type { TimelineMilestone } from './ppmd-timeline/timelineTypes'
import { computeProgress, fadeWindow, smoothstep } from './hg-hero/heroTheme'
import s from './TenYearsInMotion.module.css'

const MILESTONES_2018 = MILESTONES.filter((milestone) => milestone.year === '2018')
const FIRST_2018_INDEX = MILESTONES.findIndex((milestone) => milestone.year === '2018')

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl2') || canvas.getContext('webgl'))
    )
  } catch {
    return false
  }
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}

/**
 * "Ten Years in Motion" — a cinematic scroll journey along one particle
 * time path, 2016—2026. Continues directly from the converged streams of
 * the capability section; each milestone is a spatial chapter with a
 * giant environmental year and one short editorial block.
 */
export default function TenYearsInMotion() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const reducedMotion = useReducedMotion()
  const webgl = useMemo(() => detectWebGL(), [])
  const isMobile = useMemo(() => window.innerWidth < 768, [])

  if (!webgl) return <StaticFallback />

  return (
    <section
      ref={containerRef}
      className={s.container}
      style={{ height: `${TIMELINE_VH}vh` }}
      aria-label="Ten years in motion — 2016 to 2026"
    >
      <div className={s.sticky}>
        <div className={s.canvasLayer} aria-hidden="true">
          <TimelineVisual
            containerRef={containerRef}
            reducedMotion={reducedMotion}
            isMobile={isMobile}
          />
        </div>
        <TextLayer containerRef={containerRef} />
      </div>
    </section>
  )
}

/** Applies the milestone's reveal technique to its content block. */
function revealStyle(kind: TimelineMilestone['reveal'], enter: number): React.CSSProperties {
  if (kind === 'clip') {
    return { clipPath: `inset(0 ${(1 - enter) * 100}% 0 0)`, opacity: Math.min(1, enter * 1.4) }
  }
  if (kind === 'depth') {
    return {
      transform: `scale(${0.96 + 0.04 * enter}) translateY(${(1 - enter) * 18}px)`,
      opacity: enter,
    }
  }
  /* mask — the wrapper clips, the inner block slides up */
  return {}
}

function TextLayer({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  const [p, setP] = useState(0)

  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      setP(computeProgress(containerRef.current))
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [containerRef])

  const titleO = 1 - smoothstep(TITLE_OUT[0], TITLE_OUT[1], p)
  const close1 = smoothstep(CLOSING_LINE1_IN[0], CLOSING_LINE1_IN[1], p)
  const close2 = smoothstep(CLOSING_LINE2_IN[0], CLOSING_LINE2_IN[1], p)

  return (
    <div className={s.overlay}>
      {/* Section title emerging from the merged stream */}
      <div
        className={s.title}
        style={{
          opacity: titleO,
          transform: `translateY(${-26 * (1 - titleO)}px)`,
          visibility: titleO <= 0.01 ? 'hidden' : undefined,
        }}
      >
        <h2 className={s.titleMain}>TEN YEARS IN MOTION</h2>
        <p className={s.titleYears}>2016&mdash;2026</p>
      </div>

      {/* Milestones — one spatial chapter at a time */}
      {MILESTONES.map((m, index) => {
        if (m.year === '2018') {
          if (index !== FIRST_2018_INDEX || MILESTONES_2018.length < 2) return null
          const first = MILESTONES_2018[0]
          const last = MILESTONES_2018[MILESTONES_2018.length - 1]
          /* The paired chapter starts only after the preceding milestone
             has fully left. That prevents the shared 2018 rail from
             cross-fading on top of the 2017 copy. */
          const pairEnterStart = first.window[1]
          const pairEnterEnd = Math.min(first.window[2], pairEnterStart + 0.04)
          const w = fadeWindow(
            p,
            pairEnterStart,
            pairEnterEnd,
            last.window[2],
            last.window[3],
          )
          const enter = Math.min(1, w * 1.5)
          const visible = w > 0.02

          return (
            <div
              key="timeline-2018-pair"
              className={`${s.milestone} ${s.yearPair2018}`}
              style={{ visibility: visible ? undefined : 'hidden' }}
            >
              <span
                className={s.bigYear}
                aria-hidden="true"
                style={{
                  opacity: enter,
                  color: '#9d6bff22',
                  transform: `scale(${1.1 - 0.1 * enter}) translateY(${(1 - enter) * 26}px)`,
                }}
              >
                2018
              </span>
              <div
                className={s.yearPairRail}
                style={{
                  opacity: enter,
                  transform: `translateX(${(1 - enter) * -24}px)`,
                }}
              >
                <p className={s.yearPairEyebrow}>Timeline 2018</p>
                <ol className={s.yearPairList}>
                  {MILESTONES_2018.map((event) => (
                    <li
                      key={event.id}
                      className={s.yearPairItem}
                      style={{ ['--milestone-accent' as string]: event.accent }}
                    >
                      <span className={s.yearPairNode} aria-hidden="true" />
                      <p className={s.yearPairMeta}>2018</p>
                      <h3 className={s.yearPairTitle}>
                        {event.title === 'INNOVATION, BUILT IN-HOUSE' ? (
                          <>INNOVATION,<br />BUILT IN-HOUSE</>
                        ) : event.title === 'FIRST BY NATURE .. A1 WAS BORN' ? (
                          <>FIRST BY NATURE —<br />A1 WAS BORN</>
                        ) : event.title}
                      </h3>
                      <p className={s.yearPairDescription}>{event.description}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )
        }

        const w = fadeWindow(p, m.window[0], m.window[1], m.window[2], m.window[3])
        const enter = Math.min(1, w * 1.5)
        const visible = w > 0.02
        const yearScale = 1.14 - 0.14 * enter
        return (
          <div
            key={`${m.id}-${index}`}
            className={`${s.milestone} ${s[`m${m.layout}` as keyof typeof s]}`}
            style={{ visibility: visible ? undefined : 'hidden' }}
          >
            <span
              className={m.iridescent ? `${s.bigYear} ${s.bigYearIridescent}` : s.bigYear}
              aria-hidden="true"
              style={{
                opacity: enter,
                transform: `scale(${yearScale}) translateY(${(1 - enter) * 30}px)`,
                ...(m.iridescent ? {} : { color: `${m.accent}52` }),
              }}
            >
              {m.year}
            </span>
            <div
              className={s.content}
              style={{
                opacity: m.reveal === 'mask' ? 1 : undefined,
                ['--milestone-accent' as string]: m.accent,
              }}
            >
              <div
                className={m.reveal === 'mask' ? s.maskWrap : undefined}
                style={m.reveal === 'mask' ? { opacity: Math.min(1, w * 2) } : undefined}
              >
                <div
                  style={
                    m.reveal === 'mask'
                      ? { transform: `translateY(${(1 - enter) * 105}%)` }
                      : revealStyle(m.reveal, enter)
                  }
                  className={s.contentInner}
                >
                  <p className={s.meta} style={{ color: m.accent }}>
                    {m.year}
                  </p>
                  <h3 className={s.milestoneTitle}>{m.title}</h3>
                  <p className={s.description}>{m.description}</p>
                </div>
              </div>
            </div>
          </div>
        )
      })}

      {/* Closing — toward the future Projects section */}
      <div
        className={s.closing}
        style={{ visibility: close1 <= 0.01 ? 'hidden' : undefined }}
      >
        <h2
          className={s.closingMain}
          style={{ opacity: close1, transform: `translateY(${(1 - close1) * 26}px)` }}
        >
          TEN YEARS SHAPED THE JOURNEY.
        </h2>
        <p
          className={s.closingNext}
          style={{ opacity: close2, transform: `translateY(${(1 - close2) * 16}px)` }}
        >
          The story continues through the work we deliver.
        </p>
      </div>
    </div>
  )
}

/** No-WebGL fallback: all milestones in normal flow, fully readable. */
function StaticFallback() {
  return (
    <section className={s.fallback} aria-label="Ten years in motion — 2016 to 2026">
      <div className={`${s.fbBlock} ${s.fbTitle}`}>
        <h2 className={s.titleMain}>TEN YEARS IN MOTION</h2>
        <p className={s.titleYears}>2016&mdash;2026</p>
      </div>
      {MILESTONES.map((m, index) => {
        if (m.year === '2018') {
          if (index !== FIRST_2018_INDEX) return null
          return (
            <div key="fallback-2018-pair" className={`${s.fbBlock} ${s.fbPair2018}`}>
              <span className={s.fbYear} aria-hidden="true" style={{ color: '#9d6bff35' }}>2018</span>
              {MILESTONES_2018.map((event) => (
                <div key={event.id} className={s.fbPairEvent}>
                  <p className={s.meta} style={{ color: event.accent }}>2018</p>
                  <h3 className={s.milestoneTitle}>{event.title}</h3>
                  <p className={s.description}>{event.description}</p>
                </div>
              ))}
            </div>
          )
        }
        return (
          <div key={`${m.id}-${index}`} className={s.fbBlock}>
            <span
              className={m.iridescent ? `${s.fbYear} ${s.bigYearIridescent}` : s.fbYear}
              aria-hidden="true"
              style={m.iridescent ? {} : { color: `${m.accent}52` }}
            >
              {m.year}
            </span>
            <p className={s.meta} style={{ color: m.accent }}>{m.year}</p>
            <h3 className={s.milestoneTitle}>{m.title}</h3>
            <p className={s.description}>{m.description}</p>
          </div>
        )
      })}
      <div className={`${s.fbBlock} ${s.fbClosing}`}>
        <h2 className={s.closingMain}>TEN YEARS SHAPED THE JOURNEY.</h2>
        <p className={s.closingNext}>The story continues through the work we deliver.</p>
      </div>
    </section>
  )
}
