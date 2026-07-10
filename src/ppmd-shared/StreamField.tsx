/**
 * Generic phase-blended particle stream field — the same visual language
 * as the approved capability section, reused by Teams & People and
 * Current Focus so each new section stays low-cost and consistent.
 */
import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { computeProgress } from '../hg-hero/heroTheme'

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
}: StreamFieldProps) {
  const invalidate = useThree((s) => s.invalidate)
  const streams = colors.length
  const per = isMobile ? 450 : 1100
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
    }

    const num = (key: keyof Omit<FieldPhase, 'op'>) => {
      let v = 0
      for (let k = 0; k < phases.length; k++) v += W[k] * phases[k][key]
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

    for (let s = 0; s < streams; s++) {
      const g = geoms[s]
      const pos = (g.attributes.position as THREE.BufferAttribute).array as Float32Array
      const { t, oy, oyQ, oz, ph } = rand[s]
      const ys = ((s - (streams - 1) / 2) / Math.max(1, (streams - 1) / 2)) * sep
      for (let i = 0; i < per; i++) {
        const ti = t[i]
        const i3 = i * 3
        const wave = Math.sin(ti * f1 * TAU + ph[i] * chaos * TAU + time * flow + s * 0.9) * amp
        const oyE = oy[i] * (1 - align) + oyQ[i] * align
        pos[i3] = (ti - 0.5) * len * keep
        pos[i3 + 1] = (ys + wave + oyE * spread) * keep
        pos[i3 + 2] = Math.sin(ti * 4.2 + s * 1.3 + time * 0.25) * 0.8 + oz[i] * (spread + 0.15)
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
