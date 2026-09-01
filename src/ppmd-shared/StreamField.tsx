/**
 * Generic phase-blended particle stream field — the same visual language
 * as the approved capability section, reused by Teams & People and
 * Current Focus so each new section stays low-cost and consistent.
 */
import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { computeProgress, smoothstep } from '../hg-hero/heroTheme'

export interface FieldPhase {
  /** Vertical separation between streams. */
  sep: number
  amp: number
  f1: number
  chaos: number
  spread: number
  align: number
  /** 0..1 — pull everything toward the centre point. */
  pull: number
  flow: number
  /** Opacity per stream. */
  op: number[]
  /**
   * Optional behaviour weights, 0..1. They re-target the SAME particles
   * into a different spatial system while every rendering property —
   * sprite, size, colour, depth, easing — stays shared, so the three
   * systems read as one visual language behaving differently. Omitted
   * (or 0) leaves the plain stream geometry untouched.
   */
  /** Trajectories that converge briefly, with sparse milestone nodes. */
  orchestration?: number
  /** Irregular lanes resolving into aligned structure through junctions. */
  structure?: number
  /** A spatial matrix traversed by a slow scan that lifts what it passes. */
  validation?: number
  /**
   * Regions where the composition's content sits. Particles inside one are
   * pushed back in depth rather than removed, so with fog enabled they
   * recede toward the background colour on a Gaussian falloff — the field
   * carries on behind the content, it simply goes quiet there, with no
   * edge for the eye to catch.
   */
  clear?: ClearZone[]
}

/** Centre, radii and strength of a content clear zone, in world units. */
export interface ClearZone {
  x: number
  y: number
  rx: number
  ry: number
  /** 0..1 — how far back the zone pushes what sits inside it. */
  s: number
}

interface StreamFieldProps {
  containerRef: React.RefObject<HTMLDivElement | null>
  reducedMotion: boolean
  isMobile: boolean
  /** One colour per stream. */
  colors: string[]
  phases: FieldPhase[]
  /** Normalized phase weights for a progress value. */
  weights: (p: number) => number[]
  background?: string
  /**
   * Particles per stream, relative to the default. Sections whose phases
   * spread the field across the whole frame need more of them to hold the
   * same perceived density; callers that don't pass it are unaffected.
   */
  density?: number
  /**
   * Linear depth fog in the background colour. Required for clear zones to
   * read as attenuation rather than as displacement; off by default so
   * existing callers keep their exact look.
   */
  depthFog?: boolean
}

const TAU = Math.PI * 2

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

