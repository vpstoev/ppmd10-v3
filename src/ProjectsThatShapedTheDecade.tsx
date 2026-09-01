import { useEffect, useMemo, useRef, useState } from 'react'
import { ProjectsVisual } from './ppmd-projects/ProjectsVisual'
import { ProjectShape } from './ppmd-projects/ProjectShape'
import {
  CLOSING_LINE1_IN,
  CLOSING_LINE2_IN,
  PROJECTS,
  PROJECTS_VH,
  TITLE_OUT,
} from './ppmd-projects/projectsData'
import type { Project } from './ppmd-projects/projectTypes'
import { computeProgress, fadeWindow, smoothstep } from './hg-hero/heroTheme'
import s from './ProjectsThatShapedTheDecade.module.css'

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
 * "Projects that Shaped the Decade" — the timeline's temporal path widens
 * into a field of constellations; each project is a different
 * transformation of the same particle field, one dominating at a time.
 */
export default function ProjectsThatShapedTheDecade() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const reducedMotion = useReducedMotion()
  const webgl = useMemo(() => detectWebGL(), [])
  const isMobile = useMemo(() => window.innerWidth < 768, [])

  if (!webgl) return <StaticFallback />

  return (
    <section
      ref={containerRef}
      className={s.container}
      style={{ height: `${PROJECTS_VH}vh` }}
      aria-label="Projects that shaped the decade"
    >
      <div className={s.sticky}>
        <div className={s.canvasLayer} aria-hidden="true">
          <ProjectsVisual
            containerRef={containerRef}
            reducedMotion={reducedMotion}
            isMobile={isMobile}
          />
        </div>
        <TextLayer containerRef={containerRef} reducedMotion={reducedMotion} />
      </div>
    </section>
  )
}

function revealStyle(kind: Project['reveal'], enter: number): React.CSSProperties {
  if (kind === 'clip') {
    return { clipPath: `inset(0 ${(1 - enter) * 100}% 0 0)`, opacity: Math.min(1, enter * 1.4) }
  }
  if (kind === 'depth') {
    return {
      transform: `scale(${0.96 + 0.04 * enter}) translateY(${(1 - enter) * 18}px)`,
      opacity: enter,
    }
  }
  return {}
}

function TextLayer({
  containerRef,
  reducedMotion,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>
  reducedMotion: boolean
}) {
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
      {/* Section introduction */}
      <div
        className={s.title}
        style={{
          opacity: titleO,
          transform: `translateY(${-26 * (1 - titleO)}px)`,
          visibility: titleO <= 0.01 ? 'hidden' : undefined,
        }}
      >
        <h2 className={s.titleMain}>
          <span className={s.titleLine}>PROJECTS THAT</span>
          <span className={s.titleLine}>SHAPED THE DECADE</span>
        </h2>
        <p className={s.titleSupport}>
          A selection of the work, change and transformation delivered along the way.
        </p>
      </div>

      {/* Project scenes — one at a time */}
      {PROJECTS.map((proj) => {
        const w = fadeWindow(p, proj.window[0], proj.window[1], proj.window[2], proj.window[3])
        const enter = Math.min(1, w * 1.5)
        const visible = w > 0.02
        return (
          <div
            key={proj.id}
            className={proj.side === 'left' ? s.projBlock : `${s.projBlock} ${s.projRight}`}
            style={{ visibility: visible ? undefined : 'hidden' }}
          >
            {/* The scene's own abstract figure, behind everything. */}
            <ProjectShape
              placement={proj.shape}
              accent={proj.accent}
              presence={enter}
              flip={proj.side === 'right'}
              reducedMotion={reducedMotion}
            />
            <span
              className={
                proj.accent.iridescent ? `${s.bigNum} ${s.bigNumIridescent}` : s.bigNum
              }
              aria-hidden="true"
              style={{
                opacity: enter,
                transform: `scale(${1.12 - 0.12 * enter}) translateY(${(1 - enter) * 26}px)`,
                ...(proj.accent.iridescent ? {} : { color: `${proj.accent.dominant}29` }),
              }}
            >
              {proj.bigNum}
            </span>
            <div className={s.content} style={{ ['--project-accent' as string]: proj.accent.dominant }}>
              <div
                className={proj.reveal === 'mask' ? s.maskWrap : undefined}
                style={proj.reveal === 'mask' ? { opacity: Math.min(1, w * 2) } : undefined}
              >
                <div
                  className={s.contentInner}
                  style={
                    proj.reveal === 'mask'
                      ? { transform: `translateY(${(1 - enter) * 105}%)` }
                      : revealStyle(proj.reveal, enter)
                  }
                >
                  {proj.category && (
                    <p className={s.meta} style={{ color: proj.accent.dominant }}>
                      {proj.category}
                    </p>
                  )}
                  <h3 className={s.projName}>{proj.name}</h3>
                  {/* Optional because the importer omits only empty or
                      confirmed template-filler cells. */}
                  {proj.description && <p className={s.description}>{proj.description}</p>}
                  {proj.impact && (
                    <p className={s.impact} style={{ color: proj.accent.dominant }}>
                      {proj.impact}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}

      {/* Closing — toward the future People & Teams section */}
      <div className={s.closing} style={{ visibility: close1 <= 0.01 ? 'hidden' : undefined }}>
        <h2
          className={s.closingMain}
          style={{ opacity: close1, transform: `translateY(${(1 - close1) * 26}px)` }}
        >
          THE WORK IS COMPLEX.
        </h2>
        <p
          className={s.closingNext}
          style={{ opacity: close2, transform: `translateY(${(1 - close2) * 16}px)` }}
        >
          The people behind it make it possible.
        </p>
      </div>
    </div>
  )
}

/** No-WebGL fallback: every project in normal flow, fully readable. */
function StaticFallback() {
  return (
    <section className={s.fallback} aria-label="Projects that shaped the decade">
      <div className={`${s.fbBlock} ${s.fbTitle}`}>
        <h2 className={s.titleMain}>
          <span className={s.titleLine}>PROJECTS THAT</span>
          <span className={s.titleLine}>SHAPED THE DECADE</span>
        </h2>
        <p className={s.titleSupport}>
          A selection of the work, change and transformation delivered along the way.
        </p>
      </div>
      {PROJECTS.map((proj) => (
        <div key={proj.id} className={s.fbBlock}>
          {proj.category && (
            <p className={s.meta} style={{ color: proj.accent.dominant }}>
              {proj.category}
            </p>
          )}
          <h3 className={s.projName}>{proj.name}</h3>
          {proj.description && <p className={s.description}>{proj.description}</p>}
          {proj.impact && (
            <p className={s.impact} style={{ color: proj.accent.dominant }}>
              {proj.impact}
            </p>
          )}
        </div>
      ))}
      <div className={`${s.fbBlock} ${s.fbClosing}`}>
        <h2 className={s.closingMain}>THE WORK IS COMPLEX.</h2>
        <p className={s.closingNext}>The people behind it make it possible.</p>
      </div>
    </section>
  )
}
