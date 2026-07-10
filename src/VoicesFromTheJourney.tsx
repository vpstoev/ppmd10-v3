import { useRef } from 'react'
import { useSectionProgress } from './ppmd-shared/sectionHooks'
import { VOICES, VOICES_TITLE_OUT, VOICES_VH } from './ppmd-voices/voicesData'
import { fadeWindow, smoothstep } from './hg-hero/heroTheme'
import s from './VoicesFromTheJourney.module.css'

/**
 * Voices from the Journey — one large editorial quote at a time,
 * scroll-controlled, with lightweight CSS particle traces instead of a
 * WebGL canvas (the page already carries several).
 */
export default function VoicesFromTheJourney() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const p = useSectionProgress(containerRef)

  const titleO = 1 - smoothstep(VOICES_TITLE_OUT[0], VOICES_TITLE_OUT[1], p)

  return (
    <section
      ref={containerRef}
      className={s.container}
      style={{ height: `${VOICES_VH}vh` }}
      aria-label="Voices from the journey"
    >
      <div className={s.sticky}>
        {/* Lightweight CSS traces — decorative only */}
        <div className={s.traces} aria-hidden="true">
          <span className={`${s.streak} ${s.streakA}`} />
          <span className={`${s.streak} ${s.streakB}`} />
          <span className={`${s.streak} ${s.streakC}`} />
          <span className={`${s.dot} ${s.dotA}`} />
          <span className={`${s.dot} ${s.dotB}`} />
          <span className={`${s.dot} ${s.dotC}`} />
          <span className={`${s.dot} ${s.dotD}`} />
        </div>

        <div className={s.overlay}>
          <div
            className={s.title}
            style={{
              opacity: titleO,
              transform: `translateY(${-24 * (1 - titleO)}px)`,
              visibility: titleO <= 0.01 ? 'hidden' : undefined,
            }}
          >
            <h2 className={s.titleMain}>
              <span className={s.titleLine}>VOICES FROM</span>
              <span className={s.titleLine}>THE JOURNEY</span>
            </h2>
          </div>

          {VOICES.map((voice) => {
            const w = fadeWindow(p, voice.window[0], voice.window[1], voice.window[2], voice.window[3])
            const enter = Math.min(1, w * 1.5)
            return (
              <figure
                key={voice.attribution}
                className={s.quoteBlock}
                style={{ visibility: w > 0.02 ? undefined : 'hidden' }}
              >
                <div className={s.quoteMask} style={{ opacity: Math.min(1, w * 2) }}>
                  <blockquote
                    className={s.quote}
                    style={{ transform: `translateY(${(1 - enter) * 60}px)`, opacity: enter }}
                  >
                    &ldquo;{voice.quote}&rdquo;
                  </blockquote>
                </div>
                <figcaption
                  className={s.attribution}
                  style={{ opacity: Math.max(0, enter * 1.2 - 0.2) }}
                >
                  <span className={s.attributionRule} style={{ background: voice.accent }} />
                  <span className={s.attributionName}>{voice.attribution}</span>
                  <span className={s.attributionRole}>{voice.role}</span>
                </figcaption>
              </figure>
            )
          })}
        </div>
      </div>
    </section>
  )
}
