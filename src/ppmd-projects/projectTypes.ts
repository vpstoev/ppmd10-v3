/** Types for the "Projects that Shaped the Decade" section. */

export type RevealKind = 'mask' | 'clip' | 'depth'

export interface Project {
  /** e.g. "01 / 06" */
  num: string
  /** Environmental numeral, e.g. "01" */
  bigNum: string
  name: string
  category: string
  description: string
  impact: string
  /** Dominant text accent for this project. */
  accent: string
  /** The final programme renders its numeral with the full gradient. */
  iridescent?: boolean
  reveal: RevealKind
  /** Editorial side for the text block. */
  side: 'left' | 'right'
  /** fadeWindow(p, a, b, c, d) — reveal, plateau, dissolve. */
  window: readonly [number, number, number, number]
}

/** Shape-morph interval on section progress: shape k → k+1 over [a,b]. */
export interface MorphSpan {
  a: number
  b: number
}
