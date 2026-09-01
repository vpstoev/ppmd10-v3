/**
 * THE THREE TEAM FIELDS.
 *
 * One design family, three arrangements. Every field is the same
 * ellipsoid cap, seated and projected by the same `spatialLayout`, drawn
 * with the same portraits, the same label typography and the same
 * interaction — so what distinguishes them is composition alone, which is
 * the only thing that should differ between three teams of one department.
 *
 *   Project Management    field  — one team in three bands, threaded by
 *                                  shared curves that cross the whole
 *                                  composition
 *   Process & Procedures  orbit  — one lead at the centre, ten colleagues
 *                                  on two staggered shells
 *   BPT & Testing         orbit  — one lead at the centre, six colleagues
 *                                  on one shell
 *
 * Process and BPT deliberately share their structural logic: a manager at
 * the true centre and equal peers around them. They differ in density and
 * in the number of shells, not in kind. Project Management is the one that
 * is not a ring — fifteen people arranged for balance, with no seat
 * belonging to anybody but the team.
 *
 * Nothing here is generated: these are editorial compositions and they
 * stay reviewable as ones. The two orbits are hand-placed lateral (u, v)
 * coordinates on the unit disc, u right and v up. Project Management is
 * written in the units it is reviewed in — percent across and down the
 * visible field — and converted to seats by `unproject`, because its
 * positions are the design rather than a starting point for the solver.
 */
import { unproject } from './spatialLayout'
import type { CompositionKind, LinkSpec, SeatSpec } from './spatialLayout'

export interface TeamComposition {
  kind: CompositionKind
  seats: SeatSpec[]
  links: LinkSpec[]
  /**
   * Whether these seats are a fixed arrangement rather than a starting
   * point.
   *
   * An ordinary composition is authored, then spread by reviewed numbers
   * and separated by the relaxation pass, which is free to move anybody
   * as far as it needs to. That is the right trade for a field whose
   * shape is a general one — a ring, a pair of shells — because the pass
   * only ever has to nudge, and where it nudges to does not matter.
   *
   * It is the wrong trade for a composition where the positions are the
   * design. Here the seats are held at their anchors (see `PIN_FRACTION`)
   * and the field is fitted to the frame rather than spread by numbers
   * written for one width, so the arrangement is the same arrangement at
   * every size and the pass cannot re-draw it.
   */
  anchored?: boolean
  /**
   * Lateral spread across the frame, in viewport percent [x, y]. Wide
   * frames only — on a narrow or tall one the spread is solved from the
   * frame instead (`frameSpread`), because a phone and a portrait tablet
   * differ more from each other than either does from a laptop.
   */
  spread: readonly [number, number]
  /**
   * How the field arrives and how it leaves, as multipliers on `spread`.
   *
   * These are what make three chapters read as one system reorganising
   * rather than three layouts swapped in the same slot. Each entry shape
   * is the previous composition's exit shape expressed in this one's
   * units, so the field that fades out and the field that fades in are
   * the same shape at the moment they cross.
   */
  enterShape: readonly [number, number]
  exitShape: readonly [number, number]
}

/* ── Project Management — one team, three bands ────────────────
   Fifteen people in one field: a top arc, a row across the middle and a
   bottom arc, with a side position holding each end of the middle row.

   This composition is FIXED. It is written below as positions on the
   visible field rather than as lateral coordinates on the cap, because
   that is the form it is reviewed in — "upper far-left", "exact visual
   centre", "slightly higher than Veselin" are statements about the
   screen, and anything else is a translation somebody has to do in their
   head every time they read it. `unproject` does that translation, and
   the scene fits the result to whatever frame it is given, so these
   numbers describe the arrangement at every size rather than at one.

   The three highlighted roles — Dragomir Apostolov at the centre with
   Valentin Stoev and Petar Rusinov either side of him — sit in the same
   row as two ordinary colleagues, Yordanka Meshova and Donna Rakov, and
   the row is one path among three. That is deliberate. They are three
   roles inside one team, not three units, so nothing gathers around
   them: no group, no anchor, no spoke, and no seat placed near a manager
   because of who they report to. Their standing shows in portrait size
   and in nothing else.

   Emil Savov sits at the bottom centre, under the Team Leader and a
   little above the colleagues either side of him. He is an ordinary seat
   in the bottom arc, drawn exactly as his colleagues are. */