function Field({
  containerRef,
  reducedMotion,
  isMobile,
  colors,
  phases,
  weights,
  background = '#07070c',
  density = 1,
  depthFog = false,
}: StreamFieldProps) {
  const invalidate = useThree((s) => s.invalidate)
  const streams = colors.length
  const per = Math.round((isMobile ? 450 : 1100) * (isMobile ? 1 : density))
  const matRefs = useRef<(THREE.PointsMaterial | null)[]>([])
  const groupRef = useRef<THREE.Group>(null)

  const rand = useMemo(() => {
    return Array.from({ length: streams }, () => {
      const t = new Float32Array(per)
      const oy = new Float32Array(per)
      const oyQ = new Float32Array(per)
      const oz = new Float32Array(per)
      const ph = new Float32Array(per)
      for (let i = 0; i < per; i++) {
        t[i] = (i + Math.random() * 0.9) / per
        oy[i] = gauss()
        oyQ[i] = Math.round(oy[i] * 1.5) / 1.5
        oz[i] = gauss()
        ph[i] = Math.random()
      }
      return { t, oy, oyQ, oz, ph }
    })
  }, [streams, per])

  const geoms = useMemo(() => {
    return Array.from({ length: streams }, () => {
      const g = new THREE.BufferGeometry()
      g.setAttribute(
        'position',
        new THREE.BufferAttribute(new Float32Array(per * 3), 3).setUsage(THREE.DynamicDrawUsage),
      )
      return g
    })
  }, [streams, per])

  const sprite = useMemo(makeSpriteTexture, [])
  const bg = useMemo(() => new THREE.Color(background), [background])
  const streamColors = useMemo(() => colors.map((c) => new THREE.Color(c)), [colors])

  useEffect(() => {
    return () => {
      geoms.forEach((g) => g.dispose())
      sprite.dispose()
    }
  }, [geoms, sprite])

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

  useFrame((state) => {
    const p = computeProgress(containerRef.current)
    const time = reducedMotion ? 0 : state.clock.elapsedTime
    const W = weights(p)

    if (!(state.scene.background instanceof THREE.Color)) {
      state.scene.background = bg.clone()
      if (depthFog) state.scene.fog = new THREE.Fog(bg, 7.5, 21)
    }

    const num = (
      key: keyof Omit<
        FieldPhase,
        'op' | 'orchestration' | 'structure' | 'validation' | 'clear'
      >,
    ) => {
      let v = 0
      for (let k = 0; k < phases.length; k++) v += W[k] * phases[k][key]
      return v
    }
    const opt = (key: 'orchestration' | 'structure' | 'validation') => {
      let v = 0
      for (let k = 0; k < phases.length; k++) v += W[k] * (phases[k][key] ?? 0)
      return v
    }
    const opacity = (s: number) => {
      let v = 0
      for (let k = 0; k < phases.length; k++) v += W[k] * (phases[k].op[s] ?? 0)
      return v
    }

    const sep = num('sep') * (isMobile ? 0.8 : 1)
    const amp = num('amp') * (isMobile ? 0.75 : 1)
    const f1 = num('f1')
    const chaos = num('chaos')
    const spread = num('spread')
    const align = num('align')
    const pull = num('pull')
    const flow = num('flow')
    const len = isMobile ? 8.5 : 20
    const keep = 1 - pull * 0.85

    /* Behaviour weights — how far the field has left the plain stream. */
    const wOrch = opt('orchestration')
    const wStruct = opt('structure')
    const wValid = opt('validation')
    const behaviour = Math.min(1, wOrch + wStruct + wValid)
    /* Density and reach are trimmed on small screens; the metaphor is the
       same, there is simply less of it. */
    const spanY = (isMobile ? 2.1 : 3.6) * (1 - pull * 0.6)
    const cell = isMobile ? 0.62 : 0.52
    /* One slow traversal shared by every stream, so the scan reads as a
       single sweep across the whole field rather than four of them. Eased
       as a ping-pong so it never jumps back to the start. */
    const scanX = Math.sin(time * 0.085) * len * 0.4
    const q = (v: number, step: number) => Math.round(v / step) * step

    /* Content clear zones for whichever phases are currently weighted.
       Zones are authored against a 945px-tall viewport. World units per
       pixel are H / viewportHeight, so scaling every zone by that ratio
       keeps them locked to the DOM composition at any window size. */
    const zk = 945 / Math.max(1, state.size.height)
    const zones: Array<[number, number, number, number, number]> = []
    for (let k = 0; k < phases.length; k++) {
      const cz = phases[k].clear
      if (!cz || W[k] <= 0.002) continue
      for (const z of cz) {
        zones.push([z.x * zk, z.y * zk, z.rx * zk, z.ry * zk, z.s * W[k]])
      }
    }

    for (let s = 0; s < streams; s++) {
      const g = geoms[s]
      const pos = (g.attributes.position as THREE.BufferAttribute).array as Float32Array
      const { t, oy, oyQ, oz, ph } = rand[s]
      const ys = ((s - (streams - 1) / 2) / Math.max(1, (streams - 1) / 2)) * sep
      /* Lane centre for the behaviour systems, spread over the full frame
         instead of the narrow band the plain stream occupies. */
      const laneY = ((s - (streams - 1) / 2) / Math.max(1, (streams - 1) / 2)) * spanY * 0.62
      const dir = s % 2 === 0 ? 1 : -1
      for (let i = 0; i < per; i++) {
        const ti = t[i]
        const i3 = i * 3
        const wave = Math.sin(ti * f1 * TAU + ph[i] * chaos * TAU + time * flow + s * 0.9) * amp
        const oyE = oy[i] * (1 - align) + oyQ[i] * align
        let x = (ti - 0.5) * len * keep
        let y = (ys + wave + oyE * spread) * keep
        let z = Math.sin(ti * 4.2 + s * 1.3 + time * 0.25) * 0.8 + oz[i] * (spread + 0.15)

        if (behaviour > 0.001) {
          let bx = 0
          let by = 0
          let bz = 0
          /* Three depth strata, taken from a stable per-particle random so
             they cost nothing: a slow soft majority behind, the semantic
             structure in the middle, and a very sparse faster layer in
             front. Structure rather than extra particles. */
          const lt = ph[i]
          const lz = lt < 0.45 ? -1.5 : lt > 0.9 ? 1.15 : 0
          const lspeed = lt < 0.45 ? 0.62 : lt > 0.9 ? 1.34 : 1

          if (wOrch > 0.001) {
            /* ORCHESTRATION — initiatives running in from off-frame that
               draw together and separate again. Each stream crosses at a
               DIFFERENT point, so the scene reads as a series of local
               dependencies rather than one decorative pinch, and a second
               weaker crossing further along keeps them interleaving. */
            let u = (ti + time * 0.013 * lspeed * (1 + s * 0.12)) % 1
            const node = ph[i] > 0.9
            if (node) u = q(u, 1 / 6)
            const cross = -0.19 + (s % 4) * 0.13
            const o1 = u - 0.5 - cross
            const o2 = u - 0.5 + cross * 0.8
            /* ~0 at a crossing, 1 away from it */
            const conv =
              (1 - 0.82 * Math.exp(-(o1 * o1) / 0.02)) *
              (1 - 0.4 * Math.exp(-(o2 * o2) / 0.014))
            const ox = (u - 0.5) * len * 1.06
            const oyy =
              laneY * conv +
              Math.sin(u * TAU * 0.62 + s * 1.4) * 0.4 * conv +
              (node ? 0 : oy[i] * 0.15 * (0.3 + conv))
            const ozz = oz[i] * 0.45 + Math.sin(u * 3.1 + s) * 0.45
            bx += wOrch * ox
            by += wOrch * oyy
            bz += wOrch * ozz
          }

          if (wStruct > 0.001) {
            /* FLOW ARCHITECTURE — complexity resolving into repeatable
               structure. Entry is wide and irregular; alignment onto lanes
               builds across the frame; two junctions split part of the flow
               to neighbouring lanes; and a gentle reparametrization bunches
               particles into a procedural rhythm so density varies along
               the run instead of reading as uniform bands. */
            const raw0 = (ti + time * 0.011 * lspeed) % 1
            const u = raw0 + 0.16 * Math.sin(raw0 * TAU * 2) * (1 / TAU)
            const order = smoothstep(0.1, 0.72, u)
            /* the field starts genuinely wide and narrows as it resolves */
            const raw = laneY * (1 + 0.5 * (1 - order)) + oy[i] * (1.15 - 0.42 * order)
            const lane = q(raw, cell * 1.5)
            let yy = raw * (1 - order) + lane * order
            const j1 = smoothstep(0.4, 0.52, u) * (ph[i] > 0.72 ? 1 : 0)
            const j2 = smoothstep(0.68, 0.8, u) * (ph[i] > 0.34 && ph[i] < 0.5 ? 1 : 0)
            yy += (j1 - j2) * dir * cell * 1.5
            bx += wStruct * ((u - 0.5) * len * 1.02)
            by += wStruct * yy
            bz += wStruct * (oz[i] * (0.6 - 0.35 * order) + Math.sin(u * 2.2 + s) * 0.32)
          }

          if (wValid > 0.001) {
            /* VALIDATION FIELD — inspect, validate, confirm.
               The whole field DRIFTS: every particle carries a continuous
               translation whose rate comes from its depth stratum, so the
               background creeps, the midground moves slowly and the sparse
               foreground leads. Nothing is frozen. The drift wraps at
               ±span/2, which sits outside the visible frame, so the seam is
               never on screen and there is no reset to see.
               Only part of the field is a full lattice: a third quantizes
               on y alone and a third on x alone, giving sparse horizontal
               and vertical reference structures instead of a rectangle. */
            const span = len * 1.02
            const kind = ph[i] * 3
            const dx = time * 0.05 * lspeed
            const dy = time * 0.018 * lspeed
            let gx = (ti - 0.5) * span
            let gy = laneY * 1.18 + oy[i] * 1.15
            if (kind < 2) gx = q(gx, cell * 2) /* nodes + vertical refs */
            if (kind >= 1) gy = q(gy, cell) /* nodes + horizontal refs */
            gx += dx
            gx = ((((gx + span / 2) % span) + span) % span) - span / 2
            gy += Math.sin(dy + ph[i] * 0.6) * 0.5
            /* The sweep is a very slightly tilted plane, so it crosses the
               field on a diagonal rather than as an upright bar. */
            const d = gx - scanX + gy * 0.16
            const act = Math.exp(-(d * d) / 1.1)
            const confirmed = Math.exp(-(d * d) / 26) * 0.55
            const settle = 0.26 * (1 - Math.max(act, confirmed))
            bx += wValid * (gx + oz[i] * settle)
            by += wValid * (gy + oy[i] * settle + Math.sin(d * 0.9) * 0.1 * act)
            bz += wValid * (oz[i] * 0.35 + act * 0.8 + confirmed * 0.25)
          }

          /* Parity term: one shared, equal-magnitude breath applied to all
             three systems, so none of them reads as more alive than the
             others. The metaphors differ; the level of life does not. */
          const br = 0.055
          bx += behaviour * Math.sin(time * 0.19 + ph[i] * TAU) * br
          by += behaviour * Math.cos(time * 0.16 + ph[i] * TAU * 1.6) * br
          bz += behaviour * Math.sin(time * 0.13 + ph[i] * TAU * 2.2) * br * 1.6

          bz += lz

          x = x * (1 - behaviour) + bx
          y = y * (1 - behaviour) + by
          z = z * (1 - behaviour) + bz
        }

        /* Content clear zones — Gaussian, so there is no edge anywhere.
           The particle keeps its place in the composition and simply
           recedes; the fog does the rest. */
        if (zones.length > 0) {
          let att = 0
          for (let k = 0; k < zones.length; k++) {
            const zn = zones[k]
            const dx = (x - zn[0]) / zn[2]
            const dy = (y - zn[1]) / zn[3]
            const a = zn[4] * Math.exp(-(dx * dx + dy * dy))
            if (a > att) att = a
          }
          if (att > 0.001) z -= att * 11.5
        }

        pos[i3] = x
        pos[i3 + 1] = y
        pos[i3 + 2] = z
      }
      ;(g.attributes.position as THREE.BufferAttribute).needsUpdate = true
      const mat = matRefs.current[s]
      if (mat) {
        mat.opacity = opacity(s)
        mat.color.copy(streamColors[s])
      }
    }

    if (groupRef.current && !reducedMotion) {
      groupRef.current.position.y = Math.sin(time * 0.1) * 0.12
      groupRef.current.rotation.z = Math.sin(time * 0.08) * 0.03
    }
  })

  return (
    <group ref={groupRef}>
      {geoms.map((g, s) => (
        <points key={s} geometry={g} frustumCulled={false}>
          <pointsMaterial
            ref={(m) => {
              matRefs.current[s] = m
            }}
            map={sprite}
            size={isMobile ? 0.062 : 0.05}
            sizeAttenuation
            transparent
            depthWrite={false}
            alphaTest={0.06}
          />
        </points>
      ))}
    </group>
  )
}

/** Fullscreen decorative stream-field canvas. */
export function StreamField(props: StreamFieldProps) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      frameloop={props.reducedMotion ? 'demand' : 'always'}
      gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
      camera={{ fov: 50, near: 0.1, far: 60, position: [0, 0, 9] }}
    >
      <Field {...props} />
    </Canvas>
  )
}
