/**
 * Shared theme + scroll math for the Hg-inspired PPMD anniversary hero.
 * All scene choreography is a pure function of normalized scroll progress,
 * so the experience is fully reversible when scrolling upward.
 */

/** Total scroll container height (vh). */
export const CONTAINER_VH = 480

/** Background colors interpolated inside the WebGL scene. */
export const LIGHT_BG = '#f7f2e9' /* warm ivory */
export const DARK_BG = '#07070c' /* deep ink — no burgundy, no grey-purple */

/** Particle counts (adaptive). */
export const COUNT_DESKTOP = 14000
export const COUNT_DESKTOP_LOW = 9000
export const COUNT_MOBILE = 4500

/**
 * Scene ranges on normalized progress. Kept in one place so the WebGL
 * choreography and the HTML overlay stay in sync.
 */
export const SCENE = {
  /* Scene 1 — identity fully readable to 0.16, fades as the bg darkens */
  openingTextOut: [0.16, 0.25],
  /* Colour journey: ivory → deep ink */
  darkenBg: [0.16, 0.3],
  /* Four streams enter and curve toward each other */
  morphToStreams: [0.18, 0.335],
  /* The streams merge into the particle "10" (complete by 0.50) */
  morphToTen: [0.335, 0.5],
  strands: [0.44, 0.52, 0.6, 0.68],
  /* Scene 2 anniversary stack — full opacity 0.44 → 0.58 */
  tenLabelIn: [0.405, 0.44],
  tenLabelOut: [0.58, 0.64],
  /* Scene 3 — the number comes to the viewer, then through the zero */
  zeroPull: [0.56, 0.66],
  cameraPush: [0.56, 0.64],
  cameraApproach: [0.6, 0.68],
  cameraTravel: [0.62, 0.8],
  morphToTunnel: [0.62, 0.76],
  /* Scene 4 — ink → ivory, one final message */
  lightenBg: [0.74, 0.86],
  morphToDispersed: [0.76, 0.88],
  particlesFade: [0.78, 0.92],
  statementIn: [0.78, 0.88],
  traceFade: [0.92, 0.99],
} as const

export function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0))
  return t * t * (3 - 2 * t)
}

/** Rises over [a,b], holds at 1, falls over [c,d]. */
export function fadeWindow(p: number, a: number, b: number, c: number, d: number): number {
  return smoothstep(a, b, p) * (1 - smoothstep(c, d, p))
}

/** Normalized progress of a tall scroll container with a sticky viewport. */
export function computeProgress(el: HTMLElement | null): number {
  if (!el) return 0
  const rect = el.getBoundingClientRect()
  const total = rect.height - window.innerHeight
  if (total <= 0) return 0
  return clamp01(-rect.top / total)
}
