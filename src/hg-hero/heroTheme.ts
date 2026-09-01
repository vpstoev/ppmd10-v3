/**
 * Shared scroll/animation math used across the anniversary experience
 * sections. Every scene is a pure function of normalized scroll progress,
 * so all experiences are fully reversible when scrolling upward.
 */

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
