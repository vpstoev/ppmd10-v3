/**
 * Content and scroll choreography for "Ten Years in Motion".
 * All milestone copy lives here (placeholder wording) so it can be
 * replaced later without touching any component structure.
 */
import { fadeWindow, smoothstep } from '../hg-hero/heroTheme'
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

export const MILESTONES: TimelineMilestone[] = [
  {
    year: '2016',
    num: '01 / 09',
    title: 'THE BEGINNING',
    description:
      'A new chapter begins, establishing the foundation for a more connected approach to delivery.',
    accent: TL_CHAMPAGNE,
    reveal: 'mask',
    layout: 0,
    window: [0.06, 0.1, 0.14, 0.18],
  },
  {
    year: '2017',
    num: '02 / 09',
    title: 'FINDING OUR RHYTHM',
    description:
      'Experience begins to turn into shared practices, stronger coordination and a clearer delivery rhythm.',
    accent: '#f2b183', /* champagne warmed by restrained coral */
    reveal: 'depth',
    layout: 6,
    window: [0.14, 0.18, 0.24, 0.28],
  },
  {
    year: '2018',
    num: '03 / 09',
    title: 'BUILDING THE FOUNDATION',
    description:
      'Structure, collaboration and shared ways of working begin to form a stronger delivery system.',
    accent: TL_CORAL,
    reveal: 'clip',
    layout: 1,
    window: [0.24, 0.28, 0.34, 0.38],
  },
  {
    year: '2020',
    num: '04 / 09',
    title: 'ADAPTING AT SPEED',
    description:
      'New conditions demand flexibility, resilience and faster coordination across teams and priorities.',
    accent: TL_VIOLET,
    reveal: 'depth',
    layout: 2,
    window: [0.34, 0.38, 0.44, 0.48],
  },
  {
    year: '2021',
    num: '05 / 09',
    title: 'CONNECTING THE SYSTEM',
    description:
      'Teams, responsibilities and ways of working become increasingly connected across a growing delivery environment.',
    accent: '#8f9df5', /* violet meeting ice blue */
    reveal: 'clip',
    layout: 7,
    window: [0.44, 0.48, 0.54, 0.58],
  },
  {
    year: '2022',
    num: '06 / 09',
    title: 'EXPANDING OUR CAPABILITIES',
    description:
      'Projects, processes, transformation and quality become increasingly connected.',
    accent: TL_ICE,
    reveal: 'mask',
    layout: 3,
    window: [0.54, 0.58, 0.64, 0.68],
  },
  {
    year: '2024',
    num: '07 / 09',
    title: 'TRANSFORMATION AT SCALE',
    description:
      'The department supports more complex initiatives across technology, business and customer experience.',
    accent: '#d76ea8', /* coral–violet blend */
    reveal: 'clip',
    layout: 4,
    window: [0.64, 0.68, 0.74, 0.78],
  },
  {
    year: '2025',
    num: '08 / 09',
    title: 'LOOKING FORWARD',
    description:
      'A decade of experience begins shaping the capabilities, priorities and opportunities of the next chapter.',
    accent: '#c490d9', /* partial iridescent — coral·violet·ice */
    reveal: 'mask',
    layout: 8,
    window: [0.74, 0.78, 0.84, 0.88],
  },
  {
    year: '2026',
    num: '09 / 09',
    title: 'READY FOR THE NEXT CHAPTER',
    description: 'Ten years of experience become the foundation for what comes next.',
    accent: IVORY,
    iridescent: true,
    reveal: 'depth',
    layout: 5,
    window: [0.84, 0.88, 0.93, 0.96],
  },
]

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
  /* 2018 — more ordered */
  { spread: 0.3, align: 0.7, wobble: 0.045, width: 1.0, split: 0, flow: 0.6 },
  /* 2020 — separates and reconnects, controlled dynamism */
  { spread: 0.42, align: 0.3, wobble: 0.09, width: 1.05, split: 1, flow: 0.9 },
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
