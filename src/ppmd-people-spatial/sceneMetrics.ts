/**
 * Every number that decides how large a team field is drawn, and how much
 * room it gives itself, in one place.
 *
 * Separate from the scene component on purpose. These are pure functions
 * of the frame and the roster, so keeping them out of the render file
 * means the layout can be reasoned about — and checked against a real
 * measured DOM — without standing a React tree up around it.
 */
import type { Footprint } from './spatialLayout'
import type { Person } from '../ppmd-people/peopleTypes'

/**
 * Portrait diameter in px, before perspective scaling and the viewport
 * fit. `BASE` is the standard colleague — the size most of every roster is
 * drawn at, and therefore the one that decides whether this section reads
 * as being about people or about the field behind them.
 *
 * It was 75, and at that size the answer was the field: fifteen faces
 * under 90px across, on a 1920 screen, read as annotation on a particle
 * background rather than as the subject of the section. At 108 a
 * colleague lands near 105 on screen once the perspective divide is
 * applied, a Team Leader near 140, and the composition finally carries
 * the weight of what it is about.
 *
 * The three multipliers are deliberately small, and they are the SAME for
 * all three teams: a Team Leader is a Team Leader whether the field around
 * them holds fifteen people or seven. Depth already gives the centre of a
 * composition its emphasis, so a large authored step on top of that
 * compounds into a hierarchy far steeper than the operating structure it
 * is meant to describe.
 */
export const BASE = 108
export const TL = 1.32
export const PM = 1.13
/** Standard colleagues — the reference the other two are steps from. */
export const MEMBER = 1

/** One place that decides how large a person's portrait is. */
export function nodeSize(person: Person): number {
  const k =
    person.leadershipLevel === 'team-lead'
      ? TL
      : person.leadershipLevel === 'program-manager'
        ? PM
        : MEMBER
  return Math.round(BASE * k)
}

/**
 * Gap between the portrait and the label under it. Declared here rather
 * than in the stylesheet because the seat relaxation has to reason about
 * it; the CSS reads it back through `--label-gap`.
 */
export const LABEL_GAP = 14

/**
 * How far the view drifts from centre — the idle swing plus whatever the
 * pointer can add on top of it.
 *
 * These are shared by the animation and by the seat relaxation on
 * purpose. The layout has to be solved for the extremes of this drift, so
 * if the two ever disagree, labels start colliding halfway through the
 * swing while the layout still believes it is clear.
 *
 * Yaw foreshortens one side of a composition as it turns, and with a
 * permanent label under every node there is a hard limit on how far a
 * field can turn before the labels on the compressed side have to
 * overlap. Measured against these rosters, ±0.20 is the widest envelope
 * all three solve cleanly in. Pitch is wider — it costs the layout far
 * less.
 */
export const YAW_DRIFT = 0.14
export const YAW_POINTER = 0.06
export const PITCH_DRIFT = 0.095
export const PITCH_POINTER = 0.055
export const YAW_MAX = YAW_DRIFT + YAW_POINTER
export const PITCH_MAX = PITCH_DRIFT + PITCH_POINTER

/**
 * The drift envelope, sampled as a grid rather than at its corners.
 *
 * Corners are not the extremes for every pair. Two seats at different
 * depths do not separate monotonically as the field turns — the cap
 * carries one of them toward the viewer while it carries the other away —
 * so the tightest moment for a given pair can fall anywhere inside the
 * swing. Solving only the corners left a handful of labels clear at both
 * ends of the arc and overlapping in the middle of it.
 *
 * This runs on layout, not per frame, so the extra views cost nothing
 * that is felt.
 */
/**
 * The views a field has to STAY INSIDE THE FRAME at, as opposed to the
 * ones it has to be legible at.
 *
 * Two different questions, and they want two different envelopes. Labels
 * have to clear each other at every view the field can reach, pointer
 * included, because a reader who overlaps two names has been shown
 * something wrong. Whether a label runs off the edge is about the frame,
 * and the frame is a soft edge: the composition sits inside its idle
 * swing at all times, and a deliberate push of the pointer at the exact
 * moment the drift is at full stretch can carry the outermost label a
 * couple of percent past it and back.
 *
 * Fitting to the wider envelope would buy that one moment by drawing the
 * whole composition around a tenth smaller for the whole of the rest of
 * the time, which is a bad trade in a section that is about the people.
 */
export const FIT_VIEWS: ReadonlyArray<{ yaw: number; pitch: number }> = (() => {
  const out: Array<{ yaw: number; pitch: number }> = []
  for (const yaw of [-YAW_DRIFT, 0, YAW_DRIFT]) {
    for (const pitch of [-PITCH_DRIFT, 0, PITCH_DRIFT]) out.push({ yaw, pitch })
  }
  return out
})()

