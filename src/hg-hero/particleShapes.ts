/**
 * Programmatic particle target generators for the anniversary hero.
 * All shapes are original and generated locally — the "10" is sampled
 * from text rendered on an offscreen canvas (with a procedural backup),
 * never from a downloaded asset.
 */

export interface TenShape {
  positions: Float32Array
  /** World-space centre of the "0" — the camera flies through it. */
  zeroCenterX: number
  zeroCenterY: number
  height: number
}

export interface ParticleColors {
  light: Float32Array
  dark: Float32Array
}

/* ── small random helpers ────────────────────────────────── */

function gauss(): number {
  // Box–Muller
  let u = 0
  let v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

function randomUnit(): [number, number, number] {
  const z = Math.random() * 2 - 1
  const t = Math.random() * Math.PI * 2
  const r = Math.sqrt(1 - z * z)
  return [r * Math.cos(t), r * Math.sin(t), z]
}

/* ── 1. Organic opening field ────────────────────────────── */

/**
 * A living organizational system: flowing tilted arcs (work in motion),
 * soft clusters (teams) and a sparse halo (the wider company context).
 */
export function createOrganicField(count: number, simplified: boolean): Float32Array {
  const pos = new Float32Array(count * 3)

  const arcCount = simplified ? 3 : 5
  const arcs = Array.from({ length: arcCount }, () => {
    const axis = randomUnit()
    // orthonormal basis around the arc axis
    const helper: [number, number, number] =
      Math.abs(axis[0]) < 0.8 ? [1, 0, 0] : [0, 1, 0]
    const u = cross(axis, helper)
    normalize(u)
    const v = cross(axis, u)
    normalize(v)
    return {
      cx: gauss() * 0.3,
      cy: gauss() * 0.22,
      cz: gauss() * 0.3,
      r: 1.0 + Math.random() * 1.3,
      u,
      v,
      span: Math.PI * (0.7 + Math.random() * 0.9),
      phase: Math.random() * Math.PI * 2,
    }
  })

  const clusterCount = simplified ? 3 : 5
  const clusters = Array.from({ length: clusterCount }, () => {
    const a = Math.random() * Math.PI * 2
    return { cx: Math.cos(a) * 1.5, cy: Math.sin(a) * 1.05, cz: gauss() * 0.5 }
  })

  for (let i = 0; i < count; i++) {
    const f = i / count
    const i3 = i * 3
    if (f < 0.55) {
      const a = arcs[i % arcCount]
      const t = a.phase + Math.random() * a.span
      const cu = Math.cos(t) * a.r
      const sv = Math.sin(t) * a.r
      pos[i3] = a.cx + cu * a.u[0] + sv * a.v[0] + gauss() * 0.1
      pos[i3 + 1] = a.cy + cu * a.u[1] + sv * a.v[1] + gauss() * 0.1
      pos[i3 + 2] = (a.cz + cu * a.u[2] + sv * a.v[2] + gauss() * 0.1) * 0.7
    } else if (f < 0.8) {
      const c = clusters[i % clusterCount]
      pos[i3] = c.cx + gauss() * 0.34
      pos[i3 + 1] = c.cy + gauss() * 0.3
      pos[i3 + 2] = (c.cz + gauss() * 0.34) * 0.7
    } else {
      const d = randomUnit()
      const r = 2.4 + gauss() * 0.45
      pos[i3] = d[0] * r
      pos[i3 + 1] = d[1] * r * 0.8
      pos[i3 + 2] = d[2] * r * 0.5
    }
  }
  return pos
}

function cross(a: [number, number, number], b: [number, number, number]): [number, number, number] {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
}

function normalize(v: [number, number, number]): void {
  const l = Math.hypot(v[0], v[1], v[2]) || 1
  v[0] /= l
  v[1] /= l
  v[2] /= l
}

/* ── 2. The particle "10" ────────────────────────────────── */

/**
 * Samples point coordinates from "10" rendered on an offscreen canvas.
 * Only coordinates leave this function — the visible rendering is WebGL.
 */
export function createTenShape(
  count: number,
  worldWidth: number,
  offsetX = 0,
  offsetY = 0,
): TenShape {
  const samples: Array<[number, number]> = []
  const edges: Array<[number, number]> = []
  const cw = 720
  const ch = 400
  try {
    const canvas = document.createElement('canvas')
    canvas.width = cw
    canvas.height = ch
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (ctx) {
      ctx.clearRect(0, 0, cw, ch)
      ctx.fillStyle = '#fff'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      try {
        // Supported in modern browsers; harmless if it throws.
        ;(ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '-12px'
      } catch {
        /* optional nicety only */
      }
      ctx.font = '800 300px "Geist Variable", "Segoe UI", Arial, sans-serif'
      ctx.fillText('10', cw / 2, ch / 2)
      const data = ctx.getImageData(0, 0, cw, ch).data
      const step = 2
      const alphaAt = (x: number, y: number) =>
        x < 0 || y < 0 || x >= cw || y >= ch ? 0 : data[(y * cw + x) * 4 + 3]
      for (let y = 0; y < ch; y += step) {
        for (let x = 0; x < cw; x += step) {
          if (alphaAt(x, y) > 140) {
            samples.push([x, y])
            // Edge pixels get their own pool so the outline can be denser.
            const e = step * 2
            if (
              alphaAt(x + e, y) <= 140 ||
              alphaAt(x - e, y) <= 140 ||
              alphaAt(x, y + e) <= 140 ||
              alphaAt(x, y - e) <= 140
            ) {
              edges.push([x, y])
            }
          }
        }
      }
    }
  } catch {
    /* fall through to procedural shape */
  }

  const positions = new Float32Array(count * 3)

  if (samples.length < 200) {
    // Procedural backup: a bar ("1") and an annulus ("0").
    const height = worldWidth * 0.56
    const rOuter = height / 2
    const rInner = rOuter * 0.55
    const barX = -worldWidth * 0.34
    const zeroX = worldWidth * 0.2
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      if (i % 3 === 0) {
        positions[i3] = offsetX + barX + gauss() * 0.09
        positions[i3 + 1] = offsetY + (Math.random() - 0.5) * height
      } else {
        const a = Math.random() * Math.PI * 2
        const r = rInner + Math.random() * (rOuter - rInner)
        positions[i3] = offsetX + zeroX + Math.cos(a) * r
        positions[i3 + 1] = offsetY + Math.sin(a) * r
      }
      positions[i3 + 2] = gauss() * 0.3
    }
    return { positions, zeroCenterX: offsetX + zeroX, zeroCenterY: offsetY, height }
  }

  // Bounding box of the sampled glyphs.
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  for (const [x, y] of samples) {
    if (x < minX) minX = x
    if (x > maxX) maxX = x
    if (y < minY) minY = y
    if (y > maxY) maxY = y
  }
  const bw = Math.max(1, maxX - minX)
  const bh = Math.max(1, maxY - minY)
  const scale = worldWidth / bw
  const midX = minX + bw / 2
  const midY = minY + bh / 2

  // Centre of the "0" = centroid of samples in the right part of the glyphs.
  let zx = 0
  let zy = 0
  let zn = 0
  for (const [x, y] of samples) {
    if (x > minX + bw * 0.45) {
      zx += x
      zy += y
      zn++
    }
  }
  const zeroCenterX = offsetX + (zn > 0 ? (zx / zn - midX) * scale : worldWidth * 0.2)
  const zeroCenterY = offsetY + (zn > 0 ? (midY - zy / zn) * scale : 0)

  // Sort samples along a diagonal flow so each of the four streams
  // (particle index % 4) owns a contiguous band of the numeral — the
  // stream colours stay visible inside the completed "10".
  const flowKey = (pt: [number, number]) => (pt[0] - minX) / bw + 0.45 * ((pt[1] - minY) / bh)
  samples.sort((a, b) => flowKey(a) - flowKey(b))
  edges.sort((a, b) => flowKey(a) - flowKey(b))

  const jitter = scale * 1.4
  const useEdges = edges.length > 60
  for (let i = 0; i < count; i++) {
    const stream = i % 4
    // Half of the particles hug the outline (including the inner counter of
    // the "0") for crisp, dense edges; tight jitter keeps the glyph clean.
    const pool = useEdges && Math.random() < 0.5 ? edges : samples
    const idx = Math.min(pool.length - 1, (((stream + Math.random()) * pool.length) / 4) | 0)
    const [sx, sy] = pool[idx]
    const i3 = i * 3
    positions[i3] = offsetX + (sx - midX) * scale + (Math.random() - 0.5) * jitter
    positions[i3 + 1] = offsetY + (midY - sy) * scale + (Math.random() - 0.5) * jitter
    positions[i3 + 2] = gauss() * 0.5
  }
  return { positions, zeroCenterX, zeroCenterY, height: bh * scale }
}

/* ── 2b. Four converging streams ─────────────────────────── */

/**
 * Four flowing streams (one per particle-index % 4) entering from
 * different spatial directions and curving toward the centre, ready to
 * merge into the "10". Quadratic bezier spines with lateral scatter that
 * tightens as the streams approach the merge point.
 */
export function createStreamsField(
  count: number,
  visW: number,
  visH: number,
  simplified: boolean,
): Float32Array {
  const pos = new Float32Array(count * 3)
  const W = visW * 0.55
  const H = visH * 0.5
  // p0 off-screen entry → p1 curve shoulder → p2 near-centre merge point
  const spines = [
    { p0: [-1.6 * W, 1.3 * H, -2.5], p1: [-0.6 * W, 0.35 * H, -0.9], p2: [-0.08 * W, 0.1 * H, 0] },
    { p0: [-1.5 * W, -1.4 * H, 1.6], p1: [-0.5 * W, -0.4 * H, 0.6], p2: [0, -0.1 * H, 0.2] },
    { p0: [1.6 * W, 1.4 * H, 1.8], p1: [0.6 * W, 0.45 * H, 0.5], p2: [0.08 * W, 0.08 * H, -0.1] },
    { p0: [1.5 * W, -1.3 * H, -2.2], p1: [0.5 * W, -0.35 * H, -0.6], p2: [0, -0.06 * H, 0.1] },
  ]
  const scatterScale = simplified ? 0.6 : 1
  for (let i = 0; i < count; i++) {
    const i3 = i * 3
    const sp = spines[i % 4]
    // Bias particles toward the merge end so the centre feels charged.
    const t = Math.pow(Math.random(), 0.85)
    const u = 1 - t
    const bx = u * u * sp.p0[0] + 2 * u * t * sp.p1[0] + t * t * sp.p2[0]
    const by = u * u * sp.p0[1] + 2 * u * t * sp.p1[1] + t * t * sp.p2[1]
    const bz = u * u * sp.p0[2] + 2 * u * t * sp.p1[2] + t * t * sp.p2[2]
    // Streams curve around each other: gentle sine offset along the spine.
    const wave = Math.sin(t * 5 + (i % 4) * 1.7) * 0.5 * u
    const spread = (0.28 + 0.6 * u) * scatterScale
    pos[i3] = bx + gauss() * spread
    pos[i3 + 1] = by + wave + gauss() * spread
    pos[i3 + 2] = bz + gauss() * 0.7
  }
  return pos
}

/* ── 3. Journey / tunnel state ───────────────────────────── */

/**
 * Seven angular streams around an axis through the centre of the "0";
 * particles span deep z so they flow past the travelling camera.
 */
export function createTunnelField(count: number, axisX: number, axisY = 0): Float32Array {
  const pos = new Float32Array(count * 3)
  // Four spiralling ribbons — the SAME index % 4 grouping as the colour
  // streams and the bands of the "10", so the tunnel visibly originates
  // from the coloured structure of the numeral.
  const streams = 4
  for (let i = 0; i < count; i++) {
    const i3 = i * 3
    const s = i % streams
    const baseTheta = (s / streams) * Math.PI * 2 + gauss() * 0.28
    const r = 1.15 + Math.abs(gauss()) * 0.8 + s * 0.22
    const z = -17 + Math.random() * 24
    const theta = baseTheta + z * 0.09
    pos[i3] = axisX + Math.cos(theta) * r
    pos[i3 + 1] = axisY + Math.sin(theta) * r * 0.85
    pos[i3 + 2] = z
  }
  return pos
}

/* ── 4. Dispersed / fading state ─────────────────────────── */

export function createDispersedField(count: number, axisX: number, axisY = 0): Float32Array {
  const pos = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const i3 = i * 3
    const d = randomUnit()
    const r = 3.5 + Math.abs(gauss()) * 4.5
    pos[i3] = axisX * 0.5 + d[0] * r
    pos[i3 + 1] = axisY * 0.5 + d[1] * r
    pos[i3 + 2] = -2 + d[2] * r
  }
  return pos
}

