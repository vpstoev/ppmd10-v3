import { useEffect, useRef, useState } from 'react'
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react'
import type { MouseEvent } from 'react'
import { Container } from '../ui/Container'
import { Badge } from '../ui/Badge'
import { ParticleField } from '../ui/ParticleField'
import { LightTrails } from '../ui/LightTrails'
import { useSceneActivation } from '../layout/SceneBackground'
import { department } from '../../data/department'
import { easeOut, staggerContainer, staggerItem } from '../../lib/motion'
import styles from './AnniversaryHero.module.css'

export function AnniversaryHero() {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  useSceneActivation(ref, 'hero')

  // Freeze all of the hero's continuous CSS animations (aurora, glow, sheen,
  // grain drift, light trails) once it scrolls out of view, so they stop
  // burning GPU/CPU on a screen the user can't see.
  const [offscreen, setOffscreen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setOffscreen(!e.isIntersecting), {
      threshold: 0,
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Scroll parallax — layers drift at different speeds as the hero exits.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const k = reduce ? 0 : 1
  const yTrails = useTransform(scrollYProgress, [0, 1], [0, 120 * k])
  const yGrid = useTransform(scrollYProgress, [0, 1], [0, 80 * k])
  const yContent = useTransform(scrollYProgress, [0, 1], [0, 160 * k])
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, reduce ? 1 : 0])
  // Cinematic depart — the whole hero recedes as you scroll past. (Dropped the
  // per-frame scroll `filter: blur()` — animating blur while scrolling the most-
  // viewed area was expensive; the opacity + scale fade reads the same.)
  const scale = useTransform(scrollYProgress, [0, 0.7], [1, reduce ? 1 : 0.9])

  // Pointer parallax — subtle depth that follows the cursor.
  const px = useSpring(0, { stiffness: 60, damping: 18 })
  const py = useSpring(0, { stiffness: 60, damping: 18 })
  const onMouseMove = (e: MouseEvent<HTMLElement>) => {
    if (reduce) return
    const r = e.currentTarget.getBoundingClientRect()
    px.set(((e.clientX - r.left) / r.width - 0.5) * 2)
    py.set(((e.clientY - r.top) / r.height - 0.5) * 2)
  }
  const trailsX = useTransform(px, [-1, 1], [22, -22])
  const trailsY = useTransform(py, [-1, 1], [16, -16])
  const contentX = useTransform(px, [-1, 1], [-10, 10])

  return (
    <section
      className={`${styles.hero} ${offscreen ? styles.paused : ''}`}
      id="top"
      ref={ref}
      onMouseMove={onMouseMove}
    >
      {/* Abstract A1-inspired background, parallaxed */}
      <motion.div className={styles.gridLayer} style={{ y: yGrid }} aria-hidden>
        <div className={styles.grid} />
      </motion.div>

      <motion.div className={styles.trailLayer} style={{ y: yTrails, x: trailsX }}>
        <motion.div className={styles.trailInner} style={{ y: trailsY }}>
          <LightTrails />
        </motion.div>
      </motion.div>

      {/* Living anniversary aurora behind the centerpiece */}
      <div className={styles.auroraWrap} aria-hidden>
        <div className={styles.aurora} />
      </div>

      <ParticleField color="255,180,120" density={38} />
      <div className={styles.glow} aria-hidden />
      <div className={styles.vignette} aria-hidden />

      <Container>
        <motion.div
          className={styles.content}
          style={{ y: yContent, x: contentX, opacity, scale }}
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={staggerItem}>
            <Badge>
              {department.company} · {department.name}
            </Badge>
          </motion.div>

          <motion.div className={styles.bigWrap} variants={staggerItem}>
            <span className={styles.bigNumber} data-text="10">
              10
            </span>
            <span className={styles.yearsRow}>
              <span className={styles.yearsLabel}>Years</span>
            </span>
            <span className={styles.est}>Est. 2015 — 2025</span>
          </motion.div>

          <motion.h1 className={styles.title} variants={staggerItem}>
            {department.name}
          </motion.h1>

          <motion.p className={styles.message} variants={staggerItem}>
            {department.tagline}
          </motion.p>

          <motion.div className={styles.actions} variants={staggerItem}>
            <a href="#people" className="btn btn-primary">
              Meet the people
            </a>
            <a href="#wall" className="btn btn-ghost">
              Read the messages
            </a>
          </motion.div>

          <motion.div className={styles.metaRow} variants={staggerItem}>
            <span>Delivery</span>
            <span className={styles.dot} />
            <span>Structure</span>
            <span className={styles.dot} />
            <span>Quality</span>
            <span className={styles.dot} />
            <span>Teamwork</span>
          </motion.div>
        </motion.div>
      </Container>

      <motion.div
        className={styles.scroll}
        style={{ opacity }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6, ease: easeOut }}
        aria-hidden
      >
        <span className={styles.mouse}>
          <span className={styles.wheel} />
        </span>
        Scroll to explore
      </motion.div>
    </section>
  )
}
