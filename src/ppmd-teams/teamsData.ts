/**
 * Teams & People — content and scroll choreography.
 * Team copy is PLACEHOLDER; the fact values are explicitly TBD and must
 * not be presented as verified numbers. Team sizes and leadership
 * structure come from peopleData (authoritative).
 */
import { fadeWindow, smoothstep } from '../hg-hero/heroTheme'
import type { FieldPhase } from '../ppmd-shared/StreamField'
import type { Team } from './teamTypes'

/* intro 60 + SD 140 + DH 140 + 3×130 chapters + PM 300 + PROC 240 +
   BPT 200 + closing 120 ≈ 1700vh */
export const TEAMS_VH = 1700

export const TEAMS: Team[] = [
  {
    id: 'pm',
    num: '01',
    name: 'PROJECT MANAGEMENT',
    rosterTitle: 'PROJECT MANAGEMENT TEAM',
    headline: 'COORDINATING COMPLEX DELIVERY',
    description: 'Connecting people, priorities and decisions across complex initiatives.', /* PLACEHOLDER */
    accent: '#ff6e79', /* coral rose */
    facts: [
      /* TBD values — do not present as verified numbers */
      { value: 'TBD', label: 'Projects delivered' },
      { value: 'TBD', label: 'Professional certifications' },
      { value: 'TBD', label: 'Years of combined experience' },
    ],
    distinctiveFact: 'From strategic programmes to customer-facing delivery.', /* PLACEHOLDER */
    leadershipCount: 3,
    window: [0.2, 0.222, 0.265, 0.287],
  },
  {
    id: 'pp',
    num: '02',
    name: 'PROCESS & PROCEDURES',
    rosterTitle: 'PROCESS & PROCEDURES MANAGEMENT TEAM',
    headline: 'DESIGNING HOW WORK FLOWS',
    description: 'Creating clearer, more consistent and scalable ways of working.', /* PLACEHOLDER */
    accent: '#e8c188', /* champagne */
    facts: [
      /* TBD values — do not present as verified numbers */
      { value: 'TBD', label: 'Processes improved' },
      { value: 'TBD', label: 'Procedures managed' },
      { value: 'TBD', label: 'Years of combined experience' },
    ],
    distinctiveFact: 'Turning complexity into repeatable ways of working.', /* PLACEHOLDER */
    leadershipCount: 1,
    window: [0.276, 0.298, 0.341, 0.363],
  },
  {
    id: 'bpt',
    num: '03',
    name: 'BPT & TESTING',
    rosterTitle: 'BPT & TESTING TEAM',
    headline: 'BUILDING CONFIDENCE IN CHANGE',
    description: 'Validating processes and solutions before they reach the customer.', /* PLACEHOLDER */
    accent: '#7cc4ff', /* ice blue */
    facts: [
      /* TBD values — do not present as verified numbers */
      { value: 'TBD', label: 'Deliveries validated' },
      { value: 'TBD', label: 'Testing cycles' },
      { value: 'TBD', label: 'Years of combined experience' },
    ],
    distinctiveFact: 'Finding issues before they become customer issues.', /* PLACEHOLDER */
    leadershipCount: 1,
    window: [0.352, 0.374, 0.417, 0.439],
  },
]

/* Person.team values, in section order — must match peopleData records. */
export const TEAM_NAMES = ['Project Management', 'Process & Procedures', 'BPT & Testing']

/** Narrative windows across the 1700vh section. */
export const TEAMS_OPENING_OUT: readonly [number, number] = [0.025, 0.045]
export const SD_WINDOW: readonly [number, number, number, number] = [0.04, 0.06, 0.105, 0.125]
export const DH_WINDOW: readonly [number, number, number, number] = [0.115, 0.135, 0.185, 0.205]

/** People chapter block windows (state 1 = leadership only). */
export const PEOPLE_WINDOWS: ReadonlyArray<readonly [number, number, number, number]> = [
  [0.43, 0.455, 0.6, 0.622], /* PM — 300vh */
  [0.607, 0.632, 0.735, 0.758], /* PROC — 240vh */
  [0.748, 0.772, 0.855, 0.877], /* BPT — 200vh */
]
/** State 2 — members assemble around the leadership group. */
export const MEMBERS_IN: ReadonlyArray<readonly [number, number]> = [
  [0.49, 0.535],
  [0.655, 0.7],
  [0.795, 0.838],
]

