import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode, RefObject } from 'react'
import { motion } from 'motion/react'
import { backgroundShift } from '../../lib/motion'
import styles from './SceneBackground.module.css'

/** Tracks which scene is currently centered, so the shared background can morph. */
interface SceneCtx {
  active: string
  setActive: (id: string) => void
}
const Ctx = createContext<SceneCtx>({ active: 'hero', setActive: () => {} })

export const useScene = () => useContext(Ctx)

export function SceneProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState('hero')
  // Memoize so the context value only changes when `active` actually changes,
  // not on every parent render.
  const value = useMemo(() => ({ active, setActive }), [active])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

/**
 * Marks the referenced element as the active scene when it's centered in the
 * viewport, so the shared background gradient can crossfade to match it.
 */
export function useSceneActivation(ref: RefObject<HTMLElement | null>, id?: string) {
  const { setActive } = useScene()
  useEffect(() => {
    const el = ref.current
    if (!el || !id) return
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(id)
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [ref, id, setActive])
}

/** Scene background tints — each crossfades in when its scene becomes active. */
const scenes = [
  'hero',
  'universe',
  'teams',
  'people',
  'timeline',
  'collaboration',
  'wall',
] as const

/**
 * A single persistent layer behind all content. Each scene's gradient
 * crossfades in/out as the active scene changes — the core morph device
 * that carries continuity (and the warm→cool→warm arc) across the page.
 */
export function SceneBackground() {
  const { active } = useScene()
  return (
    <div className={styles.layer} aria-hidden>
      {scenes.map((id) => (
        <motion.div
          key={id}
          className={`${styles.scene} ${styles[id]}`}
          initial={false}
          animate={{ opacity: active === id ? 1 : 0 }}
          transition={backgroundShift}
        />
      ))}
    </div>
  )
}
