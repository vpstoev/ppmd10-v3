import { useMemo, useRef, useState, useEffect } from 'react'
import { ParticleScene } from './hg-hero/ParticleScene'
import { HeroOverlay } from './hg-hero/HeroOverlay'
import { COUNT_DESKTOP, COUNT_DESKTOP_LOW, COUNT_MOBILE, CONTAINER_VH } from './hg-hero/heroTheme'
import s from './HgInspiredHero.module.css'

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
 * Scroll-driven anniversary hero proof of concept (Hg-inspired pacing):
 * a ~480vh scroll container with a sticky WebGL particle canvas and a
 * sticky HTML overlay. Four scenes are keyed to normalized scroll
 * progress — light opening, particle "10", journey through the "0",
 * and a closing strategic statement.
 */
export default function HgInspiredHero() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const reducedMotion = useReducedMotion()
  const webgl = useMemo(detectWebGL, [])
  const isMobile = useMemo(() => window.innerWidth < 768, [])
  const count = useMemo(() => {
    if (isMobile) return COUNT_MOBILE
    const cores = navigator.hardwareConcurrency ?? 8
    return cores <= 4 ? COUNT_DESKTOP_LOW : COUNT_DESKTOP
  }, [isMobile])

  if (!webgl) return <StaticFallback />

  return (
    <div ref={containerRef} className={s.container} style={{ height: `${CONTAINER_VH}vh` }}>
      <div className={s.sticky}>
        <div className={s.canvasLayer} aria-hidden="true">
          <ParticleScene
            containerRef={containerRef}
            reducedMotion={reducedMotion}
            isMobile={isMobile}
            count={count}
          />
        </div>
        <HeroOverlay containerRef={containerRef} />
      </div>
    </div>
  )
}

/**
 * Graceful no-WebGL fallback: normal document flow, all text visible,
 * a CSS/SVG dotted "10" instead of the particle system.
 */
function StaticFallback() {
  return (
    <div className={s.fallback}>
      <section className={`${s.fbSection} ${s.fbOpening}`}>
        <div className={s.fbHalo} aria-hidden="true" />
        <h1 className={s.openingTitle}>PPMD</h1>
        <p className={s.openingDept}>Project &amp; Processes Management Department</p>
        <p className={s.fbCue}>Scroll to explore</p>
      </section>

      <section className={`${s.fbSection} ${s.fbTen}`}>
        <span className={s.fbTenNumber} aria-hidden="true">
          10
        </span>
        <div className={s.fbTenLabel}>
          <span className={s.tenLabelTop}>PPMD</span>
          <p className={s.tenLabelMain}>10th Anniversary</p>
          <span className={s.tenLabelYears}>2016&mdash;2026</span>
        </div>
        <p className={s.srOnly}>10 years</p>
      </section>

      <section className={`${s.fbSection} ${s.fbStatement} ${s.fbStatementLeft}`}>
        <div className={s.statementRibbon} aria-hidden="true" />
        <h2 className={s.statementTitle}>
          <span className={s.statementLine}>BUILT FOR WHAT</span>
          <span className={s.statementLine}>COMES NEXT.</span>
        </h2>
        <p className={s.statementLabel}>Project &amp; Processes Management Department</p>
      </section>
    </div>
  )
}
