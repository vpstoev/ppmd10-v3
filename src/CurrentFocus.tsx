import { useMemo, useRef } from 'react'
import { StreamField } from './ppmd-shared/StreamField'
import {
  detectWebGL,
  useNearViewport,
  useReducedMotionPref,
  useSectionProgress,
} from './ppmd-shared/sectionHooks'
import {
  FOCUS_AREAS,
  FOCUS_CLOSE_IN,
  FOCUS_PHASES,
  FOCUS_STREAM_COLORS,
  FOCUS_TITLE_OUT,
  FOCUS_VH,
  focusWeights,
} from './ppmd-focus/focusData'
import { fadeWindow, smoothstep } from './hg-hero/heroTheme'
import s from './CurrentFocus.module.css'

/**
 * Current Focus — one evolving spatial field; each focus area is a
 * temporary state of the same system. More energetic than the timeline,
 * still controlled.
 */
export default function CurrentFocus() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const reducedMotion = useReducedMotionPref()
  const webgl = useMemo(detectWebGL, [])
  const isMobile = useMemo(() => window.innerWidth < 768, [])
  const near = useNearViewport(containerRef)
  const p = useSectionProgress(containerRef)

  if (!webgl) return <StaticFallback />

  const titleO = 1 - smoothstep(FOCUS_TITLE_OUT[0], FOCUS_TITLE_OUT[1], p)
  const closeO = smoothstep(FOCUS_CLOSE_IN[0], FOCUS_CLOSE_IN[1], p)

  return (
    <section
      ref={containerRef}
      className={s.container}
      style={{ height: `${FOCUS_VH}vh` }}
      aria-label="Current focus"
    >
      <div className={s.sticky}>
        <div className={s.canvasLayer} aria-hidden="true">
          {near && (
            <StreamField
              containerRef={containerRef}
              reducedMotion={reducedMotion}
              isMobile={isMobile}
              colors={FOCUS_STREAM_COLORS}
              phases={FOCUS_PHASES}
              weights={focusWeights}
            />
          )}
        </div>

        <div className={s.overlay}>
          {/* Section title */}
          <div
            className={s.title}
            style={{
              opacity: titleO,
              transform: `translateY(${-26 * (1 - titleO)}px)`,
              visibility: titleO <= 0.01 ? 'hidden' : undefined,
            }}
          >
            <p className={s.titleLabel}>Current Focus</p>
            <h2 className={s.titleMain}>
              <span className={s.titleLine}>THE NEXT CHAPTER</span>
              <span className={s.titleLine}>IS ALREADY IN MOTION.</span>
            </h2>
          </div>

          {/* Five focus states */}
          {FOCUS_AREAS.map((focus, k) => {
            const w = fadeWindow(p, focus.window[0], focus.window[1], focus.window[2], focus.window[3])
            const enter = Math.min(1, w * 1.5)
            return (
              <div
                key={focus.num}
                className={k % 2 === 0 ? s.focusBlock : `${s.focusBlock} ${s.focusRight}`}
                style={{ visibility: w > 0.02 ? undefined : 'hidden' }}
              >
                <span
                  className={s.focusNum}
                  aria-hidden="true"
                  style={{ color: `${focus.accent}29`, opacity: enter }}
                >
                  {focus.num}
                </span>
                <div
                  className={s.focusContent}
                  style={{ opacity: enter, transform: `translateY(${(1 - enter) * 22}px)` }}
                >
                  <p className={s.focusMeta} style={{ color: focus.accent }}>
                    {focus.num}
                  </p>
                  <h3 className={s.focusName}>{focus.name}</h3>
                  <p className={s.focusLine}>{focus.line}</p>
                </div>
              </div>
            )
          })}

          {/* Closing */}
          <div
            className={s.closing}
            style={{
              opacity: closeO,
              transform: `translateY(${(1 - closeO) * 26}px)`,
              visibility: closeO <= 0.01 ? 'hidden' : undefined,
            }}
          >
            <h2 className={s.closingMain}>
              <span className={s.titleLine}>THE NEXT CHAPTER</span>
              <span className={s.titleLine}>IS NOT WAITING.</span>
            </h2>
          </div>
        </div>
      </div>
    </section>
  )
}

function StaticFallback() {
  return (
    <section className={s.fallback} aria-label="Current focus">
      <div className={`${s.fbBlock} ${s.fbCenter}`}>
        <p className={s.titleLabel}>Current Focus</p>
        <h2 className={s.titleMain}>
          <span className={s.titleLine}>THE NEXT CHAPTER</span>
          <span className={s.titleLine}>IS ALREADY IN MOTION.</span>
        </h2>
      </div>
      {FOCUS_AREAS.map((focus) => (
        <div key={focus.num} className={s.fbBlock}>
          <p className={s.focusMeta} style={{ color: focus.accent }}>
            {focus.num}
          </p>
          <h3 className={s.focusName}>{focus.name}</h3>
          <p className={s.focusLine}>{focus.line}</p>
        </div>
      ))}
      <div className={`${s.fbBlock} ${s.fbCenter}`}>
        <h2 className={s.closingMain}>
          <span className={s.titleLine}>THE NEXT CHAPTER</span>
          <span className={s.titleLine}>IS NOT WAITING.</span>
        </h2>
      </div>
    </section>
  )
}
