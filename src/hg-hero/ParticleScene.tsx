import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import {
  DARK_BG,
  LIGHT_BG,
  SCENE,
  computeProgress,
  fadeWindow,
  lerp,
  smoothstep,
} from './heroTheme'
import {
  buildParticleColors,
  createBackgroundDrift,
  createDispersedField,
  createOrganicField,
  createStrandSegments,
  createStreamsField,
  createTenShape,
  createTunnelField,
} from './particleShapes'

interface ParticleSceneProps {
  containerRef: React.RefObject<HTMLDivElement | null>
  reducedMotion: boolean
  isMobile: boolean
  count: number
}

/** Soft round sprite generated locally — keeps points from looking square. */
function makeSpriteTexture(): THREE.Texture {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (ctx) {
    // Hard bright core with a short falloff — soft halos read as grey blur.
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

function ParticleField({ containerRef, reducedMotion, isMobile, count }: ParticleSceneProps) {
  const invalidate = useThree((s) => s.invalidate)
  const pointsMatRef = useRef<THREE.PointsMaterial>(null)
  const strandMatRef = useRef<THREE.LineBasicMaterial>(null)
  const strandsRef = useRef<THREE.LineSegments>(null)
  const bgRef = useRef<THREE.Points>(null)
  const bgMatRef = useRef<THREE.PointsMaterial>(null)
  const lastDark = useRef(-1)

  // Re-sample the "10" once webfonts are ready so the glyphs are on-brand.
  const [fontsReady, setFontsReady] = useState(false)
  useEffect(() => {
    let live = true
    document.fonts?.ready.then(() => {
      if (live) setFontsReady(true)
    })
    return () => {
      live = false
    }
  }, [])

  // World-space placement of the "10" derived from the camera frustum at z=8.
  // Centred, ~88% of the viewport width — the number IS the environment.
  const tenPlacement = useMemo(() => {
    const visH = 2 * 8 * Math.tan((50 * Math.PI) / 360)
    const visW = visH * (window.innerWidth / Math.max(1, window.innerHeight))
    const width = isMobile ? Math.min(visW * 0.94, 6.4) : Math.min(visW * 0.88, 12)
    return { width, offsetX: 0, offsetY: 0, visW, visH }
  }, [isMobile])

  // Stable per-particle data (never regenerated after mount).
  const base = useMemo(() => {
    const organic = createOrganicField(count, isMobile)
    const colors = buildParticleColors(count)
    const phases = new Float32Array(count)
    for (let i = 0; i < count; i++) phases[i] = Math.random() * Math.PI * 2
    return {
      organic,
      colors,
      phases,
      cur: Float32Array.from(organic),
      curColor: Float32Array.from(colors.light),
    }
  }, [count, isMobile])

  // Shape targets that depend on the sampled "10".
  // eslint-disable-next-line react-hooks/exhaustive-deps -- fontsReady triggers a re-sample on purpose
  const shapes = useMemo(() => {
    const ten = createTenShape(count, tenPlacement.width, tenPlacement.offsetX, tenPlacement.offsetY)
    const streams = createStreamsField(count, tenPlacement.visW, tenPlacement.visH, isMobile)
    const tunnel = createTunnelField(count, ten.zeroCenterX, ten.zeroCenterY)
    const dispersed = createDispersedField(count, ten.zeroCenterX, ten.zeroCenterY)
    const strands = createStrandSegments(ten.positions, isMobile ? 110 : 220)
    // Pull weights: strongest at the inner edge of the "0" so its rim can
    // drift toward the camera before the journey begins.
    const pull = new Float32Array(count)
    const rZero = ten.height * 0.55
    for (let i = 0; i < count; i++) {
      const dx = ten.positions[i * 3] - ten.zeroCenterX
      const dy = ten.positions[i * 3 + 1] - ten.zeroCenterY
      const r = Math.hypot(dx, dy)
      if (r < rZero) pull[i] = 1 - r / rZero
    }
    return { ten, streams, tunnel, dispersed, strands, pull }
  }, [count, tenPlacement, isMobile, fontsReady])

  const bgDrift = useMemo(() => createBackgroundDrift(isMobile ? 250 : 700), [isMobile])
  const bgGeometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(bgDrift, 3))
    return g
  }, [bgDrift])

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(base.cur, 3).setUsage(THREE.DynamicDrawUsage))
    g.setAttribute('color', new THREE.BufferAttribute(base.curColor, 3).setUsage(THREE.DynamicDrawUsage))
    return g
  }, [base])

  const strandGeometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(shapes.strands, 3))
    return g
  }, [shapes])

  const sprite = useMemo(makeSpriteTexture, [])
  const bgLight = useMemo(() => new THREE.Color(LIGHT_BG), [])
  const bgDark = useMemo(() => new THREE.Color(DARK_BG), [])

  useEffect(() => {
    return () => {
      geometry.dispose()
    }
  }, [geometry])
  useEffect(() => {
    return () => {
      strandGeometry.dispose()
    }
  }, [strandGeometry])
  useEffect(() => {
    return () => {
      bgGeometry.dispose()
    }
  }, [bgGeometry])
  useEffect(() => {
    return () => {
      sprite.dispose()
    }
  }, [sprite])

  // In reduced-motion mode we only render on scroll (frameloop="demand").
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
    const t = state.clock.elapsedTime
    const { organic, colors, phases, cur, curColor } = base
    const { ten, streams, tunnel, dispersed, pull } = shapes

    /* ── shape blending schedule ── */
    let A: Float32Array = organic
    let B: Float32Array = organic
    let w = 0
    let ampA = 0.1
    let ampB = 0.1
    let tenPresence = 0 // how much of the current blend is the "10"

    if (reducedMotion) {
      // Static states that snap at thresholds; a brief opacity dip masks the swap.
      A = p < 0.33 ? organic : ten.positions
      B = A
      w = 0
      ampA = ampB = 0
    } else if (p < SCENE.morphToStreams[0]) {
      A = B = organic
    } else if (p < SCENE.morphToStreams[1]) {
      A = organic
      B = streams
      w = smoothstep(SCENE.morphToStreams[0], SCENE.morphToStreams[1], p)
      ampB = 0.07
    } else if (p < SCENE.morphToTen[1]) {
      A = streams
      B = ten.positions
      w = smoothstep(SCENE.morphToTen[0], SCENE.morphToTen[1], p)
      ampA = 0.07
      ampB = 0.03
      tenPresence = w
    } else if (p < SCENE.morphToTunnel[0]) {
      A = B = ten.positions
      ampA = ampB = 0.03
      tenPresence = 1
    } else if (p < SCENE.morphToTunnel[1]) {
      A = ten.positions
      B = tunnel
      w = smoothstep(SCENE.morphToTunnel[0], SCENE.morphToTunnel[1], p)
      ampA = 0.03
      ampB = 0.06
      tenPresence = 1 - w
    } else if (p < SCENE.morphToDispersed[1]) {
      A = tunnel
      B = dispersed
      w = smoothstep(SCENE.morphToDispersed[0], SCENE.morphToDispersed[1], p)
      ampA = 0.06
      ampB = 0.12
    } else {
      A = B = dispersed
      ampA = ampB = 0.12
    }

    const amp = ampA * (1 - w) + ampB * w
    const damp = reducedMotion ? 1 : Math.min(1, dt * 6.5)
    // Very restrained breathing while the "10" is on screen, scaled around
    // the glyph's own centre (it sits left of the world origin on desktop).
    const breath = reducedMotion ? 1 : 0.012 * Math.sin(t * 0.7) * tenPresence
    const bcx = tenPlacement.offsetX
    const bcy = tenPlacement.offsetY
    // Inner edge of the "0" drifts toward the camera before the journey.
    const zeroPull = reducedMotion
      ? 0
      : smoothstep(SCENE.zeroPull[0], SCENE.zeroPull[1], p) * 3 * tenPresence

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const ph = phases[i]
      const nx = amp > 0 ? Math.sin(t * 0.5 + ph) * amp : 0
      const ny = amp > 0 ? Math.cos(t * 0.42 + ph * 1.7) * amp : 0
      const nz = amp > 0 ? Math.sin(t * 0.35 + ph * 2.3) * amp : 0
      const bx = A[i3] * (1 - w) + B[i3] * w
      const by = A[i3 + 1] * (1 - w) + B[i3 + 1] * w
      const tx = bx + (bx - bcx) * breath + nx
      const ty = by + (by - bcy) * breath + ny
      const tz = A[i3 + 2] * (1 - w) + B[i3 + 2] * w + nz + zeroPull * pull[i]
      cur[i3] += (tx - cur[i3]) * damp
      cur[i3 + 1] += (ty - cur[i3 + 1]) * damp
      cur[i3 + 2] += (tz - cur[i3 + 2]) * damp
    }
    ;(geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true

    /* ── palette crossfade with the background ── */
    const darkW = fadeWindow(p, SCENE.darkenBg[0], SCENE.darkenBg[1], SCENE.lightenBg[0], SCENE.lightenBg[1])
    if (Math.abs(darkW - lastDark.current) > 0.0005) {
      const { light, dark } = colors
      for (let i = 0; i < curColor.length; i++) {
        curColor[i] = light[i] + (dark[i] - light[i]) * darkW
      }
      ;(geometry.attributes.color as THREE.BufferAttribute).needsUpdate = true
      lastDark.current = darkW
    }
    if (!(state.scene.background instanceof THREE.Color)) state.scene.background = bgLight.clone()
    ;(state.scene.background as THREE.Color).copy(bgLight).lerp(bgDark, darkW)

    /* ── opacity ── */
    let opacity = 1 - smoothstep(SCENE.particlesFade[0], SCENE.particlesFade[1], p)
    if (reducedMotion) {
      // Dip that masks the organic → "10" swap, plus the final fade-out.
      opacity = Math.min(opacity, 1 - fadeWindow(p, 0.29, 0.325, 0.335, 0.37))
      opacity = Math.min(opacity, 1 - smoothstep(0.74, 0.84, p))
    }
    if (pointsMatRef.current) pointsMatRef.current.opacity = opacity

    const strandOpacity =
      fadeWindow(p, SCENE.strands[0], SCENE.strands[1], SCENE.strands[2], SCENE.strands[3]) *
      (reducedMotion ? 0.25 : 0.45)
    if (strandMatRef.current) strandMatRef.current.opacity = strandOpacity
    if (strandsRef.current) strandsRef.current.visible = strandOpacity > 0.004

    /* ── slow ambient background field (dark scenes only) ── */
    const bgOpacity = 0.32 * darkW * opacity
    if (bgMatRef.current) bgMatRef.current.opacity = bgOpacity
    if (bgRef.current) {
      bgRef.current.visible = bgOpacity > 0.004
      if (!reducedMotion) {
        bgRef.current.rotation.z = t * 0.012
        bgRef.current.position.y = Math.sin(t * 0.05) * 0.3
      }
    }

    /* ── camera ── */
    const cam = state.camera
    if (reducedMotion) {
      cam.position.set(0, 0, 8)
      cam.lookAt(0, 0, 0)
    } else {
      const push = smoothstep(SCENE.cameraPush[0], SCENE.cameraPush[1], p)
      const approach = smoothstep(SCENE.cameraApproach[0], SCENE.cameraApproach[1], p)
      const travel = smoothstep(SCENE.cameraTravel[0], SCENE.cameraTravel[1], p)
      // Slow sway gives the layered depth a slight parallax while reading.
      const cx = lerp(0, ten.zeroCenterX, approach) + Math.sin(t * 0.18) * 0.05 * (1 - travel)
      const cyAim = lerp(0, ten.zeroCenterY, approach)
      const cz = lerp(8 - smoothstep(0, 0.5, p) * 0.8 - push, -6, travel)
      const cy = cyAim + Math.sin(t * 0.25) * 0.06 * (1 - travel)
      cam.position.set(cx, cy, cz)
      cam.lookAt(cx, cyAim, cz - 6)
      // Controlled perspective drift — a barely-there roll, never shake.
      cam.rotation.z = Math.sin(t * 0.12) * 0.02
    }
  })

  return (
    <>
      <points geometry={geometry} frustumCulled={false}>
        <pointsMaterial
          ref={pointsMatRef}
          map={sprite}
          size={isMobile ? 0.058 : 0.045}
          sizeAttenuation
          vertexColors
          transparent
          depthWrite={false}
          alphaTest={0.06}
        />
      </points>
      <lineSegments ref={strandsRef} geometry={strandGeometry} frustumCulled={false}>
        <lineBasicMaterial
          ref={strandMatRef}
          color="#e3cdb2"
          transparent
          opacity={0}
          depthWrite={false}
        />
      </lineSegments>
      <points ref={bgRef} geometry={bgGeometry} frustumCulled={false} visible={false}>
        <pointsMaterial
          ref={bgMatRef}
          map={sprite}
          color="#a596c8"
          size={0.12}
          sizeAttenuation
          transparent
          opacity={0}
          depthWrite={false}
        />
      </points>
    </>
  )
}

/** Fullscreen transparent-chrome WebGL canvas hosting the particle field. */
export function ParticleScene(props: ParticleSceneProps) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      frameloop={props.reducedMotion ? 'demand' : 'always'}
      gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
      camera={{ fov: 50, near: 0.1, far: 60, position: [0, 0, 8] }}
    >
      <ParticleField {...props} />
    </Canvas>
  )
}
