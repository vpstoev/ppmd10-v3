import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { clamp01, computeProgress, lerp, smoothstep } from '../hg-hero/heroTheme'
import {
  DARK_BG,
  HERO_ARCS,
  HERO_FLOW_LIGHT,
  LIGHT_BG,
  STREAM_DARK,
  STREAM_LIGHT,
  blendCapMotion,
  capFocus,
  darkWeight,
  earlyDrive,
  lockupScale,
  stageWeights,
} from './experienceData'
import { ENT, ENT_GATES, entranceMode, entranceTime, pointerTarget } from './entranceData'

const TAU = Math.PI * 2
const CAM_Z = 8
const VIS_H = 2 * CAM_Z * Math.tan((50 * Math.PI) / 360) // world height at z=0
/** How far a rim particle sits off the ink of the letterform (world units). */
const RIM = 0.055

/** Role of a particle while the hero owns the frame. */
const KIND_SHELL = 0 /* the body of the number */
const KIND_TRACE = 1 /* travels along a contour of the letterforms */
const KIND_WELL = 2 /* orbits inside the counter of the "0" */
const KIND_STREAM = 3 /* weaves through and around the number */

/**
 * Particles are allocated in runs of this length. A run shares one flow,
 * one path parameter and one wobble phase, so offsetting each member
 * backwards along the SAME trajectory turns the run into a motion streak
 * that always points along the direction of travel — no history buffer.
 */
const TRAIL_LEN = 4

/**
 * Depth strata, drawn as three passes over one shared position buffer.
 * Foreground reads large and diffuse, midground carries the legible
 * detail, background stays small and dense. `bgMix` fades a stratum
 * toward the page colour so distance reads as atmosphere, not just size.
 */
const STRATA = [
  { sizeK: 0.72, soft: 0.2, opacity: 0.9, bgMix: 0.22, z: -1.55, par: 0.3 },
  { sizeK: 1.06, soft: 0.42, opacity: 1, bgMix: 0, z: -0.05, par: 0.72 },
  { sizeK: 1.95, soft: 0.86, opacity: 0.52, bgMix: 0.1, z: 1.35, par: 1.4 },
]
/** Fractions of the buffer given to background / midground strata. */
const STRATA_SPLIT = [0.34, 0.78]

/** Screen-space anchor of the DOM lockup, measured at scale 1. */
export interface GlyphAnchor {
  /** zero counter centre as viewport fractions */
  zeroX: number
  zeroY: number
  /** "10" glyph box as viewport fractions */
  rectX: number
  rectY: number
  rectW: number
  rectH: number
}

interface ExperienceCanvasProps {
  containerRef: React.RefObject<HTMLDivElement | null>
  reducedMotion: boolean
  isMobile: boolean
  count: number
  anchor: GlyphAnchor | null
  fontsReady: boolean
}

/**
 * Point sprite. `soft` 0 keeps a tight, crisp core (background detail);
 * `soft` 1 spreads the falloff across the whole quad, which is what gives
 * the foreground stratum its out-of-focus bloom without a blur pass.
 */