/* ── Colors ──────────────────────────────────────────────── */

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

/**
 * Per-particle colors for the light and dark phases of the scene.
 * Mostly base tone + A1 red, with restrained coral and blue accents.
 */
export function buildParticleColors(count: number): ParticleColors {
  // One colour per stream (particle index % 4): coral rose, electric
  // violet, ice blue, champagne gold — plus warm-white highlights
  // sprinkled across all four streams.
  const streamsDark = ['#ff6e79', '#9d6bff', '#7cc4ff', '#e8c188'].map(hexToRgb)
  const streamsLight = ['#e0525e', '#7c4fe0', '#3f7fc4', '#b98a3a'].map(hexToRgb)
  const highlightDark = hexToRgb('#fff1e0')
  const highlightLight = hexToRgb('#2c2c34')

  const light = new Float32Array(count * 3)
  const dark = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const isHighlight = Math.random() < 0.18
    const s = i % 4
    const dc = isHighlight ? highlightDark : streamsDark[s]
    const lc = isHighlight ? highlightLight : streamsLight[s]
    const b = 0.85 + Math.random() * 0.25
    const i3 = i * 3
    for (let c = 0; c < 3; c++) {
      light[i3 + c] = Math.min(1, lc[c] * b)
      dark[i3 + c] = Math.min(1, dc[c] * b)
    }
  }
  return { light, dark }
}

