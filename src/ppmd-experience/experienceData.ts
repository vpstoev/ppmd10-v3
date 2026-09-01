/**
 * One continuous scroll experience: anniversary hero → through the "0" →
 * statement → four capabilities → one delivery system. Every visual state
 * is a pure function of normalized progress P over the single pinned
 * container, so the whole journey reverses smoothly.
 */
import { clamp01, fadeWindow, smoothstep } from '../hg-hero/heroTheme'

/** Height of the single pinned container (vh). */
export const TOTAL_VH = 1160

export const LIGHT_BG = '#f7f2e9' /* warm ivory */
export const DARK_BG = '#07070c' /* deep ink */

/** Stream palettes — one colour per particle stream (index % 4). */
export const STREAM_DARK = ['#ff6e79', '#9d6bff', '#7cc4ff', '#e8c188']
export const STREAM_LIGHT = ['#d5404e', '#6a3fd0', '#2f6cb0', '#a87828']

/**
 * Hero flow palette — deliberately narrower than the section palette above:
 * warm gold, soft blue, muted violet, dusk rose. One hue per FLOW, never
 * per particle, so colour reads as four coherent currents instead of
 * confetti. Values are pitched for the ivory hero background.
 */
export const HERO_FLOW_LIGHT = ['#9a6b18', '#2f5f8f', '#5b3f97', '#a4485c']

/**
 * The four hero currents, as cubic Béziers in viewport-normalized units
 * (±1 = half the visible extent). `bend` pulls both control points toward
 * the counter of the "0", so a current with a high value threads THROUGH
 * the number and a low one sweeps around its outside. Ordered to read as
 * one coordinated system rather than four unrelated sweeps.
 */
export interface HeroArc {
  /** entry point */
  x0: number
  y0: number
  /** exit point */
  x1: number
  y1: number
  /** perpendicular bulge of the curve; the sign picks the side it wraps */
  bow: number
  /** 0 = skirts the number, 1 = the waist passes through its counter */
  bend: number
  /** ribbon half-width away from the number */
  width: number
  /** depth offset of the whole current, in world units */
  z: number
}

export const HERO_ARCS: HeroArc[] = [
  /* gold — sweeps up from under the "1" and bows beneath the "0" */
  { x0: -1.22, y0: -0.94, x1: 1.24, y1: 0.72, bow: -0.62, bend: 0.4, width: 0.26, z: -0.5 },
  /* soft blue — threads the counter of the "0" on a shallow bow */
  { x0: -1.26, y0: 0.2, x1: 1.26, y1: -0.16, bow: 0.16, bend: 0.9, width: 0.14, z: 0.35 },
  /* violet — falls from upper right and wraps the outside of the "0" */
  { x0: 1.22, y0: 0.92, x1: -1.26, y1: -0.86, bow: -0.74, bend: 0.26, width: 0.3, z: -1.0 },
  /* dusk rose — crosses over the "1" and the shoulder of the "0" */
  { x0: -1.2, y0: 0.88, x1: 1.24, y1: -0.74, bow: 0.5, bend: 0.6, width: 0.2, z: 0.8 },
]

/** Adaptive particle counts for the single persistent system. */
export const COUNT_DESKTOP = 12000
export const COUNT_DESKTOP_LOW = 9000
export const COUNT_MOBILE = 3500

/**
 * Scene windows on global progress P (0..1). One timeline shared by the
 * DOM typography and the particle system.
 */
export const EXP = {
  /* hero */
  approach: [0, 0.12], // lockup starts moving on the FIRST scroll input
  early: [0, 0.145], // early-scroll response feeding into the zoom
  zoom: [0.15, 0.33], // zoom through the counter of the "0"
  discIn: [0.12, 0.2], // depth opens inside the zero
  darken: [0.24, 0.27], // canvas bg swaps to ink just as the disc covers
  heroHide: 0.275, // hero DOM retires the moment the canvas owns the dark
  cueOut: [0.004, 0.05],
  /* persistent identity through the dark journey */
  marker: [0.28, 0.32, 0.87, 0.91],
  /* statement — revealed and released inside the motion, never a slide */
  stmtL1: [0.36, 0.415],
  stmtL2: [0.385, 0.44],
  stmtExit: [0.465, 0.52],
  corridor: [0.37, 0.42, 0.46, 0.52],
  /* capabilities */
  introIn: [0.5, 0.545],
  introOut: [0.575, 0.615],
  capsWindow: [0.6, 0.89],
  closingIn: [0.89, 0.94],
} as const

/** Continuous capability focus 0→3 with readable plateaus. */
export function capFocus(p: number): number {
  return (
    smoothstep(0.635, 0.675, p) +
    smoothstep(0.72, 0.76, p) +
    smoothstep(0.805, 0.845, p)
  )
}

/** Ivory → ink, hidden behind the zoomed dark disc. */
export function darkWeight(p: number): number {
  return smoothstep(EXP.darken[0], EXP.darken[1], p)
}

