/**
 * "The decade, assembled" — the entrance timeline of the anniversary hero.
 *
 * ONE wall-clock drives both halves of the opening: the particle assembly
 * inside the WebGL canvas and the kinetic typography running as CSS
 * keyframes. Because both read the same clock, the ink of the "10" lands
 * exactly where the particle streams put it instead of fading in beside
 * them. Everything is deterministic — the same sequence plays on every
 * load — and the first scroll input hands control back to the scroll
 * timeline immediately, so the entrance can never fight the journey.
 */

export const ENT = {
  /** the controlled field holds, then the streams are drawn inward (s) */
  hold: 0.12,
  /** width of the left→right draw front travelling across the "10" (s) */
  drawSpan: 0.42,
  /**
   * Base flight time of a single particle (s). The draw front itself is
   * unchanged — only the tail of each flight is longer, so the number
   * RESOLVES rather than snapping shut at the end of the construction.
   */
  flight: 0.54,
  /** fill particles trail the contour: the shape is traced, then filled */
  fillDelay: 0.1,
  /** streams hold the assembled number before flowing back out */
  streamHold: 0.14,
  streamPeel: 0.52,
  /** everything has settled into idle — the DOM drops its entrance rig */
  settle: 2.35,
} as const

/**
 * The four gates the converging streams funnel through, as fractions of
 * the half-viewport. Every particle of a stream bends its flight around
 * the same gate, so the field is drawn in along four visible rivers
 * instead of imploding uniformly from everywhere at once.
 */
export const ENT_GATES = [
  [-1.02, 0.6],
  [-0.92, -0.68],
  [0.98, 0.7],
  [1.08, -0.6],
] as const

type EntranceMode = 'idle' | 'run' | 'off'

let mode: EntranceMode = 'idle'
let startMs = 0

/** Arm the shared clock. Idempotent — the first caller wins. */
export function beginEntrance(): void {
  if (mode !== 'idle') return
  mode = 'run'
  startMs = performance.now()
}

/** Skip the entrance entirely (reduced motion, or loaded mid-journey). */
export function cancelEntrance(): void {
  if (mode === 'run') return
  mode = 'off'
}

export function entranceMode(): EntranceMode {
  return mode
}

/** Seconds since the entrance began; 0 while the field is still holding. */
export function entranceTime(): number {
  return mode === 'run' ? (performance.now() - startMs) / 1000 : 0
}

/**
 * Pointer position normalized to [-1, 1] from the viewport centre. Written
 * by one shared listener, read (and smoothed independently) by the canvas
 * and by the DOM lockup so the two layers can drift at different depths.
 */
export const pointerTarget = { x: 0, y: 0 }

export function attachHeroPointer(): () => void {
  const onMove = (e: PointerEvent) => {
    if (e.pointerType === 'touch') return
    pointerTarget.x = (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1
    pointerTarget.y = (e.clientY / Math.max(1, window.innerHeight)) * 2 - 1
  }
  const onLeave = () => {
    pointerTarget.x = 0
    pointerTarget.y = 0
  }
  window.addEventListener('pointermove', onMove, { passive: true })
  document.addEventListener('pointerleave', onLeave)
  return () => {
    window.removeEventListener('pointermove', onMove)
    document.removeEventListener('pointerleave', onLeave)
  }
}