/* ── Slow ambient background field ───────────────────────── */

/** Sparse, dim particles far behind the "10" for depth in the dark scenes. */
export function createBackgroundDrift(count: number): Float32Array {
  const pos = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const i3 = i * 3
    pos[i3] = (Math.random() - 0.5) * 20
    pos[i3 + 1] = (Math.random() - 0.5) * 13
    pos[i3 + 2] = -9 - Math.random() * 11
  }
  return pos
}

/* ── Fine connecting strands for the "10" ────────────────── */

/**
 * Sparse line segments between nearby points of the "10" target —
 * the "fine connecting strands" that make the number feel woven.
 */
export function createStrandSegments(tenPositions: Float32Array, maxSegments: number): Float32Array {
  const n = tenPositions.length / 3
  const segs = new Float32Array(maxSegments * 6)
  let written = 0
  let attempts = 0
  while (written < maxSegments && attempts < maxSegments * 60) {
    attempts++
    const a = (Math.random() * n) | 0
    const b = (Math.random() * n) | 0
    const dx = tenPositions[a * 3] - tenPositions[b * 3]
    const dy = tenPositions[a * 3 + 1] - tenPositions[b * 3 + 1]
    const dz = tenPositions[a * 3 + 2] - tenPositions[b * 3 + 2]
    const d = Math.hypot(dx, dy, dz)
    if (d > 0.18 && d < 0.6) {
      const o = written * 6
      segs[o] = tenPositions[a * 3]
      segs[o + 1] = tenPositions[a * 3 + 1]
      segs[o + 2] = tenPositions[a * 3 + 2]
      segs[o + 3] = tenPositions[b * 3]
      segs[o + 4] = tenPositions[b * 3 + 1]
      segs[o + 5] = tenPositions[b * 3 + 2]
      written++
    }
  }
  return written === maxSegments ? segs : segs.slice(0, written * 6)
}