export const RELAX_STEPS = 5
export const RELAX_VIEWS: ReadonlyArray<{ yaw: number; pitch: number }> = (() => {
  const out: Array<{ yaw: number; pitch: number }> = []
  const at = (i: number) => -1 + (2 * i) / (RELAX_STEPS - 1)
  for (let i = 0; i < RELAX_STEPS; i++) {
    for (let j = 0; j < RELAX_STEPS; j++) {
      out.push({ yaw: YAW_MAX * at(i), pitch: PITCH_MAX * at(j) })
    }
  }
  return out
})()

/**
 * Width the compositions are authored against, and the floor they may
 * shrink to. Portraits and labels are pixel sizes, but a field spaces
 * itself in percentages, so a narrower viewport pulls the seats together
 * while the things sitting on them stay the same size — which is what runs
 * the labels into each other on a 1366 laptop even though 1920 is clean.
 *
 * The whole node scales with the viewport instead: portrait, label width
 * and label type together, so a composition stays geometrically itself and
 * only gets smaller. The reference width is measured, not chosen: it is
 * the smallest value at which 1920, 1440 and 1366 all solve free of
 * collisions, which makes 1920 render at full size and the two smaller
 * widths at roughly 0.85 and 0.80.
 *
 * Type is deliberately NOT on this channel. Scaling the whole node by the
 * viewport put the role line near 6px on a 1366 laptop, which is not a
 * readable size at any weight. So the geometry — portrait diameter, gaps,
 * the width a title wraps against — carries the shrink, the text keeps a
 * floor of its own (`typeFor`), and exceptionally long titles are written
 * shorter rather than smaller (`compactRole`).
 */
export const REF_WIDTH = 1700
/**
 * Height matters as much as width and used to be ignored. A 1366 × 768
 * laptop gives a scene barely 630px once the browser has taken its share,
 * and the field is spread as a percentage of that height — so the
 * composition closed up vertically while the labels sitting on it kept
 * their size. Whichever axis is tighter sets the scale.
 */
export const REF_HEIGHT = 945
export const FIT_MIN = 0.62
/**
 * Phones and portrait tablets are allowed further down than a laptop is.
 * Not to fit more in — the label floor decides that, and it does not
 * move — but because a 390px frame holding a seven-person system should
 * not be forced to draw it at laptop scale and spill off both edges.
 */
export const FIT_MIN_COMPACT = 0.46

export function fitFor(width: number, height: number, compact: boolean): number {
  return Math.max(
    compact ? FIT_MIN_COMPACT : FIT_MIN,
    Math.min(1, width / REF_WIDTH, height / REF_HEIGHT),
  )
}

/**
 * The floor under the label's type. Names and roles shrink with the
 * viewport only as far as this, and a composition gives up portrait size
 * and spacing before it gives up legibility — the order the labels are
 * actually read in.
 */
export const TYPE_MIN = 0.72

export function typeFor(fit: number): number {
  return Math.max(TYPE_MIN, fit)
}

/**
 * The width a label wraps against, in px.
 *
 * This is a composition's strongest lever at narrow widths, and a far
 * better one than type size: the same words on two short lines take
 * roughly a third less width than they do on one, and these fields run out
 * of width long before they run out of height. So the cap closes first and
 * fastest, the geometry goes next, and the type only moves once both have
 * been spent.
 *
 * Names and titles still wrap between words and are never truncated — they
 * simply stack, which is what a dense field of labels does anyway.
 */
export const LABEL_MAX = 228
/* The floor is set by the longest single word the labels contain, not
   chosen for looks: below roughly this, "MGMT MANAGER" stops fitting on
   one line and the longest title needs a fourth line it is not allowed to
   have.
   The two ends of the ramp did NOT move by the same amount when the type
   grew, and that is measured rather than tidy. At full width the cap is
   what decides how a long title breaks, so it tracks the type. At the
   floor it is what decides how much horizontal room the labels take from
   each other on a short laptop, where the type no longer shrinks with the
   field — and there the widest cap that still clears the three-line limit
   is the one that leaves the least room between neighbours. */
export const LABEL_MAX_MIN = 116
/**
 * A phone gets a narrower floor still.
 *
 * The label is the larger of a node's two dimensions, so its width is the
 * single biggest term in how much room a field needs — and a phone is the
 * one frame where that room genuinely runs out. Below the desktop floor a
 * long title needs a fourth line, which is why the clamp allows one; the
 * words stay whole and the same size, and the label simply becomes a
 * narrower, taller block. On a frame this size that trade is clearly the
 * right way round.
 */
export const LABEL_MAX_MIN_COMPACT = 96
/** The fit at which the cap reaches its floor — around a 1500px scene. */
export const LABEL_MAX_FLOOR_AT = 0.79

