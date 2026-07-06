import { useEffect, useMemo, useRef, useState } from 'react'
import { CapabilitiesVisual } from './ppmd-capabilities/CapabilitiesVisual'
import {
  CAPABILITIES,
  SECTION_VH,
  phaseWeights,
} from './ppmd-capabilities/capabilitiesData'
import { computeProgress, smoothstep } from './hg-hero/heroTheme'
import s from './WhatPpmdMakesPossible.module.css'

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
 * "What PPMD makes possible" — one scroll-driven section continuing the
 * Hero: the residual iridescent stream separates into four capability
 * paths, one capability dominating the viewport at a time, before all
 * four braid back into one delivery system.
 */
export default function WhatPpmdMakesPossible() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const reducedMotion = useReducedMotion()
  const webgl = useMemo(detectWebGL, [])
  const isMobile = useMemo(() => window.innerWidth < 768, [])

  if (!webgl) return <StaticFallback />

  return (
    <section
      ref={containerRef}
      className={s.container}
      style={{ height: `${SECTION_VH}vh` }}
      aria-label="What PPMD makes possible"
    >
      <div className={s.sticky}>
        <div className={s.canvasLayer} aria-hidden="true">
          <CapabilitiesVisual
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

  const W = phaseWeights(p)
  const introO = 1 - smoothstep(0.09, 0.15, p)
  const closeO = smoothstep(0.78, 0.86, p)

  return (
    <div className={s.overlay}>
      {/* Section introduction */}
      <div
        className={s.intro}
        style={{
          opacity: introO,
          transform: `translateY(${-28 * (1 - introO)}px)`,
          visibility: introO <= 0.01 ? 'hidden' : undefined,
        }}
      >
        <p className={s.introLabel}>What PPMD Makes Possible</p>
        <h2 className={s.introStatement}>
          Behind every successful transformation is a system that turns complexity into
          coordinated action.
        </h2>
      </div>

      {/* Four capability scenes — one dominates at a time */}
      {CAPABILITIES.map((cap, k) => {
        const w = W[k + 1]
        // Text uses the raw phase plateau so it holds at full opacity.
        const visible = w > 0.02
        return (
          <div
            key={cap.num}
            className={k % 2 === 0 ? s.capBlock : `${s.capBlock} ${s.capRight}`}
            style={{
              opacity: Math.min(1, w * 1.6),
              transform: `translateY(${(1 - Math.min(1, w * 1.6)) * 26}px)`,
              visibility: visible ? undefined : 'hidden',
            }}
          >
            <div className={s.capInner}>
              <p className={s.capMeta} style={{ color: cap.accent }}>
                <span className={s.capNum}>{cap.num}</span>
                {cap.name}
              </p>
              <h3 className={s.capHeadline}>{cap.headline}</h3>
              <p className={s.capSupport}>{cap.support}</p>
              <p className={s.capLine} style={{ color: cap.accent }}>
                {cap.line}
              </p>
            </div>
          </div>
        )
      })}

      {/* Closing — one delivery system */}
      <div
        className={s.closing}
        style={{
          opacity: closeO,
          transform: `translateY(${(1 - closeO) * 30}px)`,
          visibility: closeO <= 0.01 ? 'hidden' : undefined,
        }}
      >
        <h2 className={s.closingTitle}>
          <span className={s.closingLine}>DIFFERENT DISCIPLINES.</span>
          <span className={`${s.closingLine} ${s.closingLineGradient}`}>
            ONE DELIVERY SYSTEM.
          </span>
        </h2>
        <p className={s.closingSupport}>
          Working together to bring structure, quality and momentum to A1&rsquo;s most complex
          initiatives.
        </p>
      </div>
    </div>
  )
}

/** No-WebGL fallback: normal flow, all text visible, gradient stream rules. */
function StaticFallback() {
  return (
    <section className={s.fallback} aria-label="What PPMD makes possible">
      <div className={`${s.fbBlock} ${s.fbIntro}`}>
        <p className={s.introLabel}>What PPMD Makes Possible</p>
        <h2 className={s.introStatement}>
          Behind every successful transformation is a system that turns complexity into
          coordinated action.
        </h2>
      </div>
      {CAPABILITIES.map((cap) => (
        <div key={cap.num} className={s.fbBlock}>
          <span
            className={s.fbRule}
            aria-hidden="true"
            style={{ background: `linear-gradient(90deg, ${cap.accent}, transparent)` }}
          />
          <p className={s.capMeta} style={{ color: cap.accent }}>
            <span className={s.capNum}>{cap.num}</span>
            {cap.name}
          </p>
          <h3 className={s.capHeadline}>{cap.headline}</h3>
          <p className={s.capSupport}>{cap.support}</p>
          <p className={s.capLine} style={{ color: cap.accent }}>
            {cap.line}
          </p>
        </div>
      ))}
      <div className={`${s.fbBlock} ${s.fbClosing}`}>
        <h2 className={s.closingTitle}>
          <span className={s.closingLine}>DIFFERENT DISCIPLINES.</span>
          <span className={`${s.closingLine} ${s.closingLineGradient}`}>
            ONE DELIVERY SYSTEM.
          </span>
        </h2>
        <p className={s.closingSupport}>
          Working together to bring structure, quality and momentum to A1&rsquo;s most complex
          initiatives.
        </p>
      </div>
    </section>
  )
}
