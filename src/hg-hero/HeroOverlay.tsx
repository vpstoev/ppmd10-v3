import { useEffect, useState } from 'react'
import { SCENE, computeProgress, smoothstep } from './heroTheme'
import s from '../HgInspiredHero.module.css'

interface HeroOverlayProps {
  containerRef: React.RefObject<HTMLDivElement | null>
}

/**
 * Three text moments only — identity, anniversary, future. Everything
 * else is carried by the particle transformation. All text is real HTML;
 * visibility is a pure function of scroll progress. The identity is
 * rendered statically (no intro animation) so it is readable from the
 * very first frame.
 */
export function HeroOverlay({ containerRef }: HeroOverlayProps) {
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

  const openingOut = smoothstep(SCENE.openingTextOut[0], SCENE.openingTextOut[1], p)
  const o1 = 1 - openingOut

  // Moment 2 — the anniversary stack inside the zero.
  const labelO =
    smoothstep(SCENE.tenLabelIn[0], SCENE.tenLabelIn[1], p) *
    (1 - smoothstep(SCENE.tenLabelOut[0], SCENE.tenLabelOut[1], p))

  // Moment 3 — the future statement, with a residual iridescent trace.
  const o4 = smoothstep(SCENE.statementIn[0], SCENE.statementIn[1], p)
  const traceO = 1 - smoothstep(SCENE.traceFade[0], SCENE.traceFade[1], p)

  return (
    <div className={s.overlay}>
      {/* Moment 1 — identity, visible from the first loaded frame */}
      <div
        className={s.opening}
        style={{
          opacity: o1,
          transform: `translateY(${-32 * openingOut}px)`,
          visibility: o1 <= 0.01 ? 'hidden' : undefined,
        }}
      >
        <h1 className={s.openingTitle}>PPMD</h1>
        <p className={s.openingDept}>Project &amp; Processes Management Department</p>
      </div>

      <div
        className={s.scrollCue}
        style={{ opacity: o1, visibility: o1 <= 0.01 ? 'hidden' : undefined }}
      >
        <span>Scroll to explore</span>
        <span className={s.scrollCueLine} aria-hidden="true" />
      </div>

      {/* Moment 2 — anniversary, centred inside the zero's negative space */}
      <div
        className={s.tenLabel}
        style={{
          opacity: labelO,
          transform: `translate(-50%, calc(-50% + ${(1 - labelO) * 12}px))`,
          visibility: labelO <= 0.01 ? 'hidden' : undefined,
        }}
      >
        <span className={s.tenLabelTop}>PPMD</span>
        <p className={s.tenLabelMain}>10th Anniversary</p>
        <span className={s.tenLabelYears}>2016&mdash;2026</span>
      </div>

      {/* Moment 3 — future (unchanged) */}
      <div
        className={s.statement}
        style={{
          opacity: o4,
          transform: `translateY(${34 * (1 - o4)}px)`,
          visibility: o4 <= 0.01 ? 'hidden' : undefined,
        }}
      >
        <div className={s.statementRibbon} aria-hidden="true" style={{ opacity: traceO }} />
        <h2 className={s.statementTitle}>
          <span className={s.statementLine}>BUILT FOR WHAT</span>
          <span className={s.statementLine}>COMES NEXT.</span>
        </h2>
        <p className={s.statementLabel}>Project &amp; Processes Management Department</p>
      </div>
    </div>
  )
}
