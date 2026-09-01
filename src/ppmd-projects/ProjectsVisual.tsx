import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { computeProgress, fadeWindow, smoothstep } from '../hg-hero/heroTheme'
import {
  INK,
  MORPHS,
  P_CHAMPAGNE,
  P_CORAL,
  P_ICE,
  P_VIOLET,
  P_WHITE,
  SHAPE_AMPS,
} from './projectsData'

interface ProjectsVisualProps {
  containerRef: React.RefObject<HTMLDivElement | null>
  reducedMotion: boolean
  isMobile: boolean
}

interface Shape {
  pos: Float32Array
  col: Float32Array
}

function makeSpriteTexture(): THREE.Texture {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (ctx) {
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    g.addColorStop(0, 'rgba(255,255,255,1)')
    g.addColorStop(0.5, 'rgba(255,255,255,0.95)')
    g.addColorStop(0.75, 'rgba(255,255,255,0.3)')
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

/** Weighted palette picker with per-particle brightness jitter. */
function makePicker(entries: Array<[string, number]>) {
  const total = entries.reduce((a, [, w]) => a + w, 0)
  const rgb = entries.map(([hex]) => hexToRgb(hex))
  return (col: Float32Array, i3: number, forced?: number) => {
    let idx = forced ?? 0
    if (forced === undefined) {
      let r = Math.random() * total
      for (let k = 0; k < entries.length; k++) {
        r -= entries[k][1]
        if (r <= 0) {
          idx = k
          break
        }
      }
    }
    const b = 0.8 + Math.random() * 0.3
    col[i3] = Math.min(1, rgb[idx][0] * b)
    col[i3 + 1] = Math.min(1, rgb[idx][1] * b)
    col[i3 + 2] = Math.min(1, rgb[idx][2] * b)
  }
}

/* ── The eight shapes ────────────────────────────────────── */

/** Intro — the temporal path widened into a field of constellations. */
function shapeConstellations(n: number): Shape {
  const pos = new Float32Array(n * 3)
  const col = new Float32Array(n * 3)
  const paint = makePicker([
    [P_WHITE, 3],
    [P_CHAMPAGNE, 1.4],
    [P_CORAL, 1],
    [P_VIOLET, 1],
    [P_ICE, 1],
  ])
  const clusters = Array.from({ length: 6 }, (_, k) => {
    const a = (k / 6) * Math.PI * 2 + 0.4
    return [Math.cos(a) * 4.2, Math.sin(a) * 2.1, -1 + Math.sin(k * 2.3) * 1.4]
  })
  for (let i = 0; i < n; i++) {
    const i3 = i * 3
    if (i % 100 < 55) {
      const c = clusters[i % 6]
      pos[i3] = c[0] + gauss() * 0.55
      pos[i3 + 1] = c[1] + gauss() * 0.45
      pos[i3 + 2] = c[2] + gauss() * 0.5
    } else {
      pos[i3] = (Math.random() - 0.5) * 13
      pos[i3 + 1] = (Math.random() - 0.5) * 6.8
      pos[i3 + 2] = -3 + Math.random() * 4.5
    }
    paint(col, i3)
  }
  return { pos, col }
}

/**
 * 01 — 3G Sunset: a controlled network transition, as a PAIR of states
 * morphed across the project's own plateau.
 *
 * Two large-scale lanes run the width of the frame and converge gently
 * downstream: the legacy network above, the continuing environment below.
 * Because the morph carries particle i from its A position to its B
 * position, a particle seeded on the legacy lane in A and on the target
 * lane in B *is* a migration — it changes lane while advancing downstream,
 * so the movement reads as traffic being rerouted rather than deleted. The
 * target lane is already populated in A and only strengthens, which is what
 * keeps continuity visible for the whole scene.
 */
function shapeSunsetPair(n: number): [Shape, Shape] {
  const A: Shape = { pos: new Float32Array(n * 3), col: new Float32Array(n * 3) }
  const B: Shape = { pos: new Float32Array(n * 3), col: new Float32Array(n * 3) }
  const legacy = hexToRgb(P_CORAL)
  const legacyWarm = hexToRgb(P_CHAMPAGNE)
  const target = hexToRgb(P_WHITE)
  const ink = hexToRgb(INK)

  /** Lane 0 = legacy (upper), lane 1 = continuing environment (lower). */
  const laneX = (u: number) => -6.7 + u * 13.4
  const laneY = (u: number, lane: number) => {
    const converge = 1 - 0.38 * u /* the two lanes draw together downstream */
    return (lane === 0 ? 1.72 : -1.5) * converge + Math.sin(u * 3.1 + lane * 1.7) * 0.22
  }
  const laneZ = (u: number, lane: number) =>
    (lane === 0 ? 0.65 : -0.7) + Math.sin(u * 2.4 + lane * 2.1) * 0.45

  const put = (s: Shape, i3: number, u: number, lane: number, spread: number) => {
    s.pos[i3] = laneX(u) + gauss() * spread * 1.1
    s.pos[i3 + 1] = laneY(u, lane) + gauss() * spread
    s.pos[i3 + 2] = laneZ(u, lane) + gauss() * spread * 1.2
  }
  const tint = (s: Shape, i3: number, c: [number, number, number], k: number) => {
    const b = 0.8 + Math.random() * 0.3
    s.col[i3] = Math.min(1, c[0] * b) * k + ink[0] * (1 - k)
    s.col[i3 + 1] = Math.min(1, c[1] * b) * k + ink[1] * (1 - k)
    s.col[i3 + 2] = Math.min(1, c[2] * b) * k + ink[2] * (1 - k)
  }

  for (let i = 0; i < n; i++) {
    const i3 = i * 3
    const role = i % 100
    const u = Math.random()
    // Downstream advance across the scene — every particle keeps flowing,
    // so nothing appears to stall while the migration happens.
    const uB = Math.min(1, u + 0.16 + Math.random() * 0.1)
    if (role < 34) {
      /* the continuing environment: present from the start, and it tightens */
      put(A, i3, u, 1, 0.13)
      put(B, i3, uB, 1, 0.1)
      tint(A, i3, target, 0.85)
      tint(B, i3, target, 1)
    } else if (role < 82) {
      /* migrating traffic: legacy lane → continuing lane, still moving */
      put(A, i3, u, 0, 0.12)
      put(B, i3, uB, 1, 0.13)
      tint(A, i3, legacy, 0.95)
      tint(B, i3, target, 0.92)
    } else if (role < 93) {
      /* residual legacy: thinning and dimming toward the ink, never popping */
      put(A, i3, u, 0, 0.13)
      put(B, i3, Math.min(1, u + 0.05), 0, 0.42)
      tint(A, i3, legacyWarm, 0.9)
      tint(B, i3, legacyWarm, 0.18)
    } else {
      /* slow cross-lane connectors that make the reroute legible */
      const mix = Math.random()
      A.pos[i3] = laneX(u) + gauss() * 0.16
      A.pos[i3 + 1] = laneY(u, 0) * (1 - mix) + laneY(u, 1) * mix + gauss() * 0.14
      A.pos[i3 + 2] = laneZ(u, 0) * (1 - mix) + laneZ(u, 1) * mix + gauss() * 0.2
      const m2 = Math.min(1, mix + 0.45)
      B.pos[i3] = laneX(uB) + gauss() * 0.14
      B.pos[i3 + 1] = laneY(uB, 0) * (1 - m2) + laneY(uB, 1) * m2 + gauss() * 0.12
      B.pos[i3 + 2] = laneZ(uB, 0) * (1 - m2) + laneZ(uB, 1) * m2 + gauss() * 0.18
      tint(A, i3, legacyWarm, 0.9)
      tint(B, i3, target, 0.95)
    }
  }
  return [A, B]
}

/** 02 — 5G: layered high-speed waves with scale and depth. */
function shapeWaves(n: number): Shape {
  const pos = new Float32Array(n * 3)
  const col = new Float32Array(n * 3)
  const paint = makePicker([
    [P_ICE, 2.4],
    [P_VIOLET, 1.8],
    [P_WHITE, 1],
  ])
  for (let i = 0; i < n; i++) {
    const i3 = i * 3
    const layer = i % 5
    const x = (Math.random() - 0.5) * 14
    pos[i3] = x
    pos[i3 + 1] = (layer - 2) * 1.15 + Math.sin(x * 0.75 + layer * 1.3) * 0.75 + gauss() * 0.12
    pos[i3 + 2] = (layer - 2) * -1.1 + gauss() * 0.25
    paint(col, i3)
  }
  return { pos, col }
}

/**
 * 03 — Voice over Wi-Fi: two networks becoming one experience, again as a
 * PAIR morphed across the project's own plateau.
 *
 * State A holds two distinct systems, separated in depth and tone — one
 * sitting forward, one behind, each on its own band of lanes. State B puts
 * both on a single shared band and gives them opposite weave phases, so
 * they cross through each other in depth and resolve into one continuous
 * braided flow. The handover reads as interleaving, never as one system
 * replacing the other.
 */
function shapeVowifiPair(n: number): [Shape, Shape] {
  const A: Shape = { pos: new Float32Array(n * 3), col: new Float32Array(n * 3) }
  const B: Shape = { pos: new Float32Array(n * 3), col: new Float32Array(n * 3) }
  const netA = hexToRgb(P_ICE)
  const netB = hexToRgb(P_WHITE)
  const seam = hexToRgb(P_VIOLET)

  const spanX = (u: number) => -6.6 + u * 13.2
  /* A: each network on its own band, its own depth. */
  const sepY = (u: number, net: number, lane: number) =>
    (net === 0 ? 1.75 : -1.7) + (lane - 1) * 0.5 + Math.sin(u * 2.7 + net * 1.4 + lane) * 0.3
  const sepZ = (net: number) => (net === 0 ? 1.3 : -1.65)
  /* B: one shared band, the two networks weaving in opposite phase. */
  const oneY = (u: number, lane: number) =>
    (lane - 1) * 0.62 + Math.sin(u * 3.4 + lane * 0.9) * 0.5
  const oneZ = (u: number, net: number) => Math.sin(u * Math.PI * 3 + net * Math.PI) * 0.62

  const tint = (s: Shape, i3: number, c: [number, number, number]) => {
    const b = 0.8 + Math.random() * 0.3
    s.col[i3] = Math.min(1, c[0] * b)
    s.col[i3 + 1] = Math.min(1, c[1] * b)
    s.col[i3 + 2] = Math.min(1, c[2] * b)
  }
  /* The unified tone both networks resolve toward. */
  const merged: [number, number, number] = [
    (netA[0] + netB[0]) / 2,
    (netA[1] + netB[1]) / 2,
    (netA[2] + netB[2]) / 2,
  ]

  for (let i = 0; i < n; i++) {
    const i3 = i * 3
    const net = i % 2
    const lane = (i / 2) % 3 | 0
    const u = Math.random()
    const uB = Math.min(1, u + 0.12 + Math.random() * 0.08)
    const isSeam = i % 100 >= 88 /* the flows that visibly cross between systems */

    A.pos[i3] = spanX(u) + gauss() * 0.22
    A.pos[i3 + 1] = sepY(u, net, lane) + gauss() * 0.16
    A.pos[i3 + 2] = sepZ(net) + gauss() * 0.3

    B.pos[i3] = spanX(uB) + gauss() * 0.2
    B.pos[i3 + 1] = oneY(uB, lane) + gauss() * 0.14
    B.pos[i3 + 2] = oneZ(uB, net) + gauss() * 0.22

    if (isSeam) {
      // Seam particles start between the two systems and end inside the
      // braid, so the crossing is legible before the bands have merged.
      A.pos[i3 + 1] = (sepY(u, 0, lane) + sepY(u, 1, lane)) * 0.5 + gauss() * 0.5
      A.pos[i3 + 2] = gauss() * 0.5
      tint(A, i3, seam)
      tint(B, i3, merged)
    } else {
      tint(A, i3, net === 0 ? netA : netB)
      tint(B, i3, merged)
    }
  }
  return [A, B]
}

/** 04 — SAP S/4HANA: layers align into an ordered spatial structure. */
function shapeLattice(n: number): Shape {
  const pos = new Float32Array(n * 3)
  const col = new Float32Array(n * 3)
  const paint = makePicker([
    [P_VIOLET, 2.2],
    [P_CORAL, 1.5],
    [P_WHITE, 1.2],
  ])
  const cx = -2.1
  const step = 0.56
  const yaw = 0.34
  const roll = 0.12
  for (let i = 0; i < n; i++) {
    const i3 = i * 3
    if (i % 100 < 80) {
      const ix = (((Math.random() * 9) | 0) - 4) * step
      const iy = (((Math.random() * 6) | 0) - 2.5) * step
      const iz = (((Math.random() * 5) | 0) - 2) * step
      // gentle yaw + roll so the order reads as spatial, not as a grid UI
      const x1 = ix * Math.cos(yaw) - iz * Math.sin(yaw)
      const z1 = ix * Math.sin(yaw) + iz * Math.cos(yaw)
      const x2 = x1 * Math.cos(roll) - iy * Math.sin(roll)
      const y2 = x1 * Math.sin(roll) + iy * Math.cos(roll)
      pos[i3] = cx + x2 + gauss() * 0.045
      pos[i3 + 1] = y2 + gauss() * 0.045
      pos[i3 + 2] = -0.5 + z1 + gauss() * 0.045
    } else {
      pos[i3] = cx + gauss() * 3.4
      pos[i3 + 1] = gauss() * 2
      pos[i3 + 2] = -0.5 + gauss() * 1.6
    }
    paint(col, i3)
  }
  return { pos, col }
}

/**
 * 05 — Bulgarian Customs Agency: structured, controlled data flow.
 *
 * Strictly directional, left to right — there is no radial symmetry
 * anywhere in the figure, which is what keeps it from reading as a
 * starburst. Four declared lanes enter and converge on a validation zone
 * where positions quantize onto discrete ranks and columns (engineered, not
 * organic), then the traffic branches out to three separate destination
 * paths. Scatter is deliberately the tightest of any project shape so the
 * whole system reads as precise and accountable.
 */
function shapeLanes(n: number): Shape {
  const pos = new Float32Array(n * 3)
  const col = new Float32Array(n * 3)
  const paint = makePicker([
    [P_CHAMPAGNE, 2],
    [P_WHITE, 2],
    [P_CORAL, 0.9],
  ])
  const GATE_L = -1.5
  const GATE_R = 1.5
  const inLanes = [-2.15, -0.72, 0.72, 2.15]
  const outPaths = [-2.45, 0.15, 2.6]
  /* Discrete ranks/columns inside the validation zone. */
  const ranks = [-0.9, -0.54, -0.18, 0.18, 0.54, 0.9]
  const cols = [-0.95, 0, 0.95]

  for (let i = 0; i < n; i++) {
    const i3 = i * 3
    const stage = i % 100
    if (stage < 38) {
      /* inbound: declared lanes, converging on the gate */
      const k = i % 4
      const u = Math.random()
      const x = -7.4 + u * (GATE_L + 7.4)
      const conv = 1 - 0.62 * u
      pos[i3] = x + gauss() * 0.05
      pos[i3 + 1] = inLanes[k] * conv + gauss() * 0.055
      pos[i3 + 2] = (k - 1.5) * 0.42 + gauss() * 0.12
    } else if (stage < 62) {
      /* validation zone: traffic aligns onto discrete ranks and holds them
         across the whole zone — ordered lanes under inspection, not a grid
         of blocks. A minority marks the checkpoint columns those ranks
         cross, which is what makes the zone read as a control point. */
      const r = ranks[i % 6]
      if (stage < 58) {
        pos[i3] = GATE_L + Math.random() * (GATE_R - GATE_L) + gauss() * 0.03
        pos[i3 + 1] = r + gauss() * 0.045
        pos[i3 + 2] = ((i % 5) - 2) * 0.3 + gauss() * 0.06
      } else {
        const c = cols[(i / 6) % 3 | 0]
        pos[i3] = c + gauss() * 0.035
        pos[i3 + 1] = (Math.random() * 2 - 1) * 1.05 + gauss() * 0.04
        pos[i3 + 2] = ((i % 5) - 2) * 0.3 + gauss() * 0.06
      }
    } else if (stage < 94) {
      /* outbound: branching to separate, connected destinations */
      const d = i % 3
      const u = Math.random()
      const x = GATE_R + u * (7.4 - GATE_R)
      const spread = smoothstep(0, 1, u)
      pos[i3] = x + gauss() * 0.05
      pos[i3 + 1] = outPaths[d] * spread + gauss() * 0.055
      pos[i3 + 2] = (d - 1) * 0.55 * spread + gauss() * 0.12
    } else {
      /* sparse structural markers holding the lanes apart in depth */
      const k = i % 4
      pos[i3] = -7 + Math.random() * 14
      pos[i3 + 1] = inLanes[k] * 1.32 + gauss() * 0.1
      pos[i3 + 2] = -1.5 + gauss() * 0.5
    }
    paint(col, i3)
  }
  return { pos, col }
}

/** 06 — Entitlement Server: distant clusters connect into one network. */
function shapeClusters(n: number): Shape {
  const pos = new Float32Array(n * 3)
  const col = new Float32Array(n * 3)
  const clusterColors = [P_CORAL, P_VIOLET, P_ICE, P_CHAMPAGNE, P_WHITE]
  const paint = makePicker(clusterColors.map((c) => [c, 1]))
  const centers = [
    [-4.8, 1.8, -2],
    [4.6, 2.0, -1],
    [-3.6, -2.0, 0.5],
    [4.0, -1.8, -3],
    [0.3, 0.4, 1.0],
  ]
  const bridges = [
    [0, 4],
    [1, 4],
    [2, 4],
    [3, 4],
    [0, 1],
    [2, 3],
  ]
  for (let i = 0; i < n; i++) {
    const i3 = i * 3
    if (i % 100 < 70) {
      const k = i % 5
      const c = centers[k]
      pos[i3] = c[0] + gauss() * 0.5
      pos[i3 + 1] = c[1] + gauss() * 0.42
      pos[i3 + 2] = c[2] + gauss() * 0.5
      paint(col, i3, k)
    } else {
      const [a, b] = bridges[i % 6]
      const t = Math.random()
      pos[i3] = centers[a][0] + (centers[b][0] - centers[a][0]) * t + gauss() * 0.1
      pos[i3 + 1] = centers[a][1] + (centers[b][1] - centers[a][1]) * t + gauss() * 0.1
      pos[i3 + 2] = centers[a][2] + (centers[b][2] - centers[a][2]) * t + gauss() * 0.1
      paint(col, i3, Math.random() < 0.5 ? 4 : a)
    }
  }
  return { pos, col }
}

/** Closing — everything converges into one shared system. */
function shapeConvergence(n: number): Shape {
  const pos = new Float32Array(n * 3)
  const col = new Float32Array(n * 3)
  const paint = makePicker([
    [P_WHITE, 2],
    [P_CORAL, 1.1],
    [P_VIOLET, 1.1],
    [P_ICE, 1.1],
    [P_CHAMPAGNE, 1.1],
  ])
  for (let i = 0; i < n; i++) {
    const i3 = i * 3
    if (i % 100 < 85) {
      pos[i3] = gauss() * 1.7
      pos[i3 + 1] = gauss() * 1.1
      pos[i3 + 2] = gauss() * 0.95
    } else {
      const d = [gauss(), gauss(), gauss()]
      const l = Math.hypot(d[0], d[1], d[2]) || 1
      const r = 3 + gauss() * 0.35
      pos[i3] = (d[0] / l) * r
      pos[i3 + 1] = (d[1] / l) * r * 0.7
      pos[i3 + 2] = (d[2] / l) * r * 0.6
    }
    paint(col, i3)
  }
  return { pos, col }
}

/* ── Field component ─────────────────────────────────────── */

function ProjectField({ containerRef, reducedMotion, isMobile }: ProjectsVisualProps) {
  const invalidate = useThree((s) => s.invalidate)
  const count = isMobile ? 3000 : 9000
  const strandCount = isMobile ? 60 : 140
  const matRef = useRef<THREE.PointsMaterial>(null)
  const strandMatRef = useRef<THREE.LineBasicMaterial>(null)
  const strandsRef = useRef<THREE.LineSegments>(null)

  const shapes = useMemo<Shape[]>(() => {
    // Two projects carry a pair of states morphed across their own plateau;
    // the shape list stays one entry longer than MORPHS, as the lookup in
    // the frame loop expects.
    const [sunsetA, sunsetB] = shapeSunsetPair(count)
    const [vowifiA, vowifiB] = shapeVowifiPair(count)
    return [
      shapeConstellations(count),
      sunsetA,
      sunsetB,
      shapeWaves(count),
      vowifiA,
      vowifiB,
      shapeLattice(count),
      shapeLanes(count),
      shapeClusters(count),
      shapeConvergence(count),
    ]
  }, [count])

  const base = useMemo(() => {
    const phases = new Float32Array(count)
    for (let i = 0; i < count; i++) phases[i] = Math.random() * Math.PI * 2
    return {
      phases,
      curPos: Float32Array.from(shapes[0].pos),
      curCol: Float32Array.from(shapes[0].col),
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seeded once from the intro shape
  }, [count])

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(base.curPos, 3).setUsage(THREE.DynamicDrawUsage))
    g.setAttribute('color', new THREE.BufferAttribute(base.curCol, 3).setUsage(THREE.DynamicDrawUsage))
    return g
  }, [base])

  /* Constellation linking lines — visible during intro and closing. */
  const strandGeometry = useMemo(() => {
    const src = shapes[0].pos
    const n = src.length / 3
    const segs = new Float32Array(strandCount * 6)
    let written = 0
    let attempts = 0
    while (written < strandCount && attempts < strandCount * 80) {
      attempts++
      const a = (Math.random() * n) | 0
      const b = (Math.random() * n) | 0
      const dx = src[a * 3] - src[b * 3]
      const dy = src[a * 3 + 1] - src[b * 3 + 1]
      const dz = src[a * 3 + 2] - src[b * 3 + 2]
      const d = Math.hypot(dx, dy, dz)
      if (d > 0.35 && d < 1.3) {
        const o = written * 6
        segs.set([src[a * 3], src[a * 3 + 1], src[a * 3 + 2], src[b * 3], src[b * 3 + 1], src[b * 3 + 2]], o)
        written++
      }
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(segs.slice(0, written * 6), 3))
    return g
  }, [shapes, strandCount])

  const sprite = useMemo(makeSpriteTexture, [])
  const inkColor = useMemo(() => new THREE.Color(INK), [])

  useEffect(() => {
    return () => {
      geometry.dispose()
      strandGeometry.dispose()
      sprite.dispose()
    }
  }, [geometry, strandGeometry, sprite])

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

    if (!(state.scene.background instanceof THREE.Color)) {
      state.scene.background = inkColor.clone()
      state.scene.fog = new THREE.Fog(INK, 9, 24)
    }

    /* Which shapes are we between? */
    let ai = 0
    let bi = 0
    let w = 0
    for (let k = 0; k < MORPHS.length; k++) {
      if (p >= MORPHS[k].b) {
        ai = bi = k + 1
      } else if (p >= MORPHS[k].a) {
        ai = k
        bi = k + 1
        w = smoothstep(MORPHS[k].a, MORPHS[k].b, p)
        break
      } else {
        break
      }
    }
    if (reducedMotion) {
      /* Snap at the midpoint; a brief opacity dip masks each swap. */
      const mid = ai !== bi ? (MORPHS[ai].a + MORPHS[ai].b) / 2 : 0
      if (ai !== bi) {
        if (p >= mid) ai = bi
        else bi = ai
      }
      w = 0
    }

    const A = shapes[ai]
    const B = shapes[bi]
    const amp = (SHAPE_AMPS[ai] * (1 - w) + SHAPE_AMPS[bi] * w) * (reducedMotion ? 0 : 1)
    const damp = reducedMotion ? 1 : Math.min(1, dt * 6)
    const { phases, curPos, curCol } = base

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const ph = phases[i]
      const nx = amp > 0 ? Math.sin(t * 0.5 + ph) * amp : 0
      const ny = amp > 0 ? Math.cos(t * 0.44 + ph * 1.7) * amp : 0
      const nz = amp > 0 ? Math.sin(t * 0.36 + ph * 2.3) * amp : 0
      const tx = A.pos[i3] * (1 - w) + B.pos[i3] * w + nx
      const ty = A.pos[i3 + 1] * (1 - w) + B.pos[i3 + 1] * w + ny
      const tz = A.pos[i3 + 2] * (1 - w) + B.pos[i3 + 2] * w + nz
      curPos[i3] += (tx - curPos[i3]) * damp
      curPos[i3 + 1] += (ty - curPos[i3 + 1]) * damp
      curPos[i3 + 2] += (tz - curPos[i3 + 2]) * damp
      curCol[i3] += (A.col[i3] * (1 - w) + B.col[i3] * w - curCol[i3]) * damp
      curCol[i3 + 1] += (A.col[i3 + 1] * (1 - w) + B.col[i3 + 1] * w - curCol[i3 + 1]) * damp
      curCol[i3 + 2] += (A.col[i3 + 2] * (1 - w) + B.col[i3 + 2] * w - curCol[i3 + 2]) * damp
    }
    ;(geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true
    ;(geometry.attributes.color as THREE.BufferAttribute).needsUpdate = true

    /* Material opacity: reduced-motion swap dips + closing hold. */
    let opacity = 1
    if (reducedMotion) {
      for (const m of MORPHS) {
        const mid = (m.a + m.b) / 2
        opacity = Math.min(opacity, 1 - fadeWindow(p, mid - 0.02, mid - 0.005, mid + 0.005, mid + 0.02) * 0.9)
      }
    }
    if (matRef.current) matRef.current.opacity = opacity

    const strandO = ((1 - smoothstep(0.08, 0.14, p)) + smoothstep(0.9, 0.95, p)) * 0.32
    if (strandMatRef.current) strandMatRef.current.opacity = strandO
    if (strandsRef.current) strandsRef.current.visible = strandO > 0.004

    /* Camera: calm drift, slight dolly over the whole section. */
    const cam = state.camera
    if (reducedMotion) {
      cam.position.set(0, 0.2, 8)
      cam.lookAt(0, 0, 0)
    } else {
      const dolly = smoothstep(0, 1, p) * 0.9
      cam.position.set(
        Math.sin(t * 0.16) * 0.1,
        0.2 + Math.cos(t * 0.12) * 0.08,
        8 - dolly,
      )
      cam.lookAt(0, 0, 0)
      cam.rotation.z += Math.sin(t * 0.1) * 0.012
    }
  })

  return (
    <>
      <points geometry={geometry} frustumCulled={false}>
        <pointsMaterial
          ref={matRef}
          map={sprite}
          size={isMobile ? 0.058 : 0.046}
          sizeAttenuation
          vertexColors
          transparent
          depthWrite={false}
          alphaTest={0.06}
        />
      </points>
      <lineSegments ref={strandsRef} geometry={strandGeometry} frustumCulled={false}>
        <lineBasicMaterial color="#cbb8e8" transparent opacity={0} depthWrite={false} />
      </lineSegments>
    </>
  )
}

/** Fullscreen WebGL canvas for the project constellations (decorative). */
export function ProjectsVisual(props: ProjectsVisualProps) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      frameloop={props.reducedMotion ? 'demand' : 'always'}
      gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
      camera={{ fov: 50, near: 0.1, far: 60, position: [0, 0.2, 8] }}
    >
      <ProjectField {...props} />
    </Canvas>
  )
}
