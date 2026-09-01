/**
 * THE CHORUS.
 *
 * What the opening is made of: twenty-one names and short fragments of
 * what those people actually wrote, and the words the whole thing
 * eventually resolves into.
 *
 * Every fragment is an EXACT substring of its testimonial. Nothing here
 * is a summary or a paraphrase — a fragment drifting past in the opening
 * is a piece of the same sentence the reader will meet in full later,
 * which is the only reason the opening is about these twenty-one people
 * rather than about typography.
 *
 * Positions are computed once, at module load, from a fixed table and a
 * fixed separation pass. Nothing is random at runtime: the composition
 * is identical in every build and on every machine, so it can be
 * reviewed as a composition.
 */
import { VOICES } from './voicesData'
import { primaryTheme } from './voiceThemes'

/**
 * One short phrase per person, for the drifting chorus.
 *
 * Two to five words. The emphasis mapping in `voiceEmphasis` holds the
 * longer phrases that get lifted inside the full testimonial; these are
 * deliberately shorter, because a fragment crossing the screen at a
 * third of its size has to be readable in a glance.
 */
export const CHORUS_PHRASE: Record<string, string> = {
  'VOICE-01': 'proven professionalism',
  'VOICE-02': 'a key driver',
  'VOICE-03': 'a trusted partner',
  'VOICE-04': 'highly dependable partners',
  'VOICE-05': 'smooth and straightforward',
  'VOICE-06': 'positive attitude',
  'VOICE-07': 'a trusted and valuable partner',
  'VOICE-08': 'Hustle together, win together!',
  'VOICE-09': 'the true Champions',
  'VOICE-10': 'an immediate sense of confidence',
  'VOICE-11': 'above and beyond',
  'VOICE-12': 'highly productive',
  'VOICE-13': 'a genuine culture of collaboration',
  'VOICE-14': 'always finds a way forward',
  'VOICE-15': 'a genuine pleasure',
  'VOICE-16': 'keeping things moving',
  'VOICE-17': 'great collaboration',
  'VOICE-18': 'still going strong',
  'VOICE-19': 'an exceptional group',
  'VOICE-20': 'a resounding BRAVO',
  'VOICE-21': 'a flexible, solution-oriented approach',
}

/* ── Depth ───────────────────────────────────────────────────
   Five planes. Scale, opacity and blur all move together, because that
   is what depth is; and each plane travels at its own rate and in its
   own direction, which is what makes it read as depth rather than as
   one sheet of text sliding about. */
export interface Plane {
  scale: number
  opacity: number
  blur: number
  /** How far this plane travels across the opening, in vw. */
  driftX: number
  driftY: number
  /** Seconds for one cycle of the idle breath. */
  breath: number
  z: number
}

export const PLANES: Plane[] = [
  { scale: 0.44, opacity: 0.3, blur: 2.4, driftX: -7, driftY: 2.4, breath: 27, z: 1 },
  { scale: 0.62, opacity: 0.44, blur: 1.4, driftX: 11, driftY: -1.8, breath: 23, z: 2 },
  { scale: 0.86, opacity: 0.62, blur: 0.6, driftX: -16, driftY: 1.2, breath: 19, z: 4 },
  { scale: 1.12, opacity: 0.8, blur: 0, driftX: 22, driftY: -2.6, breath: 16, z: 5 },
  { scale: 1.5, opacity: 0.94, blur: 0, driftX: -30, driftY: 3.2, breath: 13, z: 6 },
]

export interface ChorusItem {
  key: string
  voiceId: string
  text: string
  kind: 'name' | 'phrase'
  plane: number
  /** Percentages of the stage. */
  x: number
  y: number
  /** Per-item offset into the idle breath, so nothing moves in step. */
  delay: number
  color: string
}

/* ── Deterministic scatter ───────────────────────────────────
   A seeded hash rather than Math.random: the same forty positions every
   time, but without the regularity of a grid. */
function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0) / 4294967296
}

/**
 * Roughly how wide a piece of text sits on the stage, as a percentage.
 *
 * Used only by the separation pass, and deliberately generous — a box
 * estimated slightly too large costs a little air, one estimated too
 * small costs a collision nobody sees until it is on screen.
 */
function widthPct(text: string, scale: number): number {
  /* Type is set at 1.25vw per unit of plane scale, so its width in
     PERCENT of the stage is independent of the viewport — which is the
     whole reason the scatter can be authored once in percentages. */
  return text.length * 0.62 * scale * 1.25
}
function heightPct(scale: number): number {
  return (scale * 30) / 10.8
}

