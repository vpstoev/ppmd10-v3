/** Types for the Voices section. */

export interface Voice {
  quote: string
  attribution: string
  role: string
  accent: string
  /** fadeWindow(p, a, b, c, d) on section progress. */
  window: readonly [number, number, number, number]
}
