/** Types for the "Ten Years in Motion" timeline section. */

/** Restrained text-reveal techniques, varied across milestones. */
export type RevealKind = 'mask' | 'clip' | 'depth'

export interface TimelineMilestone {
  year: string
  /** e.g. "01 / 06" */
  num: string
  title: string
  description: string
  /** Dominant accent for this period (deep-ink base stays constant). */
  accent: string
  /** The 2026 milestone renders its giant year with the full gradient. */
  iridescent?: boolean
  reveal: RevealKind
  /** Index into the editorial layout variants (CSS classes m0…m5). */
  layout: number
  /** fadeWindow(p, a, b, c, d) — reveal, plateau, dissolve. */
  window: readonly [number, number, number, number]
}

/** Behaviour of the particle time-path while a phase dominates. */
export interface PathPhase {
  /** Lateral scatter around the path spine. */
  spread: number
  /** 0..1 pull toward quantized strand lanes. */
  align: number
  /** Time-based wobble amplitude. */
  wobble: number
  /** Overall path width multiplier. */
  width: number
  /** 0..1 — the path separates and reconnects (2020). */
  split: number
  /** Flow/wobble speed multiplier. */
  flow: number
}