export const TEAMS_CLOSE1_IN: readonly [number, number] = [0.895, 0.925]
export const TEAMS_CLOSE2_IN: readonly [number, number] = [0.92, 0.95]

/** Stream colours: one per team plus a violet support strand. */
export const TEAMS_STREAM_COLORS = ['#ff6e79', '#e8c188', '#7cc4ff', '#9d6bff']

/** Field narrative: wide area → converge (Senior Director) → focus
    (Department Head) → three team states → calm connective backdrop
    per roster → final convergence. Streams stay connective material
    behind the portrait compositions. */
export const TEAMS_PHASES: FieldPhase[] = [
  /* 0 intro — wide braid, the whole area */
  { sep: 0.7, amp: 1.1, f1: 1.0, chaos: 0.4, spread: 0.5, align: 0, pull: 0, flow: 0.55, op: [0.85, 0.85, 0.85, 0.85] },
  /* 1 Senior Director — distant strands toward one shared direction */
  { sep: 0.6, amp: 0.8, f1: 0.9, chaos: 0.3, spread: 0.4, align: 0.4, pull: 0.35, flow: 0.5, op: [0.7, 0.8, 0.7, 0.7] },
  /* 2 Department Head — the field narrows and focuses */
  { sep: 0.45, amp: 0.5, f1: 1.0, chaos: 0.18, spread: 0.2, align: 0.5, pull: 0.65, flow: 0.6, op: [0.75, 0.65, 0.75, 0.8] },
  /* 3 PM chapter — coral, fast, coordinated */
  { sep: 1.4, amp: 0.5, f1: 0.9, chaos: 0.1, spread: 0.15, align: 0.3, pull: 0, flow: 1.5, op: [1, 0.15, 0.15, 0.2] },
  /* 4 P&P chapter — champagne rhythm */
  { sep: 1.4, amp: 0.7, f1: 2.2, chaos: 0.03, spread: 0.12, align: 0.9, pull: 0, flow: 0.8, op: [0.15, 1, 0.12, 0.15] },
  /* 5 BPT chapter — ice + violet validation */
  { sep: 1.4, amp: 0.6, f1: 1.4, chaos: 0.15, spread: 0.14, align: 0.55, pull: 0, flow: 0.9, op: [0.12, 0.12, 1, 0.75] },
  /* 6–8 calm connective backdrop behind each roster */
  { sep: 1.1, amp: 0.5, f1: 1.0, chaos: 0.3, spread: 0.45, align: 0.2, pull: 0, flow: 0.3, op: [0.45, 0.06, 0.06, 0.08] },
  { sep: 1.1, amp: 0.5, f1: 1.0, chaos: 0.3, spread: 0.45, align: 0.2, pull: 0, flow: 0.3, op: [0.06, 0.45, 0.06, 0.08] },
  { sep: 1.1, amp: 0.5, f1: 1.0, chaos: 0.3, spread: 0.45, align: 0.2, pull: 0, flow: 0.3, op: [0.06, 0.06, 0.45, 0.25] },
  /* 9 closing — one department */
  { sep: 0.5, amp: 0.5, f1: 1.0, chaos: 0.15, spread: 0.2, align: 0.4, pull: 0.75, flow: 0.6, op: [0.9, 0.9, 0.9, 0.9] },
]

export function teamsWeights(p: number): number[] {
  const w = [
    1 - smoothstep(0.03, 0.05, p),
    fadeWindow(p, SD_WINDOW[0], SD_WINDOW[1], SD_WINDOW[2], SD_WINDOW[3]),
    fadeWindow(p, DH_WINDOW[0], DH_WINDOW[1], DH_WINDOW[2], DH_WINDOW[3]),
    ...TEAMS.map((t) => fadeWindow(p, t.window[0], t.window[1], t.window[2], t.window[3])),
    ...PEOPLE_WINDOWS.map((r) => fadeWindow(p, r[0], r[1], r[2], r[3])),
    smoothstep(0.88, 0.92, p),
  ]
  const sum = w.reduce((a, b) => a + b, 0) || 1
  return w.map((x) => x / sum)
}
