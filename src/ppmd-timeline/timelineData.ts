/**
 * Content and scroll choreography for "Ten Years in Motion".
 *
 * Years, titles and descriptions come from the content workbook; how each
 * milestone is revealed, laid out and lit stays here, because that is
 * choreography rather than content.
 */
import { fadeWindow, smoothstep } from '../hg-hero/heroTheme'
import { WB_TIMELINE } from '../ppmd-content/workbookContent'
import type { PathPhase, TimelineMilestone } from './timelineTypes'

export const TIMELINE_VH = 960

/** Palette continuity with the Hero and capability section. */
export const INK = '#07070c'
export const IVORY = '#f5efe4'
export const TL_CORAL = '#ff6e79'
export const TL_VIOLET = '#9d6bff'
export const TL_ICE = '#7cc4ff'
export const TL_CHAMPAGNE = '#e8c188'
export const TL_WHITE = '#fff1e0'

/** Section title window (intro) and closing lines. */
export const TITLE_OUT: readonly [number, number] = [0.045, 0.085]
export const CLOSING_LINE1_IN: readonly [number, number] = [0.94, 0.965]
export const CLOSING_LINE2_IN: readonly [number, number] = [0.955, 0.985]

/**
 * Where each milestone sits in the chapter, and how it is lit.
 *
 * Positional: the workbook's row order is the order these scenes play.
 * The accent progression — champagne warming through coral into violet,
 * ice, and finally the full iridescent — is the chapter's own arc and
 * follows the colours the workbook names for each period, so the two stay
 * in step without the section reading its palette from a text sheet.
 */
const SCENES: ReadonlyArray<{
  accent: string
  iridescent?: boolean
  reveal: TimelineMilestone['reveal']
  layout: number
  window: readonly [number, number, number, number]
}> = [
  { accent: TL_CHAMPAGNE, reveal: 'mask', layout: 0, window: [0.06, 0.1, 0.14, 0.18] },
  { accent: '#f2b183', reveal: 'depth', layout: 6, window: [0.14, 0.18, 0.24, 0.28] },
  { accent: TL_CORAL, reveal: 'clip', layout: 1, window: [0.24, 0.28, 0.34, 0.38] },
  { accent: TL_VIOLET, reveal: 'depth', layout: 2, window: [0.34, 0.38, 0.44, 0.48] },
  { accent: '#8f9df5', reveal: 'clip', layout: 7, window: [0.44, 0.48, 0.54, 0.58] },
  { accent: TL_ICE, reveal: 'mask', layout: 3, window: [0.54, 0.58, 0.64, 0.68] },
  { accent: '#d76ea8', reveal: 'clip', layout: 4, window: [0.64, 0.68, 0.74, 0.78] },
  { accent: '#c490d9', reveal: 'mask', layout: 8, window: [0.74, 0.78, 0.84, 0.88] },
  { accent: IVORY, iridescent: true, reveal: 'depth', layout: 5, window: [0.84, 0.88, 0.93, 0.96] },
]

export const MILESTONES: TimelineMilestone[] = WB_TIMELINE.slice(0, SCENES.length).map(
  (w, i) => ({
    id: w.id,
    /* The workbook's `year` column, verbatim. Several milestone ids were
       written before the dates settled and no longer agree with it — the
       id is not a date and is never read as one. */
    year: w.year,
    title: w.title ?? '',
    description: w.shortDescription ?? '',
    ...SCENES[i],
  }),
)

/**
 * Path behaviour per phase: intro braid, one phase per milestone, closing.
 * Blended by the normalized weights below, so transitions overlap smoothly.
 */
export const PATH_PHASES: PathPhase[] = [
  /* intro — the four capability streams merged into one temporal path */
  { spread: 0.4, align: 0.25, wobble: 0.05, width: 0.9, split: 0, flow: 0.5 },
  /* 2016 — the path begins forming */
  { spread: 0.55, align: 0.12, wobble: 0.06, width: 1.0, split: 0, flow: 0.5 },
  /* 2017 — a more consistent direction, momentum without arrows */
  { spread: 0.42, align: 0.35, wobble: 0.055, width: 1.0, split: 0, flow: 0.8 },
  /* 2018 — a compact violet burst rather than a thin path */
  { spread: 0.36, align: 0.5, wobble: 0.04, width: 1, split: 0.04, flow: 0.6 },
  /* second 2018 event — the same compact violet plume */
  { spread: 0.34, align: 0.58, wobble: 0.038, width: 1, split: 0, flow: 0.66 },
  /* 2021 — separate paths connect; smaller strands merge into one */
  { spread: 0.3, align: 0.7, wobble: 0.05, width: 1.1, split: 0.45, flow: 0.7 },
  /* 2022 — several strands visible within one path */
  { spread: 0.34, align: 0.85, wobble: 0.05, width: 1.15, split: 0, flow: 0.7 },
  /* 2024 — wider and deeper */
  { spread: 0.6, align: 0.35, wobble: 0.08, width: 1.6, split: 0.25, flow: 0.8 },
  /* 2025 — clearer, wider, forward-oriented; prepares 2026 */
  { spread: 0.3, align: 0.7, wobble: 0.045, width: 1.25, split: 0, flow: 0.85 },
  /* 2026 — aligned, calm, confident */
  { spread: 0.22, align: 0.9, wobble: 0.03, width: 0.95, split: 0, flow: 0.6 },
  /* closing */
  { spread: 0.26, align: 0.85, wobble: 0.035, width: 1.05, split: 0, flow: 0.5 },
]

/** Normalized phase weights (intro, nine milestones, closing). */
export function timelineWeights(p: number): number[] {
  const w = [
    1 - smoothstep(0.05, 0.09, p),
    ...MILESTONES.map((m) => fadeWindow(p, m.window[0], m.window[1], m.window[2], m.window[3])),
    smoothstep(0.94, 0.98, p),
  ]
  const sum = w.reduce((a, b) => a + b, 0) || 1
  return w.map((x) => x / sum)
}

/** The static time-path spine: u ∈ [0,1] bends through space, z recedes. */
export function pathX(u: number): number {
  return Math.sin(u * 5.2) * 2.2 + Math.sin(u * 11) * 0.7
}
export function pathY(u: number): number {
  return Math.cos(u * 4.1) * 1.1 + Math.sin(u * 7.3) * 0.45
}
export const PATH_Z_START = 4
export const PATH_Z_LENGTH = 64
export function pathZ(u: number): number {
  return PATH_Z_START - u * PATH_Z_LENGTH
}
