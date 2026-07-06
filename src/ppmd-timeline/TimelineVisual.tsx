import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { computeProgress, lerp, smoothstep } from '../hg-hero/heroTheme'
import {
  INK,
  PATH_PHASES,
  PATH_Z_LENGTH,
  pathX,
  pathY,
  pathZ,
  timelineWeights,
  TL_CHAMPAGNE,
  TL_CORAL,
  TL_ICE,
  TL_VIOLET,
  TL_WHITE,
} from './timelineData'
import type { PathPhase } from './timelineTypes'

interface TimelineVisualProps {
  containerRef: React.RefObject<HTMLDivElement | null>
  reducedMotion: boolean
  isMobile: boolean
}

/** Per-period particle palettes along the path (u-segment → colours). */
const SEGMENT_PALETTES: string[][] = [
  [TL_WHITE, TL_CHAMPAGNE],
  [TL_CORAL, TL_WHITE],
  [TL_VIOLET, TL_WHITE],
  [TL_ICE, TL_WHITE],
  [TL_CORAL, TL_VIOLET],
  [TL_CORAL, TL_VIOLET, TL_ICE, TL_CHAMPAGNE],
]

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

function segmentColor(u: number): THREE.Color {
  const soft = Math.floor(
    Math.min(5.999, Math.max(0, u * 6 + (Math.random() - 0.5) * 0.7)),
  )
  const palette = SEGMENT_PALETTES[soft]
  const c = new THREE.Color(palette[(Math.random() * palette.length) | 0])
  const b = 0.8 + Math.random() * 0.3
  c.r = Math.min(1, c.r * b)
  c.g = Math.min(1, c.g * b)
  c.b = Math.min(1, c.b * b)
  return c
}

/**
 * One continuous particle "time path" bending through space from the
 * foreground into depth, with strands and a soft glow ribbon. The path
 * geometry is static in world space — the camera travels along it,
 * while phase-blended parameters reshape the local scatter.
 */
