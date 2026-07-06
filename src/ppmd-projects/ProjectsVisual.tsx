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

/** 01 — 3G Sunset: a large ring deactivates, energy exits as a path. */
function shapeRing(n: number): Shape {
  const pos = new Float32Array(n * 3)
  const col = new Float32Array(n * 3)
  const paint = makePicker([
    [P_CHAMPAGNE, 2.2],
    [P_CORAL, 1.6],
    [P_WHITE, 1.2],
  ])
  const cx = 2.4
  for (let i = 0; i < n; i++) {
    const i3 = i * 3
    if (i % 100 < 70) {
      const a = Math.random() * Math.PI * 2
      const r = 2.6 + gauss() * 0.18
      pos[i3] = cx + Math.cos(a) * r
      pos[i3 + 1] = Math.sin(a) * r * 0.82
      pos[i3 + 2] = gauss() * 0.35
    } else {
      const t = Math.random()
      pos[i3] = cx + 2.3 + t * 5.4 + gauss() * 0.2
      pos[i3 + 1] = -0.4 - t * 1.3 + gauss() * 0.18
      pos[i3 + 2] = t * 2.6 + gauss() * 0.2
    }
    paint(col, i3)
  }
  return { pos, col }
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

/** 03 — Voice over Wi-Fi: soft ripple arcs connecting across space. */
function shapeArcs(n: number): Shape {
  const pos = new Float32Array(n * 3)
  const col = new Float32Array(n * 3)
  const paint = makePicker([
    [P_ICE, 2.6],
    [P_WHITE, 1.8],
    [P_VIOLET, 0.5],
  ])
  const centers = [
    [3.2, 1.4, -0.5],
    [-0.6, -2.0, 0.4],
    [1.4, 0.2, -1.6],
  ]
  const radii = [1.4, 2.4, 3.4]
  for (let i = 0; i < n; i++) {
    const i3 = i * 3
    const c = centers[i % 3]
    const r = radii[(i / 3) % 3 | 0] + gauss() * 0.12
    const a = Math.random() * Math.PI * 2
    pos[i3] = c[0] + Math.cos(a) * r
    pos[i3 + 1] = c[1] + Math.sin(a) * r * 0.8
    pos[i3 + 2] = c[2] + gauss() * 0.3
    paint(col, i3)
  }
  return { pos, col }
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

/** 05 — Customs: precise paths through one controlled central gate. */
function shapePaths(n: number): Shape {
  const pos = new Float32Array(n * 3)
  const col = new Float32Array(n * 3)
  const paint = makePicker([
    [P_CHAMPAGNE, 2],
    [P_WHITE, 2],
    [P_CORAL, 0.9],
  ])
  const cx = 1.9
  for (let i = 0; i < n; i++) {
    const i3 = i * 3
    if (i % 100 < 82) {
      const k = i % 5
      const th = (k / 5) * Math.PI * 2 + 0.3
      const dx = Math.cos(th)
      const dy = Math.sin(th) * 0.7
      const t = Math.random() * 2 - 1 /* -1..1 through the centre */
      const bend = Math.sin((t + 1) * Math.PI * 0.5) * 0.45 * (k % 2 ? 1 : -1)
      pos[i3] = cx + dx * t * 7.5 - dy * bend + gauss() * 0.07
      pos[i3 + 1] = dy * t * 7.5 + dx * bend * 0.7 + gauss() * 0.07
      pos[i3 + 2] = (k - 2) * 0.35 + gauss() * 0.28
    } else {
      /* the central gate */
      const a = Math.random() * Math.PI * 2
      const r = 0.9 + gauss() * 0.07
      pos[i3] = cx + Math.cos(a) * r
      pos[i3 + 1] = Math.sin(a) * r * 0.9
      pos[i3 + 2] = gauss() * 0.2
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
    return [
      shapeConstellations(count),
      shapeRing(count),
      shapeWaves(count),
      shapeArcs(count),
      shapeLattice(count),
      shapePaths(count),
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
