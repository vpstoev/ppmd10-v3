import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { CAPABILITIES } from '../ppmd-capabilities/capabilitiesData'
import { computeProgress, fadeWindow, smoothstep } from '../hg-hero/heroTheme'
import {
  EXP,
  TOTAL_VH,
  approachDrive,
  capFocus,
  darkWeight,
  earlyDrive,
  lockupScale,
} from './experienceData'
import {
  ENT,
  attachHeroPointer,
  beginEntrance,
  cancelEntrance,
  pointerTarget,
} from './entranceData'
import { ExperienceCanvas, type GlyphAnchor } from './ExperienceCanvas'
import s from './ExperienceSection.module.css'

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

function useProgress(ref: React.RefObject<HTMLDivElement | null>): number {
  const [p, setP] = useState(0)
  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      setP(computeProgress(ref.current))
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
  }, [ref])
  return p
}

interface LockupMetrics {
  originX: number
  originY: number
  discLeft: number
  discTop: number
  discSize: number
}

/**
 * State of the load-time entrance, mirrored onto the hero stage as a data
 * attribute so the kinetic typography can run as pure CSS keyframes:
 *  wait — the controlled particle field is holding, type not yet placed
 *  run  — the choreography is playing
 *  done — settled; the entrance rig (masks, will-change) is dropped
 *  off  — skipped: reduced motion, or the page was loaded mid-journey
 */
type EntranceState = 'wait' | 'run' | 'done' | 'off'

/**
 * The complete Hero → Capabilities experience: one pinned container, one
 * persistent particle canvas, DOM kinetic typography layered above it.
 * Every state derives from scroll progress, so the journey is fully
 * reversible. The dark transition happens by zooming THROUGH the counter
 * of the "0" — its interior engulfs the viewport — never by a plain fade.
 */