/**
 * Forty items, placed.
 *
 * Names take the three nearer planes, where they are legible; fragments
 * take the two far ones, where they are texture. The middle of the
 * stage is kept clear — that is where the oversized word sits, and
 * later where the statement assembles.
 */
function build(): ChorusItem[] {
  const items: ChorusItem[] = []

  VOICES.forEach((v, i) => {
    const color = primaryTheme(v.id).color
    /* Keep a new approved voice from taking the whole composition down if
       its editorial phrase has not been added yet. The first four words of
       the approved quote are still an exact fragment of that quote. */
    const phrase = CHORUS_PHRASE[v.id] ?? v.quote.split(/\s+/).slice(0, 4).join(' ')
    /* Names cycle through the near planes, fragments through the far. */
    const namePlane = 2 + (i % 3)
    const phrasePlane = i % 2
    const hn = hash(v.id + '~n')
    const hp = hash(v.id + '~p')

    items.push({
      key: `n-${v.id}`,
      voiceId: v.id,
      text: v.name,
      kind: 'name',
      plane: namePlane,
      x: 4 + ((i * 37) % 92),
      y: 6 + hn * 88,
      delay: -hn * 20,
      color,
    })
    items.push({
      key: `p-${v.id}`,
      voiceId: v.id,
      text: phrase,
      kind: 'phrase',
      plane: phrasePlane,
      x: 3 + ((i * 53 + 21) % 94),
      y: 5 + hp * 90,
      delay: -hp * 20,
      color,
    })
  })

  /* ── Separation ──────────────────────────────────────────────
     Push apart anything that touches, and push everything out of the
     middle band where the display word and the statement live. Runs
     once, here, on a fixed input — so it is part of the composition
     rather than something the browser does differently each time. */
  const CLEAR = { x: 50, y: 50, halfW: 26, halfH: 17 }
  for (let pass = 0; pass < 260; pass++) {
    for (let i = 0; i < items.length; i++) {
      const a = items[i]
      const pa = PLANES[a.plane]
      const aw = widthPct(a.text, pa.scale)
      const ah = heightPct(pa.scale)

      for (let j = i + 1; j < items.length; j++) {
        const b = items[j]
        const pb = PLANES[b.plane]
        const bw = widthPct(b.text, pb.scale)
        const bh = heightPct(pb.scale)
        const dx = b.x - a.x
        const dy = b.y - a.y
        const needX = (aw + bw) / 2 + 2.2
        const needY = (ah + bh) / 2 + 1.4
        if (Math.abs(dx) >= needX || Math.abs(dy) >= needY) continue
        /* Separate along whichever axis needs least travel. */
        const pushX = needX - Math.abs(dx)
        const pushY = needY - Math.abs(dy)
        if (pushX / needX < pushY / needY) {
          const s = (dx >= 0 ? 1 : -1) * pushX * 0.5
          a.x -= s
          b.x += s
        } else {
          const s = (dy >= 0 ? 1 : -1) * pushY * 0.5
          a.y -= s
          b.y += s
        }
      }

      /* Out of the middle. */
      const w2 = aw / 2
      const h2 = ah / 2
      const ox = CLEAR.halfW + w2 - Math.abs(a.x - CLEAR.x)
      const oy = CLEAR.halfH + h2 - Math.abs(a.y - CLEAR.y)
      if (ox > 0 && oy > 0) {
        if (ox / (CLEAR.halfW + w2) < oy / (CLEAR.halfH + h2)) {
          a.x += (a.x >= CLEAR.x ? 1 : -1) * ox
        } else {
          a.y += (a.y >= CLEAR.y ? 1 : -1) * oy
        }
      }

      /* Wholly inside the stage AT REST. Pieces leave through the frame
         later, carried out by their plane's travel — but a name that is
         already cut in half before anyone has scrolled reads as a
         mistake rather than as a crop. */
      a.x = Math.min(Math.max(a.x, w2 + 1.5), 98.5 - w2)
      a.y = Math.min(Math.max(a.y, h2 + 2), 98 - h2)
    }
  }

  return items.map((it) => ({
    ...it,
    x: Math.round(it.x * 100) / 100,
    y: Math.round(it.y * 100) / 100,
  }))
}

export const CHORUS: ChorusItem[] = build()

/* ── The author field ────────────────────────────────────────
   After the statement has been held, the twenty-one names lay out again —
   this time calmly, evenly and large enough to choose from. A staggered
   four-column arrangement rather than a grid: every other row is offset,
   so no two names ever line up into a column edge. */
