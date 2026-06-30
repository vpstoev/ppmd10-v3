import type { Variants, Transition } from 'motion/react'

/** Smooth, premium easing used across the site. */
export const easeOut: Transition['ease'] = [0.22, 1, 0.36, 1]

/** Fade + rise, ideal for scroll-revealed blocks. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easeOut },
  },
}

/** Container that staggers its children into view. */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
}

/** Child item meant to live inside `staggerContainer`. */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: easeOut },
  },
}

/** Gentle whole-section entrance, layered under inner staggers. */
export const sectionReveal: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: easeOut },
  },
}

/** Cinematic blur-in for headline moments. Gate behind reduced-motion. */
export const blurUp: Variants = {
  hidden: { opacity: 0, y: 26, filter: 'blur(14px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.85, ease: easeOut },
  },
}

/** Film-title clip wipe (reveals upward) for scene openers. Gate behind reduced-motion. */
export const maskUp: Variants = {
  hidden: { opacity: 0, y: 24, clipPath: 'inset(0 0 100% 0)' },
  visible: {
    opacity: 1,
    y: 0,
    clipPath: 'inset(0 0 0% 0)',
    transition: { duration: 0.9, ease: easeOut },
  },
}

/** Plain fade fallback used when the user prefers reduced motion. */
export const plainUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeOut } },
}

/** Premium spring used for tactile, interruptible UI motion. */
export const softSpring: Transition = { type: 'spring', stiffness: 260, damping: 26 }

/* ── Presentation scene system ──────────────────────────────
   Reusable variants for the morph-like, scene-to-scene flow. */

/** A scene rising and settling into focus (rise + scale + fade). */
export const sceneEnter: Variants = {
  hidden: { opacity: 0, y: 44, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: easeOut } },
}

/** A scene receding as the next one takes over. For AnimatePresence/exit use. */
export const sceneExit: Variants = {
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98, filter: 'blur(6px)', transition: { duration: 0.5, ease: easeOut } },
}

/** Container that staggers a scene's children into view. */
export const sceneReveal: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}

/** A card/panel materializing — scale up out of a soft blur. */
export const morphCard: Variants = {
  hidden: { opacity: 0, scale: 0.92, filter: 'blur(10px)' },
  visible: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: { duration: 0.65, ease: easeOut } },
}

/** A node snapping into the system — small → full with a soft spring. */
export const morphNode: Variants = {
  hidden: { opacity: 0, scale: 0.4 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 240, damping: 20 } },
}

/** Crossfade timing for the shared background as scenes change. */
export const backgroundShift: Transition = { duration: 1.1, ease: easeOut }

/** Shared viewport config so reveals only fire once. */
export const viewportOnce = { once: true, amount: 0.3 } as const

/** Looser trigger for tall sections that should reveal a touch earlier. */
export const viewportSoft = { once: true, amount: 0.15 } as const