export default function ExperienceSection() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const reducedMotion = useReducedMotion()
  const webgl = useMemo(() => detectWebGL(), [])
  const isMobile = useMemo(() => window.innerWidth < 768, [])
  const count = useMemo(() => {
    if (isMobile) return 3500
    const cores = navigator.hardwareConcurrency ?? 8
    return cores <= 4 ? 9000 : 12000
  }, [isMobile])

  const lockupPosRef = useRef<HTMLDivElement | null>(null)
  const scaleRef = useRef<HTMLDivElement | null>(null)
  const glyphRef = useRef<HTMLSpanElement | null>(null)
  const zeroRef = useRef<HTMLSpanElement | null>(null)
  const [anchor, setAnchor] = useState<GlyphAnchor | null>(null)
  const [metrics, setMetrics] = useState<LockupMetrics | null>(null)
  const [fontsReady, setFontsReady] = useState(false)
  // Reduced motion never hides the composition, not even for the frame
  // before the effect runs — the settled hero is the first thing painted.
  const [entState, setEntState] = useState<EntranceState>(() =>
    reducedMotion ? 'off' : 'wait',
  )

  // Measure the DOM lockup at scale 1 (transform temporarily cleared) so
  // the particle glyph, zoom origin and dark disc all share one geometry.
  const measure = useCallback(() => {
    const wrap = scaleRef.current
    const glyphEl = glyphRef.current
    const zeroEl = zeroRef.current
    if (!wrap || !glyphEl || !zeroEl) return
    const pos = lockupPosRef.current
    const prev = wrap.style.transform
    // The cursor tilt lives on an ancestor, so it has to be neutralized
    // too — otherwise a resize taken mid-parallax skews the anchor.
    const prevPos = pos?.style.transform ?? ''
    if (pos) pos.style.transform = 'translate(-50%, -50%)'
    wrap.style.transform = 'none'
    const gr = glyphEl.getBoundingClientRect()
    const zr = zeroEl.getBoundingClientRect()
    const wr = wrap.getBoundingClientRect()
    wrap.style.transform = prev
    if (pos) pos.style.transform = prevPos
    const vw = Math.max(1, window.innerWidth)
    const vh = Math.max(1, window.innerHeight)
    const zeroCX = zr.left + zr.width / 2
    const zeroCY = zr.top + zr.height * 0.52
    setAnchor({
      zeroX: zeroCX / vw,
      zeroY: zeroCY / vh,
      rectX: gr.left / vw,
      rectY: gr.top / vh,
      rectW: gr.width / vw,
      rectH: gr.height / vh,
    })
    setMetrics({
      originX: zeroCX - wr.left,
      originY: zeroCY - wr.top,
      discLeft: zeroCX - wr.left,
      discTop: zeroCY - wr.top,
      discSize: zr.width * 0.56,
    })
  }, [])

  useLayoutEffect(() => {
    if (!webgl) return
    measure()
    let live = true
    let raf = 0
    const onResize = () => {
      if (!raf)
        raf = requestAnimationFrame(() => {
          raf = 0
          measure()
        })
    }
    window.addEventListener('resize', onResize)

    /* ── arm the entrance ──────────────────────────────────
       The particle field holds until the real typeface is measured, so
       the streams converge on the letterforms they will actually build.
       A reader who arrives mid-journey (restored scroll) — or who asked
       for reduced motion — gets the settled composition instead. */
    let started = false
    let doneTimer = 0
    const start = () => {
      if (!live || started) return
      if (reducedMotion || computeProgress(containerRef.current) > 0.015) {
        started = true
        cancelEntrance()
        setEntState('off')
        return
      }
      // A page opened in a background tab gets no frames: hold the field
      // and play the entrance when the reader actually arrives.
      if (document.visibilityState !== 'visible') return
      started = true
      beginEntrance()
      setEntState('run')
      doneTimer = window.setTimeout(() => {
        if (live) setEntState('done')
      }, ENT.settle * 1000)
    }
    const fallback = window.setTimeout(start, 420)
    document.addEventListener('visibilitychange', start)
    document.fonts?.ready.then(() => {
      if (!live) return
      setFontsReady(true)
      measure()
      start()
    })

    const detachPointer = reducedMotion || isMobile ? undefined : attachHeroPointer()

    return () => {
      live = false
      if (raf) cancelAnimationFrame(raf)
      window.clearTimeout(fallback)
      window.clearTimeout(doneTimer)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', start)
      detachPointer?.()
    }
  }, [webgl, measure, reducedMotion, isMobile])

  if (!webgl) return <StaticFallback />

  return (
    <div ref={containerRef} id="ppmd-hero" className={s.container} style={{ height: `${TOTAL_VH}vh` }}>
      {/* Anchor for the section navigation — lands on the first capability. */}
      <div id="ppmd-capabilities" className={s.capsAnchor} aria-hidden="true" />
      <div className={s.sticky}>
        <div className={s.canvasLayer} aria-hidden="true">
          <ExperienceCanvas
            containerRef={containerRef}
            reducedMotion={reducedMotion}
            isMobile={isMobile}
            count={count}
            anchor={anchor}
            fontsReady={fontsReady}
          />
        </div>
        <Overlay
          containerRef={containerRef}
          reducedMotion={reducedMotion}
          isMobile={isMobile}
          metrics={metrics}
          entState={entState}
          lockupPosRef={lockupPosRef}
          scaleRef={scaleRef}
          glyphRef={glyphRef}
          zeroRef={zeroRef}
        />
      </div>
    </div>
  )
}

interface OverlayProps {
  containerRef: React.RefObject<HTMLDivElement | null>
  reducedMotion: boolean
  isMobile: boolean
  metrics: LockupMetrics | null
  entState: EntranceState
  lockupPosRef: React.RefObject<HTMLDivElement | null>
  scaleRef: React.RefObject<HTMLDivElement | null>
  glyphRef: React.RefObject<HTMLSpanElement | null>
  zeroRef: React.RefObject<HTMLSpanElement | null>
}

/**
 * Restrained cursor parallax on the lockup, written straight to the DOM
 * from its own rAF so it never re-renders React. It fades out over the
 * first tenth of the journey: by the time the approved zoom opens, the
 * lockup carries nothing but its centring transform again.
 */
function useLockupParallax(
  containerRef: React.RefObject<HTMLDivElement | null>,
  posRef: React.RefObject<HTMLDivElement | null>,
  enabled: boolean,
) {
  useEffect(() => {
    const el = posRef.current
    if (!enabled || !el) return
    let raf = 0
    let x = 0
    let y = 0
    let idle = false
    const loop = () => {
      raf = requestAnimationFrame(loop)
      const w = 1 - smoothstep(0.015, 0.1, computeProgress(containerRef.current))
      if (w <= 0.001) {
        if (idle) return
        idle = true
        el.style.transform = 'translate(-50%, -50%)'
        return
      }
      idle = false
      x += (pointerTarget.x - x) * 0.06
      y += (pointerTarget.y - y) * 0.06
      el.style.transform =
        `translate(-50%, -50%) translate3d(${(-x * 11 * w).toFixed(2)}px, ${(-y * 8 * w).toFixed(2)}px, 0)` +
        ` rotateY(${(x * 2.4 * w).toFixed(3)}deg) rotateX(${(-y * 1.6 * w).toFixed(3)}deg)`
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      el.style.transform = ''
    }
  }, [containerRef, posRef, enabled])
}

