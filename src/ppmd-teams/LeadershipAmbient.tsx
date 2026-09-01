import { useEffect, useMemo, useRef } from 'react'
import s from './LeadershipAmbient.module.css'

/**
 * The ambient field behind a leadership chapter.
 *
 * The Senior Director and Department Head scenes are one portrait and a
 * short statement against an otherwise empty right-hand half of the
 * screen. This fills that half with structure rather than with content:
 * large surface contours, a few quiet points and the curved trajectories
 * between them, all seated on the same projected surface the People
 * section already uses. It is the same visual grammar the rest of the
 * site speaks, tuned several stops down.
 *
 * Everything here is decoration in the strict sense — `aria-hidden`, no
 * pointer target, nothing to read. The rules it obeys:
 *
 *   · it never outweighs the portrait or the statement beside it
 *   · it is structure, not scatter: every point belongs to a contour
 *   · both leaders get the same amount of it, mirrored, never a hierarchy
 *   · it stops moving entirely under prefers-reduced-motion
 */

const CAM_Z = 2.55
const FOCAL = 2.55

interface P3 {
  x: number
  y: number
  z: number
}

interface View {
  yaw: number
  pitch: number
  spread: number
}

function project(p: P3, v: View) {
  const cy = Math.cos(v.yaw)
  const sy = Math.sin(v.yaw)
  const cp = Math.cos(v.pitch)
  const sp = Math.sin(v.pitch)
  const x1 = p.x * cy + p.z * sy
  const z1 = -p.x * sy + p.z * cy
  const y2 = p.y * cp - z1 * sp
  const z2 = p.y * sp + z1 * cp
  const k = FOCAL / (CAM_Z - z2)
  return { x: 50 + x1 * k * v.spread, y: 50 - y2 * k * v.spread, depth: z2 }
}

/**
 * One tilted ring on a sphere, sampled over part of its circumference.
 * Radii above 1 push most of the ring outside the frame, which is the
 * point: what stays visible is a long, slow curve rather than a circle.
 */
function ring(radius: number, tilt: number, phase: number, from: number, to: number): P3[] {
  const pts: P3[] = []
  const SEG = 44
  const ct = Math.cos(tilt)
  const st = Math.sin(tilt)
  const cf = Math.cos(phase)
  const sf = Math.sin(phase)
  for (let i = 0; i <= SEG; i++) {
    const a = from + ((to - from) * i) / SEG
    const bx = Math.cos(a) * radius
    const by = Math.sin(a) * radius * ct
    const bz = Math.sin(a) * radius * st
    pts.push({ x: bx * cf - by * sf, y: bx * sf + by * cf, z: bz })
  }
  return pts
}

/** A point seated on the unit surface from its lateral coordinates. */
function seat(u: number, v: number): P3 {
  const k = Math.min(0.98, u * u + v * v)
  return { x: u, y: v, z: Math.sqrt(1 - k) * 0.72 }
}

interface Composition {
  arcs: P3[][]
  points: P3[]
  links: Array<[number, number, number]>
}

/**
 * Two compositions of equal weight. The Department Head's is the Senior
 * Director's turned through the vertical: same count of contours, points
 * and links, a different shape. Neither is the richer scene.
 */
function compose(variant: number): Composition {
  const m = variant === 0 ? 1 : -1
  const arcs: P3[][] = [
    ring(1.62, 0.42 * m, 0.22 * m, -1.15, 1.5),
    ring(1.28, -0.3 * m, 0.62 * m, -1.35, 1.1),
    ring(2.05, 0.62 * m, -0.18 * m, -0.9, 1.25),
    ring(1.05, 0.16 * m, -0.75 * m, -1.5, 0.85),
    ring(2.6, -0.5 * m, 0.4 * m, -0.7, 0.95),
    ring(0.86, 0.5 * m, 0.95 * m, -1.45, 1.35),
    ring(3.3, 0.28 * m, -0.5 * m, -0.62, 0.8),
  ]
  /* Points sit ON those contours' territory, in one loose diagonal
     drift — a structure being read, not a sky. */
  const lateral: Array<[number, number]> = [
    [-0.62, 0.5],
    [-0.18, 0.72],
    [0.3, 0.46],
    [-0.46, 0.06],
    [0.08, 0.16],
    [0.62, -0.04],
    [-0.7, -0.42],
    [-0.24, -0.5],
    [0.34, -0.62],
    [0.72, -0.44],
    [0.5, 0.68],
    [-0.02, -0.16],
    [0.86, 0.3],
    [-0.5, -0.72],
  ]
  const points = lateral.map(([u, v]) => seat(u * m, v))
  /* A chain, not a mesh: each link is a bowed trajectory between two
     neighbours, so the eye follows a path instead of reading a diagram. */
  const links: Array<[number, number, number]> = [
    [0, 1, 0.16],
    [1, 2, -0.14],
    [0, 3, -0.2],
    [3, 4, 0.13],
    [4, 5, -0.12],
    [3, 6, 0.18],
    [6, 7, -0.15],
    [7, 8, 0.12],
    [8, 9, -0.16],
    [4, 8, 0.2],
    [2, 10, 0.15],
    [10, 12, -0.13],
    [5, 12, 0.14],
    [11, 4, -0.18],
    [6, 13, 0.14],
    [13, 7, -0.12],
  ]
  return { arcs, points, links }
}

