/**
 * PLACEHOLDER CONTENT — Current Focus section.
 * All copy is temporary and centralized for later replacement.
 */
import { fadeWindow, smoothstep } from '../hg-hero/heroTheme'
import type { FieldPhase } from '../ppmd-shared/StreamField'
import type { FocusArea } from './focusTypes'

export const FOCUS_VH = 520

export const FOCUS_AREAS: FocusArea[] = [
  {
    num: '01',
    name: 'AI & AUTOMATION',
    line: 'Exploring smarter ways to support delivery and decision-making.', /* PLACEHOLDER */
    accent: '#9d6bff',
    window: [0.1, 0.15, 0.22, 0.27],
  },
  {
    num: '02',
    name: 'MODERNISATION',
    line: 'Evolving systems, platforms and ways of working.', /* PLACEHOLDER */
    accent: '#7cc4ff',
    window: [0.24, 0.29, 0.36, 0.41],
  },
  {
    num: '03',
    name: 'CUSTOMER EXPERIENCE',
    line: 'Connecting delivery decisions to real customer outcomes.', /* PLACEHOLDER */
    accent: '#ff6e79',
    window: [0.38, 0.43, 0.5, 0.55],
  },
  {
    num: '04',
    name: 'PROCESS OPTIMISATION',
    line: 'Removing friction and creating clearer flows.', /* PLACEHOLDER */
    accent: '#e8c188',
    window: [0.52, 0.57, 0.64, 0.69],
  },
  {
    num: '05',
    name: 'QUALITY EVOLUTION',
    line: 'Strengthening confidence across change and delivery.', /* PLACEHOLDER */
    accent: '#c490d9',
    window: [0.66, 0.71, 0.78, 0.83],
  },
]

export const FOCUS_TITLE_OUT: readonly [number, number] = [0.07, 0.11]
export const FOCUS_CLOSE_IN: readonly [number, number] = [0.85, 0.92]

/** Stream colours: coral, violet, ice, champagne. */
export const FOCUS_STREAM_COLORS = ['#ff6e79', '#9d6bff', '#7cc4ff', '#e8c188']

/** One evolving field: intro → five focus states → forward close. */
export const FOCUS_PHASES: FieldPhase[] = [
  /* intro — energetic braid */
  { sep: 0.55, amp: 0.9, f1: 1.1, chaos: 0.35, spread: 0.28, align: 0, pull: 0, flow: 0.9, op: [0.85, 0.85, 0.85, 0.85] },
  /* AI & Automation — clusters react and reorganize */
  { sep: 1.1, amp: 0.7, f1: 1.6, chaos: 0.5, spread: 0.3, align: 0.8, pull: 0, flow: 1.4, op: [0.25, 1, 0.5, 0.3] },
  /* Modernisation — old paths dissolve, cleaner structures emerge */
  { sep: 1.2, amp: 0.6, f1: 1.2, chaos: 0.25, spread: 0.5, align: 0.75, pull: 0, flow: 1.0, op: [0.2, 0.4, 1, 0.5] },
  /* Customer Experience — paths converge to one clear point */
  { sep: 0.9, amp: 0.5, f1: 1.0, chaos: 0.15, spread: 0.2, align: 0.3, pull: 0.55, flow: 0.9, op: [1, 0.3, 0.5, 0.35] },
  /* Process Optimisation — loops disappear, movement becomes direct */
  { sep: 1.3, amp: 0.18, f1: 0.7, chaos: 0.05, spread: 0.12, align: 0.8, pull: 0, flow: 1.6, op: [0.3, 0.3, 0.3, 1] },
  /* Quality Evolution — waves synchronize */
  { sep: 1.1, amp: 0.5, f1: 1.2, chaos: 0, spread: 0.12, align: 0.6, pull: 0, flow: 0.7, op: [0.85, 0.85, 0.85, 0.85] },
  /* closing — one forward-moving field */
  { sep: 0.7, amp: 0.35, f1: 0.8, chaos: 0.1, spread: 0.16, align: 0.7, pull: 0, flow: 1.4, op: [0.9, 0.9, 0.9, 0.9] },
]

export function focusWeights(p: number): number[] {
  const w = [
    1 - smoothstep(0.07, 0.115, p),
    ...FOCUS_AREAS.map((f) => fadeWindow(p, f.window[0], f.window[1], f.window[2], f.window[3])),
    smoothstep(0.82, 0.9, p),
  ]
  const sum = w.reduce((a, b) => a + b, 0) || 1
  return w.map((x) => x / sum)
}
