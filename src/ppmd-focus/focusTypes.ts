/** Types for the Current Focus section. */

export interface FocusArea {
  num: string
  name: string
  line: string
  accent: string
  /** fadeWindow(p, a, b, c, d) on section progress. */
  window: readonly [number, number, number, number]
}