/**
 * Approach of the "10" toward the viewer. Eased OUT rather than in-out, so
 * the very first scroll pixel already produces visible movement — there is
 * no dead zone before the composition responds. Reaches 1 before the zoom
 * window opens, so the approved fly-through still starts from scale 1.9.
 */
export function approachDrive(p: number): number {
  const x = clamp01((p - EXP.approach[0]) / (EXP.approach[1] - EXP.approach[0]))
  const inv = 1 - x
  return 1 - inv * Math.sqrt(inv)
}

/**
 * Shared early-scroll response: particle velocity, stream detachment and
 * the depth of the well inside the "0" all ride this curve. Like the
 * approach it responds immediately, and it holds at 1 from p = 0.145 so it
 * hands over to the approved vortex without a second inflection.
 */
export function earlyDrive(p: number): number {
  const x = clamp01((p - EXP.early[0]) / (EXP.early[1] - EXP.early[0]))
  const inv = 1 - x
  return 1 - inv * inv
}

/**
 * Scale of the hero lockup. Exponential through the zoom phase so the
 * fly-through feels perceptually constant; capped gently under reduced
 * motion where the dark handoff happens by dimming instead.
 */
export function lockupScale(p: number, reduced: boolean): number {
  if (reduced) return 1 + 0.15 * smoothstep(0.05, 0.3, p)
  const a = approachDrive(p)
  const z = smoothstep(EXP.zoom[0], EXP.zoom[1], p)
  return (1 + 0.9 * a) * Math.exp(Math.log(17 / 1.9) * z)
}

/**
 * Normalized weights of the particle macro-states. Windows overlap so the
 * one particle system morphs continuously — never swaps.
 */
export interface StageWeights {
  hero: number
  vortex: number
  tunnel: number
  caps: number
  braid: number
  corridor: number
}

export function stageWeights(p: number): StageWeights {
  const w = {
    hero: 1 - smoothstep(0.19, 0.27, p),
    vortex: fadeWindow(p, 0.19, 0.26, 0.31, 0.38),
    tunnel: fadeWindow(p, 0.31, 0.38, 0.52, 0.6),
    caps: fadeWindow(p, 0.52, 0.6, 0.87, 0.93),
    braid: smoothstep(0.87, 0.93, p),
    corridor: 0,
  }
  const sum = w.hero + w.vortex + w.tunnel + w.caps + w.braid || 1
  w.hero /= sum
  w.vortex /= sum
  w.tunnel /= sum
  w.caps /= sum
  w.braid /= sum
  w.corridor = fadeWindow(p, EXP.corridor[0], EXP.corridor[1], EXP.corridor[2], EXP.corridor[3])
  return w
}

/**
 * Per-capability motion character for the stream system. One family of
 * parameters — each capability is a different configuration of the SAME
 * system, so the four states are transformations, not separate effects.
 */
export interface CapMotion {
  ySep: number // lane separation of the four streams
  spread: number // lateral scatter
  amp: number // wave amplitude
  freq: number // wave frequency
  chaos: number // phase disorder
  flow: number // directional speed along the stream
  align: number // quantize into lanes/grid (structure)
  funnel: number // converge toward the delivery point (right side)
  swap: number // lanes exchange places (transformation)
  scan: number // scanning ridge travels the streams (validation)
}

export const CAP_MOTION: CapMotion[] = [
  /* 01 Project Delivery — coordinated trajectories converging */
  { ySep: 1.7, spread: 0.15, amp: 0.5, freq: 0.9, chaos: 0.1, flow: 2.6, align: 0, funnel: 0.85, swap: 0, scan: 0 },
  /* 02 Process Excellence — complexity organising into a grid */
  { ySep: 1.5, spread: 0.11, amp: 0.32, freq: 1.7, chaos: 0.05, flow: 0.9, align: 0.95, funnel: 0, swap: 0, scan: 0 },
  /* 03 Business Transformation — streams reorganising, changing relations */
  { ySep: 1.1, spread: 0.2, amp: 0.95, freq: 1.2, chaos: 0.32, flow: 1.3, align: 0, funnel: 0, swap: 1, scan: 0 },
  /* 04 Testing & Quality — precise lanes swept by a validation ridge */
  { ySep: 1.45, spread: 0.055, amp: 0.16, freq: 1.4, chaos: 0.03, flow: 0.8, align: 0.5, funnel: 0, swap: 0, scan: 1 },
]

/** Blend the motion family across the continuous focus value. */
export function blendCapMotion(f: number): CapMotion {
  const out: CapMotion = { ySep: 0, spread: 0, amp: 0, freq: 0, chaos: 0, flow: 0, align: 0, funnel: 0, swap: 0, scan: 0 }
  let total = 0
  for (let k = 0; k < 4; k++) {
    const w = Math.max(0, 1 - Math.abs(k - f))
    if (w <= 0) continue
    total += w
    for (const key of Object.keys(out) as (keyof CapMotion)[]) out[key] += w * CAP_MOTION[k][key]
  }
  if (total > 0) for (const key of Object.keys(out) as (keyof CapMotion)[]) out[key] /= total
  return out
}

export { clamp01, fadeWindow, smoothstep }