function Overlay({
  containerRef,
  reducedMotion,
  isMobile,
  metrics,
  entState,
  lockupPosRef,
  scaleRef,
  glyphRef,
  zeroRef,
}: OverlayProps) {
  const p = useProgress(containerRef)
  const rm = reducedMotion
  useLockupParallax(containerRef, lockupPosRef, !rm && !isMobile)

  /* ── hero ── */
  const S = lockupScale(p, rm)
  const approach = approachDrive(p)
  const early = rm ? 0 : earlyDrive(p)
  const zoomT = smoothstep(EXP.zoom[0], EXP.zoom[1], p)
  const heroVisible = p < EXP.heroHide
  const discO = rm ? 0 : smoothstep(EXP.discIn[0], EXP.discIn[1], p)
  const dimO = rm ? darkWeight(p) : 0
  const cueO = 1 - smoothstep(EXP.cueOut[0], EXP.cueOut[1], p)
  // Identity exits upward with its own velocity — depth, not a fade.
  const idShift = rm ? 0 : approach * 6 + zoomT * 55
  const idO = 1 - smoothstep(0.2, 0.3, p)
  const glyphO = rm ? 1 - smoothstep(0.26, 0.33, p) : 1

  /* ── marker ── */
  const markerO = fadeWindow(p, EXP.marker[0], EXP.marker[1], EXP.marker[2], EXP.marker[3])

  /* ── statement ── */
  const l1 = smoothstep(EXP.stmtL1[0], EXP.stmtL1[1], p)
  const l2 = smoothstep(EXP.stmtL2[0], EXP.stmtL2[1], p)
  const stmtExit = smoothstep(EXP.stmtExit[0], EXP.stmtExit[1], p)
  const stmtVisible = l1 > 0.001 && stmtExit < 0.999
  // Each line rises through a fixed mask while scaling in from depth.
  const lineInnerStyle = (lx: number) =>
    rm
      ? { opacity: lx }
      : {
          opacity: Math.min(1, lx * 2.2),
          transform: `translateY(${(1 - lx) * 108}%) scale(${2.3 - 1.3 * lx})`,
        }

  /* ── capabilities ── */
  const f = capFocus(p)
  const introO = fadeWindow(p, EXP.introIn[0], EXP.introIn[1], EXP.introOut[0], EXP.introOut[1])
  const introT = smoothstep(EXP.introIn[0], EXP.introIn[1], p)
  const introExitT = smoothstep(EXP.introOut[0], EXP.introOut[1], p)
  const capsO =
    smoothstep(0.585, 0.63, p) * (1 - smoothstep(EXP.marker[2], EXP.marker[3], p))

  /* ── closing ── */
  const closeT = smoothstep(EXP.closingIn[0], EXP.closingIn[1], p)

  const side = [-1, 1, -1, 1]
  const alt = [1, -1, -1, 1]

  return (
    <div className={s.overlay}>
      {/* Reduced-motion dark handoff (replaces the zoom-through) */}
      {rm && <div className={s.dimmer} style={{ opacity: dimO }} aria-hidden="true" />}

      {/* ── Hero lockup ── */}
      <div
        className={s.heroStage}
        data-ent={entState}
        style={{ visibility: heroVisible ? undefined : 'hidden' }}
      >
        <div ref={lockupPosRef} className={s.lockupPos}>
          <div
            ref={scaleRef}
            className={s.lockupScale}
            style={{
              transform: `scale(${S})`,
              transformOrigin: metrics ? `${metrics.originX}px ${metrics.originY}px` : '62% 50%',
            }}
          >
            {/* the darkness inside the zero — the door we zoom through */}
            {metrics && (
              <span
                className={s.disc}
                aria-hidden="true"
                style={{
                  left: metrics.discLeft,
                  top: metrics.discTop,
                  width: metrics.discSize,
                  height: metrics.discSize,
                  opacity: discO,
                }}
              />
            )}
            <div className={s.tenRow} style={{ opacity: glyphO }}>
              <span ref={glyphRef} className={`${s.ten} ${s.entWipe}`}>
                1<span ref={zeroRef} className={s.zero}>0</span>
              </span>
              <span className={s.divider} aria-hidden="true" />
              {/* The years column separates from the "10" as it advances —
                  parallax inside the lockup, not a second animation. */}
              <div
                className={s.yearsCol}
                style={
                  rm
                    ? undefined
                    : { transform: `translate3d(${early * 22}px, ${-early * 17}px, 0)` }
                }
              >
                <span className={`${s.yearsRange} ${s.entWipe}`}>2016&mdash;2026</span>
                <h1 className={s.yearsWord}>
                  <span className={s.srOnly}>10 </span>
                  <span className={s.yearsMask}>
                    <span className={s.yearsInner}>YEARS</span>
                  </span>
                </h1>
              </div>
            </div>
          </div>
        </div>

        <div
          className={s.identity}
          style={{
            opacity: idO,
            transform: rm ? undefined : `translateY(${-idShift}vh) scale(${1 + zoomT * 0.4})`,
          }}
        >
          <p className={`${s.identityName} ${s.entWipe}`}>PPMD</p>
          <p className={`${s.identityDept} ${s.entWipe}`}>
            Project &amp; Processes Management Department
          </p>
        </div>

        <div className={s.scrollCue} style={{ opacity: cueO }}>
          <span className={s.scrollCueInner}>
            <span>Scroll to explore</span>
            <span className={s.scrollCueLine} aria-hidden="true" />
          </span>
        </div>
      </div>

      {/* ── Persistent identity marker ── */}
      <p
        className={s.marker}
        style={{ opacity: markerO, visibility: markerO <= 0.01 ? 'hidden' : undefined }}
      >
        PPMD &middot; 10 YEARS &middot; 2016&mdash;2026
      </p>

      {/* ── Statement — revealed inside the motion ── */}
      <div
        className={s.statement}
        style={{
          visibility: stmtVisible ? undefined : 'hidden',
          opacity: 1 - stmtExit,
          transform: rm ? undefined : `translateY(${-stmtExit * 16}vh) scale(${1 - stmtExit * 0.3})`,
        }}
      >
        <h2 className={s.stmtTitle}>
          <span className={s.stmtLine}>
            <span className={s.stmtLineInner} style={lineInnerStyle(l1)}>
              BUILT FOR WHAT
            </span>
          </span>
          <span className={s.stmtLine}>
            <span className={s.stmtLineInner} style={lineInnerStyle(l2)}>
              COMES NEXT.
            </span>
          </span>
        </h2>
        <p
          className={s.stmtLabel}
          style={{
            opacity: Math.min(1, l2 * 1.4),
            transform: rm ? undefined : `translateY(${(1 - l2) * 5}vh)`,
          }}
        >
          Project &amp; Processes Management Department
        </p>
      </div>

      {/* ── Capabilities intro ── */}
      <div
        className={s.capsIntro}
        style={{
          opacity: introO,
          visibility: introO <= 0.01 ? 'hidden' : undefined,
          transform: rm
            ? undefined
            : `translateY(${(1 - introT) * 14 - introExitT * 10}vh) scale(${0.72 + introT * 0.28 + introExitT * 0.55})`,
        }}
      >
        <p className={s.capsIntroLabel}>What PPMD Makes Possible</p>
        <h2 className={s.capsIntroStatement}>
          Behind every successful transformation is a system that turns complexity into
          coordinated action.
        </h2>
      </div>

      {/* ── Capabilities: spatial fly-through ── */}
      <div
        className={s.capsSpace}
        style={{ opacity: capsO, visibility: capsO <= 0.01 ? 'hidden' : undefined }}
      >
        {CAPABILITIES.map((cap, k) => {
          const d = k - f
          const ad = Math.abs(d)
          const focusW = Math.max(0, 1 - ad * 1.4)
          // Two distance bands, both continuous in `ad`: `near` ramps across
          // the adjacent capability, `far` carries on past it. Every depth
          // cue below is driven by them, so nothing steps and reverse scroll
          // retraces the same composition.
          const near = Math.min(1, ad)
          const far = Math.min(1, Math.max(0, ad - 1))
          let x: number
          let y: number
          let z: number
          let itemO: number
          if (d >= 0) {
            // Upcoming capabilities wait lower and well outside the active
            // text column, on a diagonal path through depth — visible,
            // anticipated, never behind the active copy. (Perspective
            // compresses offsets toward the origin, so the raw values are
            // larger than the on-screen distance.)
            z = -d * (isMobile ? 430 : 620)
            x = isMobile ? 0 : side[k] * (10 + d * 36)
            y = isMobile ? d * 34 : alt[k] * 2 + d * 40
            itemO = ad <= 1 ? 1 - 0.8 * ad : Math.max(0.06, 0.2 - 0.08 * (ad - 1))
          } else {
            // Passed capabilities climb up and aside as the viewer moves on.
            // They come toward the camera, so they have to fade out before
            // z approaches the 1200px perspective plane.
            z = ad * (isMobile ? 330 : 520)
            x = isMobile ? side[k] * ad * 26 : side[k] * (6 + 30 * ad)
            y = isMobile ? -ad * 22 : alt[k] * 2 - ad * 34
            itemO = Math.max(0, 1 - ad * 0.86)
          }
          // Focus, size and colour all recede with distance; the active
          // capability alone stays at scale 1, unblurred and fully saturated.
          let depthScale = 1 - 0.15 * Math.pow(near, 1.2) - 0.08 * far
          let blurPx = Math.min(10, 7.2 * Math.pow(near, 1.25) + 2.8 * far)
          let sat = 1 - 0.45 * near
          if (rm) {
            x = 0
            y = d * 26
            z = 0
            itemO = Math.max(0, 1 - ad * 0.62)
            depthScale = 1
            blurPx = 0
            sat = 1
          }
          return (
            <div
              key={cap.num}
              className={s.capItem}
              style={{
                opacity: itemO,
                visibility: itemO <= 0.01 ? 'hidden' : undefined,
                transform: `translate(-50%, -50%) translate3d(${x}vw, ${y}vh, ${z}px) scale(${depthScale.toFixed(3)})`,
                filter:
                  blurPx > 0.05
                    ? `blur(${blurPx.toFixed(2)}px) saturate(${sat.toFixed(3)})`
                    : undefined,
                zIndex: 20 - Math.round(ad * 4),
              }}
            >
              <span className={s.capGhost} aria-hidden="true" style={{ color: cap.accent }}>
                {cap.num}
              </span>
              <p className={s.capMeta} style={{ color: cap.accent }}>
                {cap.name}
              </p>
              <h3 className={s.capTitle}>{cap.headline}</h3>
              <div
                className={s.capReveal}
                style={
                  rm
                    ? { opacity: focusW }
                    : {
                        clipPath: `inset(0 0 ${(1 - focusW) * 102}% 0)`,
                        transform: `translateY(${(1 - focusW) * 26}px)`,
                        opacity: Math.min(1, focusW * 1.8),
                      }
                }
              >
                <p className={s.capSupport}>{cap.support}</p>
                <p className={s.capLine} style={{ color: cap.accent }}>
                  {cap.line}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Closing ── */}
      <div
        className={s.closing}
        style={{
          opacity: closeT,
          visibility: closeT <= 0.01 ? 'hidden' : undefined,
          transform: rm ? undefined : `translateY(${(1 - closeT) * 10}vh) scale(${0.78 + closeT * 0.22})`,
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

/** No-WebGL fallback: normal flow, every piece of content readable. */
function StaticFallback() {
  return (
    <div id="ppmd-hero" className={s.fallback}>
      <section className={`${s.fbSection} ${s.fbLight}`}>
        <p className={s.fbYears}>2016&mdash;2026</p>
        <h1 className={s.fbLockup}>10 YEARS</h1>
        <p className={s.fbName}>PPMD</p>
        <p className={s.fbDept}>Project &amp; Processes Management Department</p>
      </section>
      <section className={`${s.fbSection} ${s.fbDark}`}>
        <h2 className={s.stmtTitle}>
          <span className={s.stmtLine}>BUILT FOR WHAT</span>
          <span className={s.stmtLine}>COMES NEXT.</span>
        </h2>
        <p className={s.stmtLabel}>Project &amp; Processes Management Department</p>
      </section>
      <div id="ppmd-capabilities">
        <section className={`${s.fbSection} ${s.fbDark}`}>
          <p className={s.capsIntroLabel}>What PPMD Makes Possible</p>
          <h2 className={s.capsIntroStatement}>
            Behind every successful transformation is a system that turns complexity into
            coordinated action.
          </h2>
        </section>
        {CAPABILITIES.map((cap) => (
          <section key={cap.num} className={`${s.fbSection} ${s.fbDark} ${s.fbCap}`}>
            <p className={s.capMeta} style={{ color: cap.accent }}>
              {cap.name}
            </p>
            <h3 className={s.capTitle}>{cap.headline}</h3>
            <p className={s.capSupport}>{cap.support}</p>
            <p className={s.capLine} style={{ color: cap.accent }}>
              {cap.line}
            </p>
          </section>
        ))}
        <section className={`${s.fbSection} ${s.fbDark}`}>
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
        </section>
      </div>
    </div>
  )
}
