/** Types for the "Projects that Shaped the Decade" section. */
import type { ProjectAccent } from './projectAccents'
import type { ShapePlacement } from './ProjectShape'

export type RevealKind = 'mask' | 'clip' | 'depth'

export interface Project {
  /** Workbook id — the React key, and what the accent and shape tables
   *  are looked up by. */
  id: string
  /** Environmental numeral, e.g. "01". */
  bigNum: string
  name: string
  category: string
  /**
   * Optional throughout, and deliberately so. The importer omits empty or
   * confirmed template-filler cells, while preserving reviewed copy when it
   * is present in the workbook.
   */
  description?: string
  impact?: string
  /** Colour treatment for this project — see `projectAccents`. */
  accent: ProjectAccent
  /** The abstract figure behind the scene, and how it is cropped. */
  shape: ShapePlacement
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
