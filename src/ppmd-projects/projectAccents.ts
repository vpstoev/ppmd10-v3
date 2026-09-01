/**
 * The Projects palette.
 *
 * Sixteen projects need more than the five colours the rest of the site
 * runs on, or half of them end up sharing a hue with their neighbour and
 * the section reads as one long scene. The six core tokens are unchanged
 * — they are what ties this section to the Timeline, the Teams and the
 * Hero — and seven more are added alongside them, chosen to sit in the
 * same register: saturated enough to be told apart on a near-black page,
 * never so hot that a gradient behind text becomes a light source.
 *
 * They are used as GRADIENT ENDS, not as fills. Every project draws its
 * colour as a two-stop wash at low opacity behind an abstract line
 * figure; nothing on this page is a solid area of colour.
 */

/** The tokens the rest of the experience already uses. */
export const CORE = {
  coralRose: '#ff6e79',
  champagne: '#e8c188',
  electricViolet: '#9d6bff',
  iceBlue: '#7cc4ff',
  warmWhite: '#fff1e0',
} as const

/** Added for this section, so sixteen projects can be told apart. */
export const EXTENDED = {
  hotCoral: '#FF536A',
  magenta: '#EA5AC8',
  indigo: '#6F74FF',
  cyan: '#55D9FF',
  teal: '#48D5C4',
  amber: '#F2B861',
  mint: '#79E0B6',
} as const

export const ACCENTS = { ...CORE, ...EXTENDED }

export type AccentName = keyof typeof ACCENTS

/**
 * The iridescent treatment, kept as a name rather than a colour.
 *
 * One project closes the section and one milestone closes the Timeline;
 * both are drawn with the full spectrum sweep rather than a hue, which is
 * a different kind of value and is resolved in CSS.
 */
export const IRIDESCENT_STOPS = [
  CORE.coralRose,
  EXTENDED.magenta,
  CORE.electricViolet,
  CORE.iceBlue,
  EXTENDED.teal,
  CORE.champagne,
] as const

export interface ProjectAccent {
  /** The colour the project's text and rule are drawn in. */
  dominant: string
  /** Gradient start and end for the numeral and the background figure. */
  from: string
  to: string
  /** Optional middle stop, for the one mapping written with three names. */
  via?: string
  /** The closing programme, drawn with the whole spectrum. */
  iridescent?: boolean
}

const A = ACCENTS

/**
 * Accent per project, by workbook id.
 *
 * `dominant` is always one of that project's own two ends — it is which
 * of them leads, not a third colour. Which one leads is chosen so that no
 * two projects in a row lead with the same hue: the section is read in
 * order, and two neighbours sharing a colour reads as one scene that
 * failed to change rather than as two projects.
 */
export const PROJECT_ACCENTS: Record<string, ProjectAccent> = {
  /* champagne → coral rose */
  'PRJ-01': { dominant: A.champagne, from: A.champagne, to: A.coralRose },
  /* ice blue → electric violet */
  'PRJ-02': { dominant: A.electricViolet, from: A.iceBlue, to: A.electricViolet },
  /* ice blue → warm white */
  'PRJ-03': { dominant: A.iceBlue, from: A.iceBlue, to: A.warmWhite },
  /* hot coral → magenta */
  'PRJ-04': { dominant: A.magenta, from: A.hotCoral, to: A.magenta },
  /* electric violet → indigo */
  'PRJ-05': { dominant: A.indigo, from: A.electricViolet, to: A.indigo },
  /* champagne → ice blue */
  'PRJ-06': { dominant: A.champagne, from: A.champagne, to: A.iceBlue },
  /* mint · teal → cyan — the one mapping written with three colours */
  'PRJ-07': { dominant: A.cyan, from: A.mint, via: A.teal, to: A.cyan },
  /* coral rose → electric violet */
  'PRJ-08': { dominant: A.coralRose, from: A.coralRose, to: A.electricViolet },
  /* magenta → electric violet */
  'PRJ-09': { dominant: A.magenta, from: A.magenta, to: A.electricViolet },
  /* teal → ice blue */
  'PRJ-10': { dominant: A.teal, from: A.teal, to: A.iceBlue },
  /* electric violet → coral rose */
  'PRJ-11': { dominant: A.electricViolet, from: A.electricViolet, to: A.coralRose },
  /* champagne → warm white */
  'PRJ-12': { dominant: A.champagne, from: A.champagne, to: A.warmWhite },
  /* electric violet, alone */
  'PRJ-13': { dominant: A.electricViolet, from: A.electricViolet, to: A.indigo },
  /* coral rose, alone */
  'PRJ-14': { dominant: A.coralRose, from: A.coralRose, to: A.hotCoral },
  /* warm white → champagne */
  'PRJ-15': { dominant: A.warmWhite, from: A.warmWhite, to: A.champagne },
  /* Entitlement Server — quiet ice-to-white, so the long programme copy
     has a calm reading field rather than a second focal point. */
  'PRJ-16': {
    dominant: A.iceBlue,
    from: A.iceBlue,
    to: A.warmWhite,
  },
}

/** The wash drawn behind a project's figure. Subtle by construction. */
export function accentGradient(a: ProjectAccent, angle = 148): string {
  const stops = a.via ? `${a.from}, ${a.via}, ${a.to}` : `${a.from}, ${a.to}`
  return `linear-gradient(${angle}deg, ${stops})`
}
