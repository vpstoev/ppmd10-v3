import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { computeProgress } from '../hg-hero/heroTheme'
import {
  PHASES,
  SECTION_BG_DARK,
  SECTION_BG_LIGHT,
  STREAM_DARK,
  STREAM_LIGHT,
  phaseWeights,
  sectionDarkW,
} from './capabilitiesData'

interface CapabilitiesVisualProps {
  containerRef: React.RefObject<HTMLDivElement | null>
  reducedMotion: boolean
  isMobile: boolean
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

/**
 * Four particle streams — the same material language as the Hero.
 * Positions are recomputed per frame from a single curve family whose
 * parameters are blended between the six phases by scroll progress.
 */
function Streams({ containerRef, reducedMotion, isMobile }: CapabilitiesVisualProps) {
  const invalidate = useThree((s) => s.invalidate)
  const per = isMobile ? 550 : 1500
  const groupRef = useRef<THREE.Group>(null)
  const matRefs = useRef<(THREE.PointsMaterial | null)[]>([null, null, null, null])

  const rand = useMemo(() => {
    return Array.from({ length: 4 }, () => {
      const t = new Float32Array(per)
      const oy = new Float32Array(per)
      const oyQ = new Float32Array(per)
      const oz = new Float32Array(per)
      const ph = new Float32Array(per)
      for (let i = 0; i < per; i++) {
        t[i] = (i + Math.random() * 0.9) / per
        oy[i] = gauss()
        // Quantized lanes — used when the "align" parameter rises.
        oyQ[i] = Math.round(oy[i] * 1.5) / 1.5
        oz[i] = gauss()
        ph[i] = Math.random()
      }
      return { t, oy, oyQ, oz, ph }
    })
  }, [per])

  const geoms = useMemo(() => {
    return Array.from({ length: 4 }, () => {
      const g = new THREE.BufferGeometry()
      g.setAttribute(
        'position',
        new THREE.BufferAttribute(new Float32Array(per * 3), 3).setUsage(THREE.DynamicDrawUsage),
      )
      return g
    })
  }, [per])

  const sprite = useMemo(makeSpriteTexture, [])
  const colors = useMemo(
    () => ({
      bgLight: new THREE.Color(SECTION_BG_LIGHT),
      bgDark: new THREE.Color(SECTION_BG_DARK),
      light: STREAM_LIGHT.map((c) => new THREE.Color(c)),
      dark: STREAM_DARK.map((c) => new THREE.Color(c)),
    }),
    [],
  )

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
    const W = phaseWeights(p)

    // Blend a scalar field across the six phases.
    const num = (key: keyof (typeof PHASES)[0]) => {
      let v = 0
      for (let k = 0; k < 6; k++) v += W[k] * (PHASES[k][key] as number)
      return v
    }
    const arr = (key: 'op' | 'size' | 'pull', s: number) => {
      let v = 0
      for (let k = 0; k < 6; k++) v += W[k] * PHASES[k][key][s]
      return v
    }

    const rot = num('rot')
    const len = num('len') * (isMobile ? 0.42 : 1)
    const ySep = num('ySep') * (isMobile ? 0.8 : 1)
    const yBias = num('yBias')
    const amp = num('amp') * (isMobile ? 0.75 : 1)
    const f1 = num('f1')
    const chaos = num('chaos')
    const spread = num('spread')
    const align = num('align')
    const conv = num('conv')
    const flow = num('flow')
    const zAmp = num('zAmp')

    const darkW = sectionDarkW(p)
    if (!(state.scene.background instanceof THREE.Color)) {
      state.scene.background = colors.bgLight.clone()
    }
    ;(state.scene.background as THREE.Color).copy(colors.bgLight).lerp(colors.bgDark, darkW)

    for (let s = 0; s < 4; s++) {
      const g = geoms[s]
      const pos = (g.attributes.position as THREE.BufferAttribute).array as Float32Array
      const { t, oy, oyQ, oz, ph } = rand[s]
      const pull = arr('pull', s)
      const ys = ((s - 1.5) / 1.5) * ySep * (1 - pull) + yBias
      for (let i = 0; i < per; i++) {
        const ti = t[i]
        const i3 = i * 3
        const wave = Math.sin(ti * f1 * TAU + ph[i] * chaos * TAU + time * flow + s * 0.9) * amp
        const braid = Math.sin(ti * 16.3 + s * 1.5708 + time * 0.35) * 0.95
        const oyE = oy[i] * (1 - align) + oyQ[i] * align
        pos[i3] = (ti - 0.5) * len
        pos[i3 + 1] = (1 - conv) * (ys + wave) + conv * (ys * 0.45 + braid) + oyE * spread
        pos[i3 + 2] = Math.sin(ti * 4.2 + s * 1.3 + time * 0.25) * zAmp * 0.5 + oz[i] * (spread * 1.6 + 0.15)
      }
      ;(g.attributes.position as THREE.BufferAttribute).needsUpdate = true

      const mat = matRefs.current[s]
      if (mat) {
        mat.opacity = arr('op', s)
        mat.size = arr('size', s) * (isMobile ? 1.25 : 1)
        mat.color.copy(colors.light[s]).lerp(colors.dark[s], darkW)
      }
    }

    if (groupRef.current) {
      groupRef.current.rotation.z = rot
      groupRef.current.position.y = reducedMotion ? 0 : Math.sin(time * 0.1) * 0.12
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
            size={0.05}
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

/** Fullscreen WebGL canvas for the capability streams (decorative only). */
export function CapabilitiesVisual(props: CapabilitiesVisualProps) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      frameloop={props.reducedMotion ? 'demand' : 'always'}
      gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
      camera={{ fov: 50, near: 0.1, far: 60, position: [0, 0, 9] }}
    >
      <Streams {...props} />
    </Canvas>
  )
}