export interface FieldSeat {
  id: string
  name: string
  role?: string
  unit?: string
  color: string
  x: number
  y: number
  /** Nearer names are set a little larger — the field has depth too. */
  scale: number
  delay: number
}

export const FIELD: FieldSeat[] = VOICES.map((v, i) => {
  const col = i % 4
  const row = Math.floor(i / 4)
  const h = hash(v.id + '~f')
  return {
    id: v.id,
    name: v.name,
    role: v.role,
    unit: v.unit,
    color: primaryTheme(v.id).color,
    x: 12 + col * 25.5 + (row % 2 ? 6.5 : 0) + (h - 0.5) * 2.4,
    y: 11 + row * 15.2 + (h - 0.5) * 2.2,
    scale: 0.9 + ((i * 7) % 5) * 0.06,
    delay: -h * 14,
  }
})

/* ── The words that assemble ─────────────────────────────────
   Each token carries where it comes FROM: an offset in stage
   percentages, a scale and a rotation that the convergence unwinds to
   nothing. They are authored so the tokens arrive from the same spread
   of directions the chorus occupies, rather than all sliding in from
   one side. */
export interface Token {
  text: string
  line: number
  fromX: number
  fromY: number
  fromScale: number
}

export const STATEMENT: Token[] = [
  { text: '21', line: 0, fromX: -34, fromY: -26, fromScale: 0.35 },
  { text: 'VOICES.', line: 0, fromX: 29, fromY: -33, fromScale: 0.45 },
  { text: 'ONE', line: 1, fromX: -41, fromY: 24, fromScale: 0.4 },
  { text: 'SHARED', line: 1, fromX: 12, fromY: 36, fromScale: 0.3 },
  { text: 'VIEW.', line: 1, fromX: 38, fromY: 22, fromScale: 0.5 },
]

export const CLOSING: Token[] = [
  { text: 'TEN', line: 0, fromX: -38, fromY: -30, fromScale: 0.3 },
  { text: 'YEARS', line: 0, fromX: 8, fromY: -38, fromScale: 0.4 },
  { text: 'OF', line: 0, fromX: 35, fromY: -24, fromScale: 0.5 },
  { text: 'PEOPLE,', line: 1, fromX: -44, fromY: 6, fromScale: 0.35 },
  { text: 'STRUCTURE', line: 1, fromX: 26, fromY: 14, fromScale: 0.3 },
  { text: 'AND', line: 2, fromX: -20, fromY: 34, fromScale: 0.45 },
  { text: 'DELIVERY.', line: 2, fromX: 30, fromY: 30, fromScale: 0.38 },
]

/** Grouped by line, for rendering. */
export function byLine(tokens: Token[]): Token[][] {
  const lines: Token[][] = []
  for (const t of tokens) (lines[t.line] ??= []).push(t)
  return lines
}

/* ── The timeline ────────────────────────────────────────────
   Every phase is a window on one number: how far the stage has been
   scrolled through, from 0 when it pins to 1 when it releases. They
   live here rather than in the component because they are the shape of
   the section, and because a test can then check the shape without
   standing a React tree up around it.

   Windows overlap on purpose — a phase begins arriving before the one
   before it has finished leaving, which is what makes the sequence read
   as one movement instead of five slides. */
export const TIMELINE = {
  /** The chorus fading as the pieces are gathered. */
  openOut: [0.12, 0.28],
  /** Chorus contracts, statement tokens fly in from their origins. */
  converge: [0.16, 0.34],
  statementIn: [0.22, 0.3],
  statementOut: [0.42, 0.48],
  fieldIn: [0.43, 0.54],
  fieldOut: [0.8, 0.86],
  /** The chorus returning for the closing. */
  returnIn: [0.8, 0.92],
  closingIn: [0.86, 0.96],
  exit: [0.98, 1],
} as const

/** Linear interpolation across stops, clamped — what `useTransform` does. */
export function ramp(p: number, stops: readonly number[], values: readonly number[]): number {
  if (p <= stops[0]) return values[0]
  const n = stops.length - 1
  if (p >= stops[n]) return values[n]
  for (let i = 0; i < n; i++) {
    if (p <= stops[i + 1]) {
      const t = (p - stops[i]) / (stops[i + 1] - stops[i])
      return values[i] + (values[i + 1] - values[i]) * t
    }
  }
  return values[n]
}