const PM_LEAD = 'PM-dragomir-apostolov'

/**
 * Where each person sits, in percent of the visible field — x across, y
 * down, the way the composition is read.
 *
 * Only the RELATIVE positions matter. The set is centred on its own
 * bounding box before it is seated, and the scene then scales it to fill
 * whatever frame it is drawn in, so a number here is a statement about
 * where somebody sits in the arrangement and never about how much of the
 * screen the arrangement takes.
 */
const PM_ANCHORS: Array<[string, [number, number]]> = [
  /* Upper band, left to right. Not a row: the heights run 21 · 20 · 11 ·
     13 · 17, so the band starts low on the left, climbs steeply into the
     middle and eases down again on the right.
     The two lowest are the two on the left, and that is not decoration:
     the section title and its opening line occupy the upper-left of the
     frame, and these are the only seats that come anywhere near them.
     The wide gap between Danaya and Mariela is not an accident either —
     it is the clearing the Team Leader's name needs directly below it. */
  ['PM-mila-vladova', [8, 21]],
  ['PM-danaya-georgieva', [26, 16]],
  ['PM-mariela-mincheva', [55, 11]],
  ['PM-hristina-shotekova', [72, 13]],
  ['PM-maya-atanasova', [89, 17]],
  /* The middle band, left to right, with a side position holding each
     end. Dragomir sits at the visual centre of the field and a little
     above the others, so the band reads as one sweep passing through him
     rather than as a rank. Valentin and Petar sit an equal distance out
     either side of him but not at the same height — equal standing, and
     nothing lined up. */
  ['PM-yordanka-meshova', [6, 52]],
  ['PM-valentin-stoev', [28, 51]],
  [PM_LEAD, [46, 47]],
  ['PM-petar-rusinov', [65, 49]],
  ['PM-donna-rakov', [84, 53]],
  /* Lower band, left to right, answering the upper one: Emil lifts its
     middle so the two bands bow away from each other and the field reads
     as one body rather than three stacked rows. He is the one seat under
     the Team Leader, drawn exactly as his colleagues are. */
  ['PM-aneliya-panayotova', [8, 86]],
  ['PM-veselin-slavkov', [29, 85]],
  ['PM-emil-savov', [47, 82]],
  ['PM-vesela-grigorova', [64, 84]],
  ['PM-yana-nikolova', [81, 86]],
]

/**
 * The spread the anchors are read back through.
 *
 * It sets nothing about how large the field is drawn — the scene solves
 * that from the frame — only how far out on the cap the arrangement
 * lands. Wide enough that the outermost seat sits around 0.6 of the way
 * to the rim, which leaves the curvature gentle across the composition
 * and leaves room outside it for the narrow-frame re-proportioning and
 * for the separation pass to work in.
 */
const PM_ANCHOR_SPREAD: readonly [number, number] = [50, 52]

/** The three paths, each written to cross the entire composition. */
const PM_CURVES: string[][] = [
  [
    'PM-mila-vladova',
    'PM-danaya-georgieva',
    'PM-mariela-mincheva',
    'PM-hristina-shotekova',
    'PM-maya-atanasova',
  ],
  [
    'PM-yordanka-meshova',
    'PM-valentin-stoev',
    PM_LEAD,
    'PM-petar-rusinov',
    'PM-donna-rakov',
  ],
  [
    'PM-aneliya-panayotova',
    'PM-veselin-slavkov',
    'PM-emil-savov',
    'PM-vesela-grigorova',
    'PM-yana-nikolova',
  ],
]

/**
 * Ties across the paths — shared work, drawn over the whole field.
 *
 * Four run around the outside, joining the ends of all three paths into
 * a single closed body, and two cross the middle diagonally opposite one
 * another. The set is chosen by what it leaves as much as by what it
 * draws: every person ends up on two or three paths and nobody on more,
 * so no seat in this field carries enough lines to read as a hub, and
 * the two managers are joined to the arcs at one point each rather than
 * gathering a group. The Team Leader has the fewest of anyone.
 */