function TimePath({ containerRef, reducedMotion, isMobile }: TimelineVisualProps) {
  const invalidate = useThree((s) => s.invalidate)
  const count = isMobile ? 3000 : 9000
  const glowCount = isMobile ? 200 : 500
  const strandCount = isMobile ? 70 : 160
  const matRef = useRef<THREE.PointsMaterial>(null)

  const attrs = useMemo(() => {
    const u = new Float32Array(count)
    const ox = new Float32Array(count)
    const oxQ = new Float32Array(count)
    const oy = new Float32Array(count)
    const oyQ = new Float32Array(count)
    const oz = new Float32Array(count)
    const ph = new Float32Array(count)
    const colors = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      u[i] = (i + Math.random() * 0.9) / count
      ox[i] = gauss()
      oxQ[i] = Math.round(ox[i] * 1.6) / 1.6
      oy[i] = gauss()
      oyQ[i] = Math.round(oy[i] * 1.6) / 1.6
      oz[i] = gauss()
      ph[i] = Math.random() * Math.PI * 2
      const c = segmentColor(u[i])
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }
    return { u, ox, oxQ, oy, oyQ, oz, ph, colors }
  }, [count])

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(count * 3), 3).setUsage(THREE.DynamicDrawUsage),
    )
    g.setAttribute('color', new THREE.BufferAttribute(attrs.colors, 3))
    return g
  }, [count, attrs])

  /* Soft glow ribbon hugging the spine (static). */
  const glowGeometry = useMemo(() => {
    const pos = new Float32Array(glowCount * 3)
    const col = new Float32Array(glowCount * 3)
    for (let i = 0; i < glowCount; i++) {
      const u = (i + Math.random()) / glowCount
      pos[i * 3] = pathX(u) + gauss() * 0.14
      pos[i * 3 + 1] = pathY(u) + gauss() * 0.12
      pos[i * 3 + 2] = pathZ(u)
      const c = segmentColor(u)
      col[i * 3] = c.r
      col[i * 3 + 1] = c.g
      col[i * 3 + 2] = c.b
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('color', new THREE.BufferAttribute(col, 3))
    return g
  }, [glowCount])

  /* Short flowing strands along the path (static). */
  const strandGeometry = useMemo(() => {
    const pos = new Float32Array(strandCount * 6)
    const col = new Float32Array(strandCount * 6)
    for (let i = 0; i < strandCount; i++) {
      const u = Math.random() * 0.98
      const du = 0.004 + Math.random() * 0.008
      const lx = gauss() * 0.3
      const ly = gauss() * 0.25
      const o = i * 6
      pos[o] = pathX(u) + lx
      pos[o + 1] = pathY(u) + ly
      pos[o + 2] = pathZ(u)
      pos[o + 3] = pathX(u + du) + lx * 0.9
      pos[o + 4] = pathY(u + du) + ly * 0.9
      pos[o + 5] = pathZ(u + du)
      const c = segmentColor(u)
      for (let v = 0; v < 2; v++) {
        col[o + v * 3] = c.r
        col[o + v * 3 + 1] = c.g
        col[o + v * 3 + 2] = c.b
      }
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('color', new THREE.BufferAttribute(col, 3))
    return g
  }, [strandCount])

  const sprite = useMemo(makeSpriteTexture, [])
  const inkColor = useMemo(() => new THREE.Color(INK), [])

  useEffect(() => {
    return () => {
      geometry.dispose()
      glowGeometry.dispose()
      strandGeometry.dispose()
      sprite.dispose()
    }
  }, [geometry, glowGeometry, strandGeometry, sprite])

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
    const W = timelineWeights(p)

    /* Constant deep-ink base + fog for depth (also hides the path's end). */
    if (!(state.scene.background instanceof THREE.Color)) {
      state.scene.background = inkColor.clone()
      state.scene.fog = new THREE.Fog(INK, 7, 26)
    }

    const num = (key: keyof PathPhase) => {
      let v = 0
      for (let k = 0; k < PATH_PHASES.length; k++) v += W[k] * PATH_PHASES[k][key]
      return v
    }
    const spread = num('spread') * (isMobile ? 0.75 : 1)
    const align = num('align')
    const wobble = num('wobble')
    const width = num('width')
    const split = num('split')
    const flow = num('flow')

    const { u, ox, oxQ, oy, oyQ, oz, ph } = attrs
    const pos = (geometry.attributes.position as THREE.BufferAttribute).array as Float32Array
    for (let i = 0; i < count; i++) {
      const ui = u[i]
      const i3 = i * 3
      const oxE = ox[i] * (1 - align) + oxQ[i] * align
      const oyE = oy[i] * (1 - align) + oyQ[i] * align
      const splitOff = split * Math.sign(ox[i]) * 0.8 * (0.5 + 0.5 * Math.sin(ui * 24 + 1))
      const wob = Math.sin(time * 1.2 * flow + ph[i]) * wobble
      pos[i3] = pathX(ui) + oxE * spread * width + splitOff + wob
      pos[i3 + 1] = pathY(ui) + oyE * spread * width * 0.8 + Math.cos(time * flow + ph[i] * 1.7) * wobble
      pos[i3 + 2] = pathZ(ui) + oz[i] * 0.35
    }
    ;(geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true

    /* Camera travels along the time path. */
    const cam = state.camera
    if (reducedMotion) {
      cam.position.set(pathX(0.02) * 0.6, pathY(0.02) * 0.6 + 0.4, 6)
      cam.lookAt(pathX(0.06), pathY(0.06), pathZ(0.06))
    } else {
      const travel = smoothstep(0.04, 0.96, p)
      const zSpan = isMobile ? 40 : 58
      const cz = 6 - travel * zSpan
      const uc = Math.min(1, Math.max(0, (4 - cz) / PATH_Z_LENGTH))
      const cx = pathX(uc) * 0.85 + Math.sin(time * 0.14) * 0.08
      const cy = pathY(uc) * 0.85 + 0.35 + Math.cos(time * 0.11) * 0.06
      cam.position.set(cx, cy, cz)
      const ua = Math.min(1, uc + 0.05)
      cam.lookAt(pathX(ua), pathY(ua), pathZ(ua))
      cam.rotation.z += Math.sin(time * 0.1) * 0.015
    }

    if (matRef.current) {
      /* Slightly quieter during the intro so the title reads first. */
      matRef.current.opacity = lerp(0.75, 1, smoothstep(0.05, 0.14, p))
    }
  })

  return (
    <>
      <points geometry={geometry} frustumCulled={false}>
        <pointsMaterial
          ref={matRef}
          map={sprite}
          size={isMobile ? 0.055 : 0.045}
          sizeAttenuation
          vertexColors
          transparent
          depthWrite={false}
          alphaTest={0.06}
        />
      </points>
      <points geometry={glowGeometry} frustumCulled={false}>
        <pointsMaterial
          map={sprite}
          size={0.7}
          sizeAttenuation
          vertexColors
          transparent
          opacity={0.05}
          depthWrite={false}
        />
      </points>
      <lineSegments geometry={strandGeometry} frustumCulled={false}>
        <lineBasicMaterial vertexColors transparent opacity={0.26} depthWrite={false} />
      </lineSegments>
    </>
  )
}

/** Fullscreen WebGL canvas for the time path (decorative only). */
export function TimelineVisual(props: TimelineVisualProps) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      frameloop={props.reducedMotion ? 'demand' : 'always'}
      gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
      camera={{ fov: 50, near: 0.1, far: 80, position: [0, 0.4, 6] }}
    >
      <TimePath {...props} />
    </Canvas>
  )
}