function makeSpriteTexture(soft = 0.5): THREE.Texture {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (ctx) {
    // Calibrated so soft = 0.42 reproduces the approved profile exactly
    // (0.5 → 0.95, 0.75 → 0.3); values either side sharpen or bloom it.
    const core = 0.62 - 0.28 * soft
    const mid = 0.87 - 0.29 * soft
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    g.addColorStop(0, 'rgba(255,255,255,1)')
    g.addColorStop(core, `rgba(255,255,255,${(0.99 - 0.1 * soft).toFixed(3)})`)
    g.addColorStop(mid, `rgba(255,255,255,${(0.34 - 0.1 * soft).toFixed(3)})`)
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, size, size)
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

function gauss(): number {
  let u = 0
  let v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

type Pt = [number, number]

interface GlyphContours {
  /** ordered loop around the outside of the "0" */
  outer: Pt[]
  /** ordered loop around its counter */
  inner: Pt[]
  /** ordered top→bottom down each side of the "1" */
  barL: Pt[]
  barR: Pt[]
  /** counter centre and radii, in the same normalized glyph-box space */
  wellX: number
  wellY: number
  wellRX: number
  wellRY: number
}

/**
 * Turns the raster edge samples into ORDERED contours. The rings of the
 * "0" are star-shaped about its centre, so binning by angle and keeping
 * the nearest/furthest sample per bin separates the counter from the
 * outside and yields two loops that can be walked continuously. The stem
 * of the "1" is binned by height instead, giving a left and a right edge.
 */
function buildContours(edges: Pt[]): GlyphContours | null {
  if (edges.length < 300) return null

  // The narrowest column between the "1" and the "0" splits the two glyphs.
  const BINS = 96
  const hist = new Int32Array(BINS)
  for (const [x] of edges) hist[Math.min(BINS - 1, Math.max(0, (x * BINS) | 0))]++
  let split = 0.32
  let fewest = Infinity
  for (let b = Math.round(BINS * 0.14); b < Math.round(BINS * 0.52); b++) {
    if (hist[b] < fewest) {
      fewest = hist[b]
      split = (b + 0.5) / BINS
    }
  }

  const ring: Pt[] = []
  const stem: Pt[] = []
  for (const e of edges) (e[0] >= split ? ring : stem).push(e)
  if (ring.length < 200) return null

  let cx = 0
  let cy = 0
  for (const [x, y] of ring) {
    cx += x
    cy += y
  }
  cx /= ring.length
  cy /= ring.length

  const A = 240
  const far = new Float32Array(A).fill(-1)
  const near = new Float32Array(A).fill(Infinity)
  const farP: Array<Pt | undefined> = new Array(A)
  const nearP: Array<Pt | undefined> = new Array(A)
  for (const pt of ring) {
    const dx = pt[0] - cx
    const dy = pt[1] - cy
    const r = Math.hypot(dx, dy)
    let a = Math.atan2(dy, dx) / TAU
    if (a < 0) a += 1
    const b = Math.min(A - 1, (a * A) | 0)
    if (r > far[b]) {
      far[b] = r
      farP[b] = pt
    }
    if (r < near[b]) {
      near[b] = r
      nearP[b] = pt
    }
  }
  const outer: Pt[] = []
  const inner: Pt[] = []
  let wellRX = 0
  let wellRY = 0
  for (let b = 0; b < A; b++) {
    const f = farP[b]
    if (f) outer.push(f)
    const n = nearP[b]
    // Only a genuine second crossing counts as the counter contour.
    if (n && near[b] < far[b] * 0.82) {
      inner.push(n)
      wellRX = Math.max(wellRX, Math.abs(n[0] - cx))
      wellRY = Math.max(wellRY, Math.abs(n[1] - cy))
    }
  }
  if (outer.length < 40 || inner.length < 40) return null

  const B = 160
  const lo = new Float32Array(B).fill(Infinity)
  const hi = new Float32Array(B).fill(-Infinity)
  const loP: Array<Pt | undefined> = new Array(B)
  const hiP: Array<Pt | undefined> = new Array(B)
  for (const pt of stem) {
    const b = Math.min(B - 1, Math.max(0, (pt[1] * B) | 0))
    if (pt[0] < lo[b]) {
      lo[b] = pt[0]
      loP[b] = pt
    }
    if (pt[0] > hi[b]) {
      hi[b] = pt[0]
      hiP[b] = pt
    }
  }
  const barL: Pt[] = []
  const barR: Pt[] = []
  for (let b = 0; b < B; b++) {
    const l = loP[b]
    if (l) barL.push(l)
    const r = hiP[b]
    if (r) barR.push(r)
  }
  if (barL.length < 12 || barR.length < 12) return null

  return { outer, inner, barL, barR, wellX: cx, wellY: cy, wellRX, wellRY }
}

/**
 * Samples the "10" glyph outline/fill on an offscreen canvas. Returns
 * points normalized to the glyph bounding box (0..1), edge-weighted so
 * particles trace the strokes of the number, plus ordered contours the
 * tracer particles can walk.
 */
function sampleGlyph(): {
  pts: Pt[]
  edges: Pt[]
  contours: GlyphContours | null
} {
  const pts: Pt[] = []
  const edges: Pt[] = []
  const cw = 720
  const ch = 400
  try {
    const canvas = document.createElement('canvas')
    canvas.width = cw
    canvas.height = ch
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return { pts, edges, contours: null }
    ctx.clearRect(0, 0, cw, ch)
    ctx.fillStyle = '#fff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    try {
      ;(ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '-14px'
    } catch {
      /* optional */
    }
    ctx.font = '800 300px "Geist Variable", "Segoe UI", Arial, sans-serif'
    ctx.fillText('10', cw / 2, ch / 2)
    const data = ctx.getImageData(0, 0, cw, ch).data
    const alphaAt = (x: number, y: number) =>
      x < 0 || y < 0 || x >= cw || y >= ch ? 0 : data[(y * cw + x) * 4 + 3]
    let minX = Infinity
    let maxX = -Infinity
    let minY = Infinity
    let maxY = -Infinity
    const raw: Array<[number, number, boolean]> = []
    for (let y = 0; y < ch; y += 2) {
      for (let x = 0; x < cw; x += 2) {
        if (alphaAt(x, y) > 140) {
          const e = 4
          const isEdge =
            alphaAt(x + e, y) <= 140 ||
            alphaAt(x - e, y) <= 140 ||
            alphaAt(x, y + e) <= 140 ||
            alphaAt(x, y - e) <= 140
          raw.push([x, y, isEdge])
          if (x < minX) minX = x
          if (x > maxX) maxX = x
          if (y < minY) minY = y
          if (y > maxY) maxY = y
        }
      }
    }
    const bw = Math.max(1, maxX - minX)
    const bh = Math.max(1, maxY - minY)
    for (const [x, y, isEdge] of raw) {
      const nx = (x - minX) / bw
      const ny = (y - minY) / bh
      pts.push([nx, ny])
      if (isEdge) edges.push([nx, ny])
    }
  } catch {
    /* fallthrough — caller has a procedural fallback */
  }
  return { pts, edges, contours: buildContours(edges) }
}

function Particles({
  containerRef,
  reducedMotion,
  isMobile,
  count,
  anchor,
  fontsReady,
}: ExperienceCanvasProps) {
  const invalidate = useThree((s) => s.invalidate)
  const size = useThree((s) => s.size)
  const lastDark = useRef(-1)
  const lastHero = useRef(-1)
  /** Continuously accumulated idle phases + smoothed pointer parallax. */
  const motion = useRef({ stream: 0, trace: 0, well: 0, parX: 0, parY: 0 })
  /** Once the reader scrolls, the entrance is over for good. */
  const entDone = useRef(false)

  const aspect = size.width / Math.max(1, size.height)
  const visW = VIS_H * aspect

  // Stable per-particle randoms.
  const rand = useMemo(() => {
    const ph = new Float32Array(count) // generic phase 0..1
    const ph2 = new Float32Array(count)
    const g1 = new Float32Array(count)
    const g2 = new Float32Array(count)
    const u = new Float32Array(count) // parameter along paths
    for (let i = 0; i < count; i++) {
      ph[i] = Math.random()
      ph2[i] = Math.random()
      g1[i] = gauss()
      g2[i] = gauss()
      u[i] = Math.random()
    }
    return { ph, ph2, g1, g2, u }
  }, [count])

  /** Stratum boundaries, snapped to whole runs so no streak is split. */
  const strata = useMemo(() => {
    const snap = (frac: number) =>
      Math.min(count, Math.max(TRAIL_LEN, Math.round((count * frac) / TRAIL_LEN) * TRAIL_LEN))
    return [0, snap(STRATA_SPLIT[0]), snap(STRATA_SPLIT[1]), count]
  }, [count])

  /**
   * What each particle does while the hero owns the frame — decided per
   * RUN, not per particle, so a run stays one coherent object. The flow
   * carries the majority now: the number is rimmed and traced rather than
   * packed solid, which is what lets the currents read as structure.
   */
  const roles = useMemo(() => {
    const kind = new Uint8Array(count)
    const detach = new Float32Array(count)
    const echo = new Float32Array(count) /* 0 = head of the streak … 1 = tail */
    const flow = new Uint8Array(count) /* which of the four currents */
    const hu = new Float32Array(count) /* shared path parameter */
    const hph = new Float32Array(count)
    const hph2 = new Float32Array(count)
    const layer = new Uint8Array(count)
    const runs = Math.ceil(count / TRAIL_LEN)
    for (let g = 0; g < runs; g++) {
      const r = Math.random()
      const head = g * TRAIL_LEN
      // Only part of the flow actually streaks; the rest stay discrete so
      // the field keeps grain instead of turning into a comb of dashes.
      const streaks = r > 0.28 && r < 0.66
      for (let sub = 0; sub < TRAIL_LEN; sub++) {
        const i = head + sub
        if (i >= count) break
        // The DOM sets the "10" in solid ink, so particles parked on the
        // glyph body are largely hidden behind it — the budget goes to the
        // roles that actually read: the currents, the contour walkers just
        // off the ink, and the depth held inside the counter.
        kind[i] = r > 0.9 ? KIND_TRACE : r > 0.8 ? KIND_WELL : r > 0.28 ? KIND_STREAM : KIND_SHELL
        flow[i] = g & 3
        echo[i] = streaks ? sub / (TRAIL_LEN - 1) : 0
        // A streaking run shares the head's parameters; everything else
        // keeps its own so the non-streaking field stays evenly seeded.
        hu[i] = streaks ? rand.u[head] : rand.u[i]
        hph[i] = streaks ? rand.ph[head] : rand.ph[i]
        hph2[i] = streaks ? rand.ph2[head] : rand.ph2[i]
        layer[i] = i < strata[1] ? 0 : i < strata[2] ? 1 : 2
        detach[i] =
          kind[i] === KIND_STREAM && r > 0.58
            ? 1
            : kind[i] === KIND_SHELL && rand.ph2[i] > 0.88
              ? 0.7
              : 0
      }
    }
    return { kind, detach, echo, flow, hu, hph, hph2, layer }
  }, [count, rand, strata])

  // Glyph-shaped targets in world space at scale 1, aligned to the DOM
  // lockup through the measured anchor. ~62% of particles trace edges.
  const glyph = useMemo(() => {
    void fontsReady // re-sample once the real typeface is available
    const world = new Float32Array(count * 3)
    const gnx = new Float32Array(count) // 0..1 across the glyph — draw order
    const onEdge = new Uint8Array(count)
    const sampled = sampleGlyph()
    const ax = anchor ?? { zeroX: 0.62, zeroY: 0.47, rectX: 0.12, rectY: 0.18, rectW: 0.5, rectH: 0.58 }
    const toWorldX = (fx: number) => (fx - 0.5) * visW
    const toWorldY = (fy: number) => (0.5 - fy) * VIS_H
    const gx = (nx: number) => toWorldX(ax.rectX + nx * ax.rectW)
    const gy = (ny: number) => toWorldY(ax.rectY + ny * ax.rectH)
    const jitter = 0.012 * visW * ax.rectW
    const havePts = sampled.pts.length > 200
    // The DOM type is solid ink, so glyph particles sit on a slightly
    // EXPANDED contour — they rim and trace the strokes instead of
    // disappearing underneath the letterforms.
    const expand = 1.035
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      let nx: number
      let ny: number
      if (havePts) {
        // Weighted harder toward the outline than before: with the flow
        // carrying the mass, the number wants to read as a lit contour
        // embedded in the system, not as a slab of dots.
        const useEdge = sampled.edges.length > 60 && i % 20 < 16
        const pool = useEdge ? sampled.edges : sampled.pts
        onEdge[i] = useEdge ? 1 : 0
        // Contiguous colour bands along the glyph via stream-index striding.
        const s = i % 4
        const idx = Math.min(pool.length - 1, (((s + rand.ph[i]) * pool.length) / 4) | 0)
        nx = 0.5 + (pool[idx][0] - 0.5) * expand
        ny = 0.5 + (pool[idx][1] - 0.5) * expand
      } else {
        // Procedural backup: bar + annulus.
        onEdge[i] = 1
        if (i % 3 === 0) {
          nx = 0.12
          ny = rand.ph[i]
        } else {
          const a = rand.ph[i] * TAU
          nx = 0.66 + Math.cos(a) * 0.3
          ny = 0.5 + Math.sin(a) * 0.48
        }
      }
      gnx[i] = clamp01(nx)
      world[i3] = gx(nx) + (rand.g1[i] % 1) * jitter
      world[i3 + 1] = gy(ny) + (rand.g2[i] % 1) * jitter
      world[i3 + 2] = rand.g2[i] * 0.35
    }

    // Ordered contours, pushed just clear of the ink so the tracers read.
    const c = sampled.contours
    let paths: Float32Array[] | null = null
    let well: { x: number; y: number; rx: number; ry: number } | null = null
    if (c) {
      const wcx = gx(c.wellX)
      const wcy = gy(c.wellY)
      const radial = (src: Pt[], sign: number) => {
        const out = new Float32Array(src.length * 2)
        for (let k = 0; k < src.length; k++) {
          const wx = gx(src[k][0])
          const wy = gy(src[k][1])
          const dx = wx - wcx
          const dy = wy - wcy
          const m = Math.hypot(dx, dy) || 1
          out[k * 2] = wx + (dx / m) * RIM * sign
          out[k * 2 + 1] = wy + (dy / m) * RIM * sign
        }
        return out
      }
      const lateral = (src: Pt[], sign: number) => {
        const out = new Float32Array(src.length * 2)
        for (let k = 0; k < src.length; k++) {
          out[k * 2] = gx(src[k][0]) + RIM * sign
          out[k * 2 + 1] = gy(src[k][1])
        }
        return out
      }
      paths = [radial(c.outer, 1), radial(c.inner, -1), lateral(c.barL, -1), lateral(c.barR, 1)]
      well = {
        x: wcx,
        y: wcy,
        rx: Math.abs(gx(c.wellX + c.wellRX) - wcx) * 0.84,
        ry: Math.abs(gy(c.wellY + c.wellRY) - wcy) * 0.84,
      }
    }

    const zeroW: [number, number] = [toWorldX(ax.zeroX), toWorldY(ax.zeroY)]
    return { world, gnx, onEdge, paths, well, zeroW }
  }, [count, anchor, visW, rand, fontsReady])

  const colors = useMemo(() => {
    const streamsDark = STREAM_DARK.map(hexToRgb)
    const streamsLight = STREAM_LIGHT.map(hexToRgb)
    const heroFlow = HERO_FLOW_LIGHT.map(hexToRgb)
    const page = hexToRgb(LIGHT_BG)
    const hiDark = hexToRgb('#fff1e0')
    const hiLight = hexToRgb('#2c2c34')
    const light = new Float32Array(count * 3)
    const dark = new Float32Array(count * 3)
    /* Hero colouring: hue from the FLOW, intensity from the stratum. */
    const hero = new Float32Array(count * 3)
    const { flow, layer } = roles
    for (let i = 0; i < count; i++) {
      const isHi = rand.ph2[i] < 0.16
      const s = i % 4
      const lc = isHi ? hiLight : streamsLight[s]
      const dc = isHi ? hiDark : streamsDark[s]
      const b = 0.85 + rand.ph[i] * 0.25
      const i3 = i * 3
      for (let c = 0; c < 3; c++) {
        light[i3 + c] = Math.min(1, lc[c] * b)
        dark[i3 + c] = Math.min(1, dc[c] * b)
      }
      // Depth is expressed by receding toward the page, so a distant
      // particle reads as atmosphere rather than as a darker dot.
      const hc = heroFlow[flow[i]]
      const mix = STRATA[layer[i]].bgMix
      const hb = 0.9 + rand.ph[i] * 0.18
      for (let c = 0; c < 3; c++) {
        hero[i3 + c] = Math.min(1, hc[c] * hb) * (1 - mix) + page[c] * mix
      }
    }
    return { light, dark, hero }
  }, [count, rand, roles])

  const buffers = useMemo(() => {
    // The opening frame: a CONTROLLED field, stratified across the whole
    // viewport in depth. The entrance draws this field inward, so the
    // seeded positions double as the origin of every particle's flight.
    const field = new Float32Array(count * 3)
    let cols = Math.max(2, Math.round(Math.sqrt(count * Math.max(0.4, aspect))))
    if (cols % 4 === 0) cols += 1 // avoid colour banding into columns
    const rows = Math.max(2, Math.ceil(count / cols))
    // Grid cells are handed out through a shuffle: index order now also
    // selects the depth stratum, and without this every stratum would
    // occupy its own horizontal band of the opening frame.
    const order = new Uint32Array(count)
    for (let i = 0; i < count; i++) order[i] = i
    for (let i = count - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0
      const tmp = order[i]
      order[i] = order[j]
      order[j] = tmp
    }
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const cell = order[i]
      const c = cell % cols
      const r = (cell / cols) | 0
      field[i3] = ((c + 0.5 + (rand.ph[i] - 0.5) * 0.92) / cols - 0.5) * visW * 1.18
      field[i3 + 1] = ((r + 0.5 + (rand.ph2[i] - 0.5) * 0.92) / rows - 0.5) * VIS_H * 1.18
      field[i3 + 2] = rand.g1[i] * 1.3 - 0.5
    }
    return { cur: Float32Array.from(field), field, curColor: Float32Array.from(colors.light) }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seeded once per count; the field is the load-time frame
  }, [count])

  /**
   * One position/colour buffer, three draw passes. The stratum geometries
   * share the very same BufferAttribute objects — so the per-frame upload
   * still happens once — and differ only in their draw range.
   */
  const layers = useMemo(() => {
    const position = new THREE.BufferAttribute(buffers.cur, 3).setUsage(THREE.DynamicDrawUsage)
    const color = new THREE.BufferAttribute(buffers.curColor, 3).setUsage(THREE.DynamicDrawUsage)
    const geometries = STRATA.map((_, li) => {
      const g = new THREE.BufferGeometry()
      g.setAttribute('position', position)
      g.setAttribute('color', color)
      g.setDrawRange(strata[li], Math.max(0, strata[li + 1] - strata[li]))
      return g
    })
    return { position, color, geometries }
  }, [buffers, strata])

  const sprites = useMemo(() => STRATA.map((s) => makeSpriteTexture(s.soft)), [])
  const matRefs = useRef<Array<THREE.PointsMaterial | null>>([null, null, null])
  const bgLight = useMemo(() => new THREE.Color(LIGHT_BG), [])
  const bgDark = useMemo(() => new THREE.Color(DARK_BG), [])
  /** Scratch for the four resolved hero curves: p0, c1, c2, p3 per flow. */
  const curves = useMemo(() => HERO_ARCS.map(() => new Float32Array(8)), [])

  useEffect(() => () => layers.geometries.forEach((g) => g.dispose()), [layers])
  useEffect(() => () => sprites.forEach((s) => s.dispose()), [sprites])

  // Under `demand` frames nothing re-renders on its own: re-measuring the
  // lockup (fonts, resize) has to ask for the frame that realigns the
  // particles onto the corrected letterforms.
  useEffect(() => {
    invalidate()
  }, [glyph, invalidate])

  useEffect(() => {
    if (!reducedMotion) return
    const onScroll = () => invalidate()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [reducedMotion, invalidate])

  useFrame((state, dt) => {
    const p = computeProgress(containerRef.current)
    const t = reducedMotion ? 0 : state.clock.elapsedTime
    const W = stageWeights(p)
    const S = lockupScale(p, reducedMotion)
    const f = capFocus(p)
    const cap = blendCapMotion(f)
    const { ph, ph2, g1, g2, u } = rand
    const { world, gnx, onEdge, paths, well, zeroW } = glyph
    const { kind, detach, echo, flow, hu, hph, hph2, layer: lay } = roles
    const cur = buffers.cur
    const field = buffers.field

    const zx = zeroW[0]
    const zy = zeroW[1]
    // Tunnel recentres from the zero point to the viewport centre.
    const recentre = smoothstep(0.32, 0.42, p)
    const tcx = lerp(zx, 0, recentre)
    const tcy = lerp(zy, 0, recentre)
    // Streams for the capabilities phase.
    const len = visW * 1.35
    const mobileK = isMobile ? 0.75 : 1
    const capsIntroMix = smoothstep(0.56, 0.62, p) // intro braid → capability motion
    const damp = reducedMotion ? 1 : Math.min(1, dt * 7)
    const scanX = ((t * 1.7) % 2) * len - len / 2

    /* ── idle life + early-scroll response ── */
    const es = reducedMotion ? 0 : earlyDrive(p)
    const M = motion.current
    if (!reducedMotion) {
      const step = Math.min(0.05, dt)
      M.stream += step * (0.03 + es * 0.2)
      M.trace += step * (0.028 + es * 0.26)
      M.well += step * (0.2 + es * 1.6)
      const k = Math.min(1, dt * 3)
      M.parX += (-pointerTarget.x * 0.3 - M.parX) * k
      M.parY += (pointerTarget.y * 0.22 - M.parY) * k
    }
    /* ── the four hero currents, resolved once per frame ──
       Control points sit a quarter and three quarters along the chord,
       pushed out by `bow` for genuine curvature, then drawn toward the
       counter of the "0" by `bend`. Hoisted out of the particle loop:
       there are four curves, not `count` of them. */
    const hw = visW * 0.5
    const hh = VIS_H * 0.5
    for (let q = 0; q < 4; q++) {
      const A = HERO_ARCS[q]
      const ax = A.x0 * hw
      const ay = A.y0 * hh
      const bx2 = A.x1 * hw
      const by2 = A.y1 * hh
      const cdx = bx2 - ax
      const cdy = by2 - ay
      const cl = Math.hypot(cdx, cdy) || 1
      const bowX = (-cdy / cl) * A.bow * hh
      const bowY = (cdx / cl) * A.bow * hh
      const c = curves[q]
      c[0] = ax
      c[1] = ay
      c[2] = lerp(ax + cdx * 0.25 + bowX, zx, A.bend)
      c[3] = lerp(ay + cdy * 0.25 + bowY, zy, A.bend)
      c[4] = lerp(ax + cdx * 0.75 + bowX, zx, A.bend)
      c[5] = lerp(ay + cdy * 0.75 + bowY, zy, A.bend)
      c[6] = bx2
      c[7] = by2
    }

    // Parallax is a hero-only grace note; it is gone before the zoom.
    const parW = isMobile || reducedMotion ? 0 : 1 - smoothstep(0.02, 0.12, p)
    const parX = M.parX * parW
    const parY = M.parY * parW

    /* ── entrance: the decade assembles ── */
    const et = entranceTime()
    // The first scroll input dissolves the entrance and hands the frame
    // back to the scroll timeline — permanently, so scrolling back up
    // never re-engages a choreography the reader has already left.
    if (p > 0.02 || (entranceMode() === 'run' && et >= ENT.settle)) entDone.current = true
    const entOn = !reducedMotion && !entDone.current && entranceMode() !== 'off'
    const entKill = entOn ? 1 - smoothstep(0.004, 0.02, p) : 0
    const entLive = entKill > 0.001

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const s = i % 4
      const k = kind[i]
      let tx = 0
      let ty = 0
      let tz = 0

      /* hero: the assembled number, alive */
      if (W.hero > 0.001) {
        let hx: number
        let hy: number
        let hz: number
        if (k === KIND_TRACE && paths) {
          // Selected particles run the contours of the letterforms: the
          // two rings of the "0" counter-rotate, the stem is walked.
          const path = paths[i & 3]
          const n = path.length >> 1
          let fi: number
          if ((i & 3) < 2) {
            const dir = (i & 3) === 0 ? 1 : -1
            fi = (((u[i] + M.trace * dir) % 1) + 1) % 1
          } else {
            const w = (((u[i] + M.trace * 0.8) % 1) + 1) % 1
            fi = w < 0.5 ? w * 2 : 2 - w * 2 // ping-pong up and down the stem
          }
          const idx = Math.min(n - 1, (fi * n) | 0)
          hx = zx + (path[idx * 2] - zx) * S
          hy = zy + (path[idx * 2 + 1] - zy) * S
          hz = 0.2 + Math.sin(fi * 12.6 + t * 0.8) * 0.12
        } else if (k === KIND_WELL && well) {
          // Volumetric depth inside the "0": a slow luminous funnel plus a
          // halo gathered just off the counter rim. The radius is biased
          // OUTWARD so density falls away toward the middle — the interior
          // stays light and open, never a disc or a dark core. Scroll
          // tightens and deepens it, opening the door the zoom flies through.
          const rr = 0.34 + 0.82 * u[i] * u[i]
          const ang = hph[i] * TAU + M.well * (0.5 + (1 - rr) * 1.15)
          const rad = rr * (1 - es * 0.4)
          hx = zx + (well.x - zx) * S + Math.cos(ang) * well.rx * rad * S
          hy = zy + (well.y - zy) * S + Math.sin(ang) * well.ry * rad * S
          hz = -0.28 - (1 - rr) * 1.35 - es * 3.2 + Math.sin(t * 0.7 + hph2[i] * TAU) * 0.16
        } else if (k === KIND_STREAM) {
          // One of four coherent currents: a cubic whose control points are
          // pulled toward the counter of the "0", so each current bends
          // around, behind or straight through the number by design.
          const q = flow[i]
          const A = HERO_ARCS[q]
          const c = curves[q]
          // The streak — echoes trail the head along the SAME curve, so the
          // smear always lies on the direction of travel. Scroll stretches it.
          const streak = (0.013 + es * 0.055) * echo[i]
          const raw = (((M.stream * (0.82 + q * 0.15) + hu[i] - streak) % 1) + 1) % 1
          // Non-uniform reparametrization: the current slows and gathers as
          // it reaches the number, then opens out again. This is what makes
          // the particles read as drawn TOWARD the "10".
          const drift = raw + 0.45 * Math.sin(TAU * raw) * (1 / TAU)
          const p0x = c[0]
          const p0y = c[1]
          const c1x = c[2]
          const c1y = c[3]
          const c2x = c[4]
          const c2y = c[5]
          const p3x = c[6]
          const p3y = c[7]
          const om = 1 - drift
          const b0 = om * om * om
          const b1 = 3 * om * om * drift
          const b2 = 3 * om * drift * drift
          const b3 = drift * drift * drift
          hx = b0 * p0x + b1 * c1x + b2 * c2x + b3 * p3x
          hy = b0 * p0y + b1 * c1y + b2 * c2y + b3 * p3y
          // Ribbon width across the tangent: the current gathers as it
          // passes the number and opens out again toward the edges.
          const d0 = 3 * om * om
          const d1 = 6 * om * drift
          const d2 = 3 * drift * drift
          const tgx = d0 * (c1x - p0x) + d1 * (c2x - c1x) + d2 * (p3x - c2x)
          const tgy = d0 * (c1y - p0y) + d1 * (c2y - c1y) + d2 * (p3y - c2y)
          const tl = Math.hypot(tgx, tgy) || 1
          const pinch = 0.22 + 0.78 * Math.abs(drift - 0.5) * 2
          const off =
            (g1[i] * A.width + Math.sin(drift * 5.4 + hph[i] * TAU + t * 0.42) * 0.14) * pinch
          hx += (-tgy / tl) * off
          hy += (tgx / tl) * off
          hz = STRATA[lay[i]].z + A.z + g2[i] * 0.28 + Math.sin(drift * 3.1 + t * 0.33) * 0.22
        } else {
          // The body of the number, breathing rather than frozen.
          const br = 0.028 + es * 0.05
          hx = zx + (world[i3] - zx) * S + Math.sin(t * 0.62 + ph[i] * TAU) * br
          hy = zy + (world[i3 + 1] - zy) * S + Math.cos(t * 0.47 + ph2[i] * TAU) * br
          hz = world[i3 + 2] * S * 0.4 + Math.sin(t * 0.5 + ph2[i] * TAU) * 0.22
        }

        // Selected streams and rim particles detach from the typography
        // and rush the viewer as the scroll begins.
        const det = es * detach[i]
        if (det > 0.001) {
          hx += (hx - zx) * det * 0.55
          hy += (hy - zy) * det * 0.55
          hz += det * 3.8
        }
        // Cursor parallax by DEPTH, not by role: the foreground stratum
        // leads, the background barely moves, and the letterforms are
        // pinned so the number never appears to swim.
        const glyphPinned = k === KIND_SHELL || k === KIND_TRACE
        const par = glyphPinned ? 0.26 : STRATA[lay[i]].par
        hx += parX * par
        hy += parY * par

        tx += W.hero * hx
        ty += W.hero * hy
        tz += W.hero * hz
      }

      /* vortex: spiral into the counter of the zero */
      if (W.vortex > 0.001) {
        const ang = ph[i] * TAU + t * 1.7 + u[i] * 9
        const r = 0.22 + 2.9 * u[i] * u[i]
        tx += W.vortex * (zx + Math.cos(ang) * r * 1.12)
        ty += W.vortex * (zy + Math.sin(ang) * r * 0.88)
        tz += W.vortex * (-1.4 + u[i] * 4)
      }

      /* tunnel: ribbons rushing past the viewer; scroll adds velocity */
      if (W.tunnel > 0.001) {
        const zc = ((ph[i] * 26 + t * 3.1 + p * 30) % 26) - 19
        const th = (s / 4) * TAU + ph2[i] * 0.6 + zc * 0.1
        const r = 1.25 + Math.abs(g1[i]) * 0.9 + s * 0.2
        let vy = tcy + Math.sin(th) * r * 0.85
        // Corridor: particles part around the statement band.
        if (W.corridor > 0.001) {
          const away = Math.max(0, 1.4 - Math.abs(vy)) * (vy >= 0 ? 1 : -1)
          vy += away * W.corridor * 1.5
        }
        tx += W.tunnel * (tcx + Math.cos(th) * r)
        ty += W.tunnel * vy
        tz += W.tunnel * zc
      }

      /* capabilities: one stream family, reconfigured per capability */
      if (W.caps > 0.001) {
        // Directional flow along the stream (Project Delivery pushes it).
        const ti = (u[i] + t * cap.flow * 0.02 * capsIntroMix + t * 0.008) % 1
        const x = (ti - 0.5) * len
        const act = Math.max(0, 1 - Math.abs(s - f)) * capsIntroMix
        // Lane, quantized as "align" rises (Process Excellence).
        const laneRaw = g1[i]
        const laneQ = Math.round(laneRaw * 1.5) / 1.5
        const lane = laneRaw * (1 - cap.align) + laneQ * cap.align
        // Lanes exchange places (Business Transformation).
        const swapOff = cap.swap * Math.sin(t * 0.55 + s * 2.1 + ti * 3.1) * 1.1
        let ySep = cap.ySep * mobileK
        // Intro state: looser braid before the first capability locks in.
        ySep = lerp(0.85, ySep, capsIntroMix)
        const spread = lerp(0.28, cap.spread, capsIntroMix)
        const amp = lerp(0.9, cap.amp, capsIntroMix) * mobileK
        const wave = Math.sin(ti * cap.freq * TAU + ph[i] * cap.chaos * TAU + t * cap.flow * 0.45 + s * 0.9) * amp
        let y = ((s - 1.5) / 1.5) * ySep * (1 - act * 0.8) + swapOff * (1 - act) + wave + lane * spread
        // Funnel toward the delivery point on the right (Project Delivery).
        y *= 1 - cap.funnel * clampNorm(x / len + 0.5) * 0.8
        // Validation ridge sweeping the streams (Testing & Quality).
        const ridge = cap.scan * Math.exp(-((x - scanX) * (x - scanX)) / 0.45) * 1.15
        const z = g2[i] * (spread * 1.8 + 0.15) + Math.sin(ti * 4.2 + s * 1.3 + t * 0.25) * 0.4 + act * 2.2 + ridge
        tx += W.caps * x
        ty += W.caps * (y + x * -0.055)
        tz += W.caps * z
      }

      /* closing braid: all four woven into one system */
      if (W.braid > 0.001) {
        const ti = (u[i] + t * 0.01) % 1
        const x = (ti - 0.5) * len
        const y = Math.sin(x * 0.5 + s * 1.5708 + t * 0.5) * 0.75 + g1[i] * 0.16 + x * -0.055
        tx += W.braid * x
        ty += W.braid * y
        tz += W.braid * (Math.cos(x * 0.4 + s) * 0.8 + g2[i] * 0.3)
      }

      let dmp = damp

      /* entrance: coordinated flight from the field into the letterforms */
      if (entLive) {
        // Contours arrive first and the fills follow, so the shape is
        // TRACED and then filled rather than simply appearing.
        const a0 =
          ENT.hold + ENT.drawSpan * gnx[i] + (onEdge[i] ? 0 : ENT.fillDelay) + ph2[i] * 0.04
        const fl = ENT.flight * (0.86 + ph[i] * 0.28)
        const arrive = a0 + fl
        const isStream = k === KIND_STREAM
        const rel0 = arrive + (isStream ? ENT.streamHold + ph[i] * 0.22 : 0)
        const rel1 = rel0 + (isStream ? ENT.streamPeel : 0.2)
        const w = (1 - smoothstep(rel0, rel1, et)) * entKill
        if (w > 0.001) {
          const q = clamp01((et - a0) / fl)
          const e1 = q * q * (3 - 2 * q)
          // Arrival easing weighted toward the tail: the particle covers
          // most of the distance early and then eases the last stretch onto
          // the letterform, so the "10" resolves instead of clicking shut.
          const inv = 1 - e1
          const qe = 1 - inv * inv * (0.55 + 0.45 * inv)
          const gxw = zx + (world[i3] - zx) * S
          const gyw = zy + (world[i3 + 1] - zy) * S
          const gzw = world[i3 + 2] * S * 0.4
          // The gate this particle's stream funnels through — the same
          // point for every particle of the stream, so the flights read
          // as four rivers rather than an even collapse.
          const cx = ENT_GATES[s][0] * visW * 0.5 + g1[i] * 0.55
          const cy = ENT_GATES[s][1] * VIS_H * 0.5 + g2[i] * 0.55
          const cz = (gzw - 0.4) * 0.5 + (s % 2 === 0 ? 1.9 : -1.6)
          // Before launch the field already leans into its gate, so the
          // whole viewport is in coordinated motion from the first frame.
          const lp = Math.min(1, et / Math.max(0.05, a0))
          const lead = 0.13 * lp * lp
          const fx = field[i3] + (cx - field[i3]) * lead
          const fy = field[i3 + 1] + (cy - field[i3 + 1]) * lead
          const fz = field[i3 + 2]
          const om = 1 - qe
          tx = lerp(tx, om * om * fx + 2 * om * qe * cx + qe * qe * gxw, w)
          ty = lerp(ty, om * om * fy + 2 * om * qe * cy + qe * qe * gyw, w)
          tz = lerp(tz, om * om * fz + 2 * om * qe * cz + qe * qe * gzw, w)
          if (w > dmp) dmp = w // follow the choreography exactly, then relax
        }
      }

      cur[i3] += (tx - cur[i3]) * dmp
      cur[i3 + 1] += (ty - cur[i3 + 1]) * dmp
      cur[i3 + 2] += (tz - cur[i3 + 2]) * dmp
    }
    layers.position.needsUpdate = true

    /* palette + background */
    const darkW = darkWeight(p)
    // Hero colouring (hue per current, intensity per stratum) blends out as
    // the hero hands over, so every later section keeps its approved palette.
    const heroW = W.hero
    if (
      Math.abs(darkW - lastDark.current) > 0.0005 ||
      Math.abs(heroW - lastHero.current) > 0.0005
    ) {
      const { light, dark, hero } = colors
      const cc = buffers.curColor
      for (let i = 0; i < cc.length; i++) {
        const base = light[i] + (hero[i] - light[i]) * heroW
        cc[i] = base + (dark[i] - base) * darkW
      }
      layers.color.needsUpdate = true
      lastDark.current = darkW
      lastHero.current = heroW
    }
    if (!(state.scene.background instanceof THREE.Color)) state.scene.background = bgLight.clone()
    ;(state.scene.background as THREE.Color).copy(bgLight).lerp(bgDark, darkW)

    /* camera: fixed with a barely-there breath */
    const cam = state.camera
    cam.position.set(
      reducedMotion ? 0 : Math.sin(t * 0.16) * 0.05,
      reducedMotion ? 0 : Math.sin(t * 0.21) * 0.05,
      CAM_Z,
    )
    cam.lookAt(0, 0, 0)

    // Stratum separation is a HERO treatment: as the hero hands over, all
    // three passes converge on the single size/opacity the later scenes
    // were approved with, so nothing downstream changes.
    const base = isMobile ? 0.066 : 0.06
    for (let li = 0; li < STRATA.length; li++) {
      const m = matRefs.current[li]
      if (!m) continue
      m.size = base * lerp(1, STRATA[li].sizeK * (isMobile ? 0.86 : 1), heroW)
      m.opacity = lerp(0.95, STRATA[li].opacity, heroW)
    }
  })

  return (
    <>
      {layers.geometries.map((g, li) => (
        <points key={li} geometry={g} frustumCulled={false}>
          <pointsMaterial
            ref={(m) => {
              matRefs.current[li] = m
            }}
            map={sprites[li]}
            size={isMobile ? 0.066 : 0.06}
            sizeAttenuation
            vertexColors
            transparent
            depthWrite={false}
            alphaTest={li === 2 ? 0.004 : 0.03}
          />
        </points>
      ))}
    </>
  )
}

function clampNorm(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x
}

/** The single persistent WebGL canvas behind the whole experience. */
export function ExperienceCanvas(props: ExperienceCanvasProps) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      frameloop={props.reducedMotion ? 'demand' : 'always'}
      gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
      camera={{ fov: 50, near: 0.1, far: 80, position: [0, 0, CAM_Z] }}
    >
      {/* Initial clear colour: the renderer's very first frame is ivory, not
          the default black. The frame loop lerps this same Color to ink. */}
      <color attach="background" args={[LIGHT_BG]} />
      <Particles {...props} />
    </Canvas>
  )
}
