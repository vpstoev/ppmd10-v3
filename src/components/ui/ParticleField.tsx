import { useEffect, useRef } from 'react'
import styles from './ParticleField.module.css'

interface ParticleFieldProps {
  /** Particle color (rgb triplet string, e.g. "226,0,26"). */
  color?: string
  /** Approximate particle count at desktop sizes. */
  density?: number
  className?: string
}

interface Node {
  x: number
  y: number
  vx: number
  vy: number
}

/**
 * Lightweight animated node-and-connection network on a canvas.
 * Performance-friendly (single rAF loop, capped DPR) and fully static
 * when the user prefers reduced motion.
 */
export function ParticleField({
  color = '255,255,255',
  density = 60,
  className = '',
}: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    let width = 0
    let height = 0
    let nodes: Node[] = []
    let raf = 0
    let visible = true
    const LINK_DIST = 130

    const seed = () => {
      const parent = canvas.parentElement
      width = parent?.clientWidth ?? window.innerWidth
      height = parent?.clientHeight ?? window.innerHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Scale particle count to area so mobile stays light.
      const count = Math.round((density * (width * height)) / (1440 * 800))
      nodes = Array.from({ length: Math.max(18, count) }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
      }))
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)

      for (const n of nodes) {
        if (!reduce) {
          n.x += n.vx
          n.y += n.vy
          if (n.x < 0 || n.x > width) n.vx *= -1
          if (n.y < 0 || n.y > height) n.vy *= -1
        }
      }

      // Connection lines.
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i]
          const b = nodes[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.hypot(dx, dy)
          if (dist < LINK_DIST) {
            const alpha = (1 - dist / LINK_DIST) * 0.28
            ctx.strokeStyle = `rgba(${color},${alpha})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }

      // Nodes.
      for (const n of nodes) {
        ctx.fillStyle = `rgba(${color},0.7)`
        ctx.beginPath()
        ctx.arc(n.x, n.y, 1.6, 0, Math.PI * 2)
        ctx.fill()
      }

      if (!reduce && visible) raf = requestAnimationFrame(draw)
    }

    seed()
    draw()

    const onResize = () => {
      cancelAnimationFrame(raf)
      seed()
      draw()
    }
    window.addEventListener('resize', onResize)

    // Pause the animation loop entirely while the canvas is off-screen.
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting
        cancelAnimationFrame(raf)
        if (visible && !reduce) raf = requestAnimationFrame(draw)
      },
      { threshold: 0 },
    )
    io.observe(canvas)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      io.disconnect()
    }
  }, [color, density])

  return <canvas ref={canvasRef} className={`${styles.canvas} ${className}`} aria-hidden />
}