const PM_TIES: Array<[string, string, number]> = [
  /* Round the outside — bowed away from the field, so they trace its
     edge rather than cutting back across it. */
  ['PM-mila-vladova', 'PM-yordanka-meshova', 0.22],
  ['PM-yordanka-meshova', 'PM-aneliya-panayotova', 0.2],
  ['PM-maya-atanasova', 'PM-donna-rakov', -0.2],
  ['PM-donna-rakov', 'PM-yana-nikolova', -0.22],
  /* And two across it, opposite corners, each bowed into the middle so
     it passes clear of the seats it runs between. */
  ['PM-danaya-georgieva', 'PM-valentin-stoev', -0.18],
  ['PM-vesela-grigorova', 'PM-petar-rusinov', -0.18],
]

function pmComposition(): { seats: SeatSpec[]; links: LinkSpec[] } {
  /* Centre the arrangement on its own extent, so the anchors only ever
     have to say where people sit relative to one another. */
  const xs = PM_ANCHORS.map(([, a]) => a[0])
  const ys = PM_ANCHORS.map(([, a]) => a[1])
  const midX = (Math.min(...xs) + Math.max(...xs)) / 2
  const midY = (Math.min(...ys) + Math.max(...ys)) / 2
  const seats: SeatSpec[] = PM_ANCHORS.map(([id, [x, y]]) => ({
    id,
    at: unproject(x - midX, y - midY, PM_ANCHOR_SPREAD[0], PM_ANCHOR_SPREAD[1]),
    /* Only the Team Leader is a lead. Nobody is an anchor — an anchor is
       what the emphasis logic lights a group around, and there are no
       groups here to light. */
    role: id === PM_LEAD ? 'lead' : 'member',
    group: 0,
  }))
  const links: LinkSpec[] = []
  PM_CURVES.forEach((curve, ci) => {
    for (let i = 1; i < curve.length; i++) {
      links.push({
        a: curve[i - 1],
        b: curve[i],
        /* One consistent bow per path, so each reads as a single
           continuous sweep rather than as a chain of separate hops. The
           two arcs bow away from the middle row and away from each
           other, which is what closes the field into one body; the row
           itself carries the gentlest bow of the three, because a line
           through the three highlighted roles is the one line here that
           must not draw attention to itself. */
        bow: [-0.14, 0.09, 0.14][ci] * (i % 2 === 0 ? 0.75 : 1),
        weight: 0.58,
        kind: 'cluster',
        group: 0,
      })
    }
  })
  PM_TIES.forEach(([a, b, bow]) => {
    links.push({ a, b, bow, weight: 0.32, kind: 'cross', group: 0 })
  })
  return { seats, links }
}

/**
 * A manager-centred field: the Team Leader at the true centre, everyone
 * else on one or more shells around them.
 *
 * Both Process & Procedures and BPT & Testing are built by this one
 * function, which is what makes them structurally the same composition at
 * two densities rather than two compositions that happen to resemble each
 * other. The seats are still hand-placed per team, so neither is a copy of
 * the other.
 *
 * Every colleague is joined to the centre by a spoke of identical weight,
 * and each shell closes on itself. Nobody on a shell is joined to anybody
 * below them, so no seat can read as a step in a chain.
 */
function orbitComposition(
  lead: string,
  leadAt: [number, number],
  shells: Array<Array<[string, [number, number]]>>,
): { seats: SeatSpec[]; links: LinkSpec[] } {
  const seats: SeatSpec[] = [{ id: lead, at: leadAt, role: 'lead', group: -1 }]
  const links: LinkSpec[] = []
  shells.forEach((shell, si) => {
    shell.forEach(([id, at], i) => {
      seats.push({ id, at, role: 'member', group: si })
      links.push({
        a: lead,
        b: id,
        bow: (i % 2 === 0 ? 1 : -1) * (0.12 + si * 0.05),
        weight: 0.72,
        kind: 'spine',
        group: si,
      })
    })
    /* The shell itself. One bow direction throughout, so the arcs bulge
       the same way round the centre and the ring reads as continuous. */
    shell.forEach(([id], i) => {
      links.push({
        a: id,
        b: shell[(i + 1) % shell.length][0],
        bow: 0.2,
        weight: si === 0 ? 0.42 : 0.36,
        kind: 'cluster',
        group: si,
      })
    })
  })
  return { seats, links }
}