export function LeadershipAmbient({
  accent,
  variant,
  active,
  reducedMotion,
}: {
  accent: string
  /** 0 — Senior Director, 1 — Department Head. */
  variant: number
  /** 0..1 chapter presence, from the section's scroll progress. */
  active: number
  reducedMotion: boolean
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const arcRef = useRef<SVGGElement>(null)
  const linkRef = useRef<SVGGElement>(null)
  const dotRef = useRef<SVGGElement>(null)
  const activeRef = useRef(active)
  activeRef.current = active

  const comp = useMemo(() => compose(variant), [variant])

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return

    const pointer = { x: 0, y: 0 }
    const smooth = { x: 0, y: 0 }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      pointer.x = (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1
      pointer.y = (e.clientY / Math.max(1, window.innerHeight)) * 2 - 1
    }
    if (!reducedMotion) window.addEventListener('pointermove', onMove, { passive: true })

    /* The viewBox is stretched to the layer's box, so a circle would draw
       as an ellipse. Points compensate with an explicit rx/ry pair. */
    let aspect = 1
    const readAspect = () => {
      const r = wrap.getBoundingClientRect()
      aspect = r.height > 0 ? r.width / r.height : 1
    }
    readAspect()
    const ro = new ResizeObserver(readAspect)
    ro.observe(wrap)

    let raf = 0
    const t0 = performance.now()
    const frame = () => {
      raf = requestAnimationFrame(frame)
      const a = activeRef.current
      /* Offscreen chapters cost one early return per frame and nothing
         else — both leadership blocks stay mounted for the whole
         section. */
      if (a <= 0.02) return
      const time = reducedMotion ? 0 : (performance.now() - t0) / 1000

      const k = reducedMotion ? 1 : 0.03
      smooth.x += (pointer.x - smooth.x) * k
      smooth.y += (pointer.y - smooth.y) * k

      const dir = variant === 0 ? 1 : -1
      const view: View = {
        yaw: reducedMotion ? 0.1 * dir : Math.sin(time * 0.031) * 0.2 * dir + smooth.x * 0.045,
        pitch: reducedMotion ? 0.04 : Math.sin(time * 0.023) * 0.07 + smooth.y * 0.03,
        /* The field opens outward slightly as the chapter arrives. */
        spread: 30 + a * 3.4,
      }

      const arcG = arcRef.current
      if (arcG) {
        for (let i = 0; i < comp.arcs.length && i < arcG.children.length; i++) {
          let d = ''
          const pts = comp.arcs[i]
          for (let j = 0; j < pts.length; j++) {
            const q = project(pts[j], view)
            d += `${j === 0 ? 'M' : 'L'}${q.x.toFixed(2)} ${q.y.toFixed(2)}`
          }
          const el = arcG.children[i] as SVGPathElement
          el.setAttribute('d', d)
          el.setAttribute('opacity', (a * (0.15 - i * 0.012)).toFixed(3))
        }
      }

      const proj = comp.points.map((p) => project(p, view))

      const linkG = linkRef.current
      if (linkG) {
        for (let i = 0; i < comp.links.length && i < linkG.children.length; i++) {
          const [ai, bi, bow] = comp.links[i]
          const pa = proj[ai]
          const pb = proj[bi]
          const dx = pb.x - pa.x
          const dy = pb.y - pa.y
          const cx = (pa.x + pb.x) / 2 - dy * bow
          const cy = (pa.y + pb.y) / 2 + dx * bow
          const el = linkG.children[i] as SVGPathElement
          el.setAttribute(
            'd',
            `M${pa.x.toFixed(2)} ${pa.y.toFixed(2)}Q${cx.toFixed(2)} ${cy.toFixed(2)} ${pb.x.toFixed(2)} ${pb.y.toFixed(2)}`,
          )
          const near = (pa.depth + pb.depth) * 0.5
          el.setAttribute('opacity', (a * (0.06 + near * 0.1)).toFixed(3))
        }
      }

      const dotG = dotRef.current
      if (dotG) {
        for (let i = 0; i < proj.length && i < dotG.children.length; i++) {
          const q = proj[i]
          const el = dotG.children[i] as SVGEllipseElement
          const r = 0.24 + q.depth * 0.26
          el.setAttribute('cx', q.x.toFixed(2))
          el.setAttribute('cy', q.y.toFixed(2))
          /* The layer is wider than tall, so a user unit is worth more
             pixels across than down: the x radius shrinks by the aspect
             to keep the point circular on screen. */
          el.setAttribute('rx', (r / aspect).toFixed(3))
          el.setAttribute('ry', r.toFixed(3))
          el.setAttribute('opacity', (a * (0.18 + q.depth * 0.34)).toFixed(3))
        }
      }
    }
    raf = requestAnimationFrame(frame)
    return () => {
      ro.disconnect()
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
    }
  }, [comp, variant, reducedMotion])

  return (
    <div
      ref={wrapRef}
      className={variant === 0 ? s.ambient : `${s.ambient} ${s.ambientAlt}`}
      aria-hidden="true"
    >
      <span
        className={s.depth}
        style={{
          opacity: Math.min(1, active),
          background:
            `radial-gradient(46% 52% at 68% 44%, ${accent}14, transparent 70%),` +
            ` radial-gradient(70% 70% at 76% 62%, rgba(245,239,228,0.028), transparent 76%)`,
        }}
      />
      <svg className={s.field} viewBox="0 0 100 100" preserveAspectRatio="none">
        <g ref={arcRef} stroke={accent} strokeWidth="1" fill="none">
          {comp.arcs.map((_, i) => (
            <path key={i} vectorEffect="non-scaling-stroke" />
          ))}
        </g>
        <g ref={linkRef} stroke={accent} strokeWidth="0.9" fill="none" strokeLinecap="round">
          {comp.links.map((_, i) => (
            <path key={i} vectorEffect="non-scaling-stroke" />
          ))}
        </g>
        <g ref={dotRef} fill={accent}>
          {comp.points.map((_, i) => (
            <ellipse key={i} />
          ))}
        </g>
      </svg>
    </div>
  )
}