export function labelMaxFor(fit: number, compact = false): number {
  const floor = compact ? LABEL_MAX_MIN_COMPACT : LABEL_MAX_MIN
  const t = Math.min(1, Math.max(0, (fit - LABEL_MAX_FLOOR_AT) / (1 - LABEL_MAX_FLOOR_AT)))
  return Math.round(floor + (LABEL_MAX - floor) * t)
}

/**
 * A frame is "compact" when it is narrow, or when it is not appreciably
 * wider than it is tall. Both are the same question asked twice: is there
 * room to lay a field out sideways? Phones and portrait tablets answer no,
 * and get the composition re-proportioned for a tall frame rather than the
 * wide one shrunk until it stops working.
 */
export function isCompact(width: number, height: number): boolean {
  return width < 900 || width / height < 0.95
}

/**
 * How many frame-heights the field needs, from the labels actually
 * measured rather than from a breakpoint.
 *
 * Fifteen readable labels do not fit in a 390 × 844 phone — that is
 * arithmetic, not a layout failure — so on a frame that small the field
 * becomes taller than the frame and the chapter's own scroll travels down
 * it. Everything stays at a readable size and everybody is still reached;
 * what changes is that they are not all in shot at the same instant.
 *
 * On every desktop and tablet size this returns exactly 1 and nothing
 * moves: the term is a release valve, not a layout mode.
 */
export const PACK = 3.6
export const FIELD_H_MAX = 3.0

export function fieldHeightFor(boxes: readonly Footprint[], w: number, h: number): number {
  let area = 0
  for (const b of boxes) area += b.rx * 2 * (b.ry * 2)
  const needed = (area * PACK) / Math.max(1, w * h)
  return Math.max(1, Math.min(FIELD_H_MAX, needed))
}

/**
 * The perspective divide, as one number.
 *
 * A seat's projected offset is `lateral × k × spread`, where `k` is the
 * divide and varies from about 1.42 at the rim of the cap to 1.54 at its
 * centre. Solving the spread against a single representative value is
 * accurate to a few percent, and a few percent is well inside the margin
 * the result is then given — while pretending the relationship is exactly
 * linear is what makes the spread solvable in closed form at all.
 */
export const K_PROJ = 1.45

/**
 * How much of the cap a narrow frame's composition is authored into.
 *
 * A field written for a laptop reaches most of the way to the rim of the
 * cap, and that is fine there because the separation pass barely has to
 * move anyone. On a phone it has to move everyone, and a seat already on
 * the rim cannot be pushed outwards at all — the re-seating step pulls it
 * straight back — so the pass runs out of room and simply leaves labels
 * overlapping.
 *
 * Seating a narrow frame's composition well inside the rim gives it that
 * room back. It costs nothing visually: `frameSpread` fills the frame on
 * each axis independently afterwards, so a field seated at two thirds of
 * the cap is drawn exactly as large as one seated at the rim — it just has
 * somewhere to go.
 */
export const COMPACT_CAP = 0.62
export const COMPACT_SHAPE: readonly [number, number] = [COMPACT_CAP, COMPACT_CAP]

export interface FrameFit {
  spreadX: number
  spreadY: number
  /** Vertical offset in frame percent — see below. */
  centre: number
}

/**
 * The spread that makes an authored field fill the frame it is given.
 *
 * Wide frames use the spreads written into each composition: those are
 * reviewed numbers and 1920 is what they were reviewed at. Narrow and
 * tall frames cannot be served that way — a phone and a portrait tablet
 * differ far more from each other than either does from a laptop — so
 * there the spread is solved from the frame instead, and the authored
 * arrangement is what stays fixed.
 *
 * The field is NOT symmetric about its centre: a label hangs below its
 * portrait, so the room needed under the lowest seat is several times the
 * room needed above the highest one. Centring the extents would therefore
 * waste at the top exactly what it runs short of at the bottom. The two
 * margins are solved separately and the difference comes back as
 * `centre`, an offset that puts both edges of the field exactly on the
 * edges of the frame.
 */
export function frameSpread(
  extX: number,
  extY: number,
  w: number,
  h: number,
  halfLabel: number,
  aboveCentre: number,
  belowCentre: number,
): FrameFit {
  const mX = (halfLabel / Math.max(1, w)) * 100 + 2
  const mTop = (aboveCentre / Math.max(1, h)) * 100 + 2
  const mBot = (belowCentre / Math.max(1, h)) * 100 + 2
  const targetX = Math.max(8, 50 - mX)
  const targetY = Math.max(8, 50 - (mTop + mBot) / 2)
  return {
    spreadX: targetX / Math.max(0.05, extX * K_PROJ),
    spreadY: targetY / Math.max(0.05, extY * K_PROJ),
    centre: -(mBot - mTop) / 2,
  }
}
