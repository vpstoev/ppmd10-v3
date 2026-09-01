/**
 * Teams & People — content and scroll choreography.
 *
 * Headlines, descriptions and distinctive facts come from the content
 * workbook. Team sizes and leadership structure come from peopleData,
 * which is authoritative for both.
 *
 * The three evidence figures each team can carry are still `TBD` in the
 * workbook, so the importer withholds them and the chapters render
 * without a figures block rather than printing "TBD" three times under a
 * team's name. When real numbers are entered, they appear on the next
 * import with no code change.
 */
import { WB_TEAMS } from '../ppmd-content/workbookContent'
import { fadeWindow, smoothstep } from '../hg-hero/heroTheme'
import type { FieldPhase } from '../ppmd-shared/StreamField'
import type { Team } from './teamTypes'

/* intro 60 + SD 140 + DH 140 + 3×130 chapters + PM 300 + PROC 240 +
   BPT 200 + closing 120 ≈ 1700vh */
export const TEAMS_VH = 1700

/**
 * Everything about a team chapter that the workbook does not carry: where
 * it sits in the scroll, what colour it is lit in, how many leadership
 * functions to expect, and the one supporting line the roster field
 * itself needs — which describes the composition on screen rather than
 * the team, and so has no column in a content workbook.
 */
const CHAPTERS: Record<
  string,
  {
    id: string
    shortName: string
    rosterLede: string
    accent: string
    leadershipCount: number
    window: readonly [number, number, number, number]
  }
> = {
  PM: {
    id: 'pm',
    shortName: 'PROJECT MANAGEMENT',
    rosterLede: 'A connected delivery system powered by people, coordination and shared direction.',
    accent: '#ff6e79' /* coral rose */,
    leadershipCount: 3,
    window: [0.2, 0.222, 0.265, 0.287],
  },
  PROCESSES: {
    id: 'pp',
    shortName: 'PROCESS & PROCEDURES',
    rosterLede: 'Creating clearer, more consistent and scalable ways of working.',
    accent: '#e8c188' /* champagne */,
    leadershipCount: 1,
    window: [0.276, 0.298, 0.341, 0.363],
  },
  BPT: {
    id: 'bpt',
    shortName: 'BPT & TESTING',
    rosterLede: 'Validating processes and solutions before they reach the customer.',
    accent: '#7cc4ff' /* ice blue */,
    leadershipCount: 1,
    window: [0.352, 0.374, 0.417, 0.439],
  },
}

export const TEAMS: Team[] = WB_TEAMS.flatMap((w) => {
  const chapter = CHAPTERS[w.id]
  if (!chapter) return []
  return [
    {
      id: chapter.id,
      /* The workbook's display order, kept for sequencing and for keys.
         It is not rendered: the eyebrow carries the team's name and its
         accent, and nothing else. */
      num: String(w.displayOrder).padStart(2, '0'),
      name: chapter.shortName,
      rosterTitle: (w.name ?? chapter.shortName).toUpperCase(),
      rosterLede: chapter.rosterLede,
      headline: w.headline ?? '',
      description: w.description ?? '',
      accent: chapter.accent,
      /* Empty until the workbook holds real figures — see the note above. */
      facts: w.facts.flatMap((f) =>
        f.value && f.label ? [{ value: f.value, label: f.label }] : [],
      ),
      distinctiveFact: w.distinctiveFact ?? '',
      leadershipCount: chapter.leadershipCount,
      window: chapter.window,
    },
  ]
})

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

/** A short, explicit People chapter between the team stories and the
 * rosters. Keeping this as its own beat makes the section discoverable in
 * the long pinned sequence instead of making the portraits feel like they
 * appeared without an editorial handoff. */
export const PEOPLE_INTRO_WINDOW: readonly [number, number, number, number] = [0.4, 0.415, 0.445, 0.465]

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
  /* 6–8 — one ambient system per roster, each expressing what that team
     does. Every shared value below (sep, amp, spread, flow, and the whole
     opacity set) is deliberately IDENTICAL across the three: coverage,
     density, motion speed and contrast are held equal so no team reads as
     the showcase. Only the behaviour flag differs, so the difference is
     entirely one of system behaviour rather than of graphic style.
     The team's own colour leads at 0.85; the other three sit near 0.30 as
     connective material — enough to build the structure across the whole
     frame, never enough to compete with the portraits in front of it. */
  /* 6 PM roster — orchestration: coordinated trajectories + milestones.
     Two clear zones: the leadership rank, and the wider member block whose
     role labels and bios the coral flow used to cut straight through. */
  {
    sep: 1.1, amp: 0.5, f1: 1.0, chaos: 0.3, spread: 0.45, align: 0.2, pull: 0, flow: 0.3,
    orchestration: 1, op: [0.85, 0.3, 0.28, 0.3],
    /* One zone per rank rather than a single slab: the gaps between the
       leadership row and the two member rows stay open, so the trajectory
       structure still reads through the composition instead of the whole
       lower frame going dark. */
    clear: [
      { x: 0, y: 1.95, rx: 2.9, ry: 1.2, s: 0.74 },
      { x: 0, y: -1.15, rx: 5.1, ry: 1.1, s: 0.82 },
      { x: -0.15, y: -3.0, rx: 4.2, ry: 1.05, s: 0.82 },
    ],
  },
  /* 7 P&P roster — flow architecture: complexity resolving into lanes */
  {
    sep: 1.1, amp: 0.5, f1: 1.0, chaos: 0.3, spread: 0.45, align: 0.2, pull: 0, flow: 0.3,
    structure: 1, op: [0.3, 0.85, 0.28, 0.3],
    clear: [
      { x: -4.1, y: -0.3, rx: 1.35, ry: 1.6, s: 0.8 },
      { x: 1.1, y: -0.5, rx: 4.4, ry: 2.7, s: 0.88 },
    ],
  },
  /* 8 BPT roster — validation field: a matrix under a slow sweep */
  {
    sep: 1.1, amp: 0.5, f1: 1.0, chaos: 0.3, spread: 0.45, align: 0.2, pull: 0, flow: 0.3,
    validation: 1, op: [0.3, 0.28, 0.85, 0.3],
    clear: [
      { x: -2.75, y: -0.3, rx: 1.4, ry: 1.65, s: 0.8 },
      { x: 1.1, y: -0.5, rx: 3.0, ry: 2.6, s: 0.88 },
    ],
  },
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