/* ── Process & Procedures — eleven, on two shells ──────────────
   Desislava Mihalova at the centre, four colleagues near her and six
   further out, staggered against the inner four so the two shells read as
   one system rather than as two rings. Nobody sits directly above or
   below the centre, where a label would run into the Team Leader's own. */
const proc = orbitComposition(
  'PROC-desislava-mihalova',
  [0, 0.04],
  [
    [
      ['PROC-adelina-dotseva', [-0.36, 0.4]],
      ['PROC-simona-yordanova', [0.4, 0.34]],
      ['PROC-mariela-ilieva', [0.34, -0.4]],
      ['PROC-anna-ilieva', [-0.38, -0.36]],
    ],
    [
      ['PROC-bozhidara-stoilova', [-0.82, 0.1]],
      ['PROC-elitsa-tsvetanova', [0.12, 0.74]],
      ['PROC-galina-gekova', [0.82, 0.06]],
      ['PROC-kameliya-dakova', [0.58, -0.62]],
      ['PROC-mariya-grigorova', [-0.16, -0.8]],
      ['PROC-tatyana-stoyneva', [-0.68, -0.5]],
    ],
  ],
)

/* ── BPT & Testing — seven, on one shell ───────────────────────
   The same logic at the density a seven-person team wants: Ivan Rumenov
   at the centre and six colleagues on a single shell at deliberately
   unequal radii, so the ring reads as an orbit rather than a clock face. */
const bpt = orbitComposition(
  'BPT-ivan-rumenov',
  [0, 0.06],
  [
    [
      ['BPT-kaloyan-dzhokin', [-0.68, 0.34]],
      ['BPT-luka-tsekov', [-0.8, -0.18]],
      ['BPT-mariya-tudakova', [-0.3, -0.6]],
      ['BPT-nadezhda-peycheva', [0.32, -0.6]],
      ['BPT-stoil-mortev', [0.82, -0.14]],
      ['BPT-martin-chalev', [0.68, 0.38]],
    ],
  ],
)

const pm = pmComposition()

/**
 * Keyed by `Person.team`, so a composition is found the same way a roster
 * is and the two cannot drift apart silently.
 */
export const TEAM_COMPOSITIONS: Record<string, TeamComposition> = {
  'Project Management': {
    kind: 'network',
    seats: pm.seats,
    links: pm.links,
    anchored: true,
    /* Only the starting point for the frame fit — an anchored field
       solves its own spread, so this is where that solve begins rather
       than a reviewed width. Same numbers the anchors were read through,
       so the first pass is already close. */
    spread: [PM_ANCHOR_SPREAD[0], PM_ANCHOR_SPREAD[1]],
    /* First of the three: it arrives on its own reveal, at its own size. */
    enterShape: [1, 1],
    /* Leaves by drawing in toward the compact orbit that follows. */
    exitShape: [0.72, 0.72],
  },
  'Process & Procedures': {
    kind: 'flow',
    seats: proc.seats,
    links: proc.links,
    spread: [36, 36],
    /* PM's closing shape expressed against this field's own spread, so
       the two chapters are the same shape as they cross. */
    enterShape: [0.7, 0.72],
    exitShape: [0.74, 0.74],
  },
  'BPT & Testing': {
    kind: 'orbit',
    seats: bpt.seats,
    links: bpt.links,
    spread: [35, 36],
    /* The flow's closing shape, tightening into the smaller system. */
    enterShape: [0.76, 0.68],
    /* Collapses toward the centre as the closing statement takes over. */
    exitShape: [0.52, 0.52],
  },
}
