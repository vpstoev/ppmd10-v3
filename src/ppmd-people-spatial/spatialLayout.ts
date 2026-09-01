/**
 * Placement and projection maths for the experimental spatial People
 * scene. Everything here is deterministic — the same roster always
 * produces the same composition, so the layout can be reasoned about and
 * tuned rather than re-rolled.
 *
 * The field is an ellipsoid cap facing the viewer: wide, shallow and
 * curved. Nodes sit ON that surface, which is what makes them read as
 * anchored to a system rather than floating in space.
 */

/** Golden angle — even angular spacing without any lattice. */
const GOLDEN = Math.PI * (3 - Math.sqrt(5))

/** How far around the ellipsoid nodes are allowed to sit (radians). */
const CAP = 1.24

/** Ellipsoid radii, normalized. Wide and shallow, never a ball. */
export const RX = 1.0
export const RY = 0.82
export const RZ = 0.72

/** Camera distance and focal length for the perspective divide. */
const CAM_Z = 2.5
const FOCAL = 2.5

/**
 * How strongly a portrait's own SIZE answers its depth.
 *
 * Position is projected in full — this exponent never touches `left`,
 * `top` or `depth`, so the field's geometry, parallax and draw order are
 * exactly what the perspective divide says they are. Only the size the
 * portrait is drawn at responds less steeply than 1:1.
 *
 * The reason is that this cap is wide and shallow, and the people are not
 * spread evenly across it: the three anchors sit near the optical centre
 * and so do two of the twelve members. At full strength the depth divide
 * alone spans 1.24–1.53 across the roster, which is a 22% size spread
 * between colleagues who hold the same job — and it puts the two central
 * members within a hair of the anchors, so authored size can no longer
 * express the operating structure without becoming exaggerated to shout
 * over it. Softening the response compresses that incidental spread to
 * about 10% and hands the hierarchy back to the one place it is actually
 * authored, `nodeSize`. Depth still reads — nearer people are still
 * larger, brighter and drawn in front — it simply stops deciding who
 * looks senior.
 */
const DEPTH_SOFT = 0.55

export interface Placement {
  /** Position on the ellipsoid surface, before any rotation. */
  x: number
  y: number
  z: number
  /** Distance from the composition's optical centre, 0..1. */
  centrality: number
}

/** Seat a lateral (u,v) coordinate onto the ellipsoid surface. */
function seat(u: number, v: number): Placement {
  const r = Math.hypot(u, v)
  const lim = Math.sin(CAP)
  if (r > lim) {
    u *= lim / r
    v *= lim / r
  }
  const k = u * u + v * v
  return {
    x: u * RX,
    y: v * RY,
    z: Math.sqrt(Math.max(0, 1 - k)) * RZ,
    centrality: Math.min(1, Math.hypot(u, v)),
  }
}

/** Which part of the operating structure a seat or a path belongs to. */
export type Role = 'lead' | 'anchor' | 'member'

/**
 * The three team fields are the same system arranged three ways, so they
 * share one authored form: a list of lateral seats and a list of paths
 * between them. Only the arrangement differs — never the machinery that
 * seats, projects, separates or draws it.
 */
export type CompositionKind = 'network' | 'flow' | 'orbit'

export interface SeatSpec {
  id: string
  /** Lateral (u, v) on the unit disc — u right, v up. */
  at: readonly [number, number]
  role: Role
  /** Working group / stream index; -1 when the seat belongs to none. */
  group: number
}

export interface LinkSpec {
  a: string
  b: string
  bow: number
  weight: number
  kind: Flow['kind']
  group: number
}

export interface SeatMap {
  /** Seat per person id. */
  seats: Record<string, Placement>
  /** Cluster / stream index per person id; -1 for the team lead. */
  cluster: Record<string, number>
  role: Record<string, Role>
}

/**
 * Seat an authored composition onto the surface.
 *
 * `shape` re-proportions the lateral plane before anything is seated,
 * which is how a field written for a wide desktop frame becomes the same
 * field in a tall phone frame: the arrangement — who sits near whom, which
 * paths run where — survives intact, and only the aspect it is drawn on
 * changes. Scaling the projected result instead would squash the portraits
 * and the labels along with it.
 */
export function placeSeats(
  spec: readonly SeatSpec[],
  shape: readonly [number, number] = [1, 1],
): SeatMap {
  const seats: Record<string, Placement> = {}
  const cluster: Record<string, number> = {}
  const role: Record<string, Role> = {}
  for (const s of spec) {
    seats[s.id] = seat(s.at[0] * shape[0], s.at[1] * shape[1])
    cluster[s.id] = s.group
    role[s.id] = s.role
  }
  return { seats, cluster, role }
}

/**
 * A quiet field of surface points — the "world" the people stand on.
 * They are seated on the SAME ellipsoid, so they rotate and drift with
 * the composition instead of reading as a separate particle layer.
 */
export function surfaceField(count: number): Placement[] {
  const out: Placement[] = []
  const lim = Math.sin(CAP) * 1.16
  for (let i = 0; i < count; i++) {
    const t = (i + 0.5) / count
    const r = lim * Math.sqrt(t)
    const a = i * GOLDEN
    out.push(seat(Math.cos(a) * r, Math.sin(a) * r))
  }
  return out
}

/**
 * Largest lateral radius a seat may reach, staying on the cap. Exported
 * so the scene can check a finished solve against the same limit the
 * solver re-seats against, rather than against a second copy of it.
 */
export const CAP_SIN = Math.sin(CAP)

/**
 * `project`, run backwards: the seat that lands on a given point.
 *
 * A composition is reviewed on screen, so the useful place to author one
 * is on screen — "upper far-left", "exact visual centre" — in percent of
 * the field. But the field is a curved surface seen in perspective, and a
 * seat is a lateral coordinate on that surface, so screen percentages are
 * not seat coordinates and the difference is not small: the divide runs
 * from about 1.54 at the centre of the cap to 1.19 at its rim, which is a
 * quarter of the composition's width. Placing authored percentages
 * straight into `at` therefore pulls the outer people inwards by exactly
 * that much, and the arrangement that comes out is not the one that was
 * written down.
 *
 * Inverting the projection removes the guesswork. `left` and `top` are
 * percent offsets from the centre of the field, in the same units
 * `project` returns, and what comes back is the seat that lands there.
 *
 * The solve is one-dimensional, not two. The divide is a scalar, so it
 * scales `u` and `v` together — every candidate seat lies on the ray
 * through the target, and only the distance along it is unknown. That
 * makes bisection exact and unconditionally convergent, where iterating
 * the projection directly diverges near the rim.
 */
export function unproject(
  left: number,
  top: number,
  spreadX: number,
  spreadY: number,
  advance = 1,
): [number, number] {
  const dx = left / (spreadX * RX)
  const dy = -top / (spreadY * RY)
  const d = Math.hypot(dx, dy)
  if (!Number.isFinite(d) || d < 1e-9) return [0, 0]
  const kAt = (r: number) =>
    FOCAL / (CAM_Z - (Math.sqrt(Math.max(0, 1 - r * r)) * RZ + advance * 0.16))
  /* A target past the rim of the cap cannot be reached at this spread;
     the bisection lands on the rim, which is the closest seat there is. */
  let lo = 0
  let hi = CAP_SIN
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2
    if (d / kAt(mid) > mid) lo = mid
    else hi = mid
  }
  const r = (lo + hi) / 2
  return [(dx / d) * r, (dy / d) * r]
}

/**
 * How far the separation pass may carry a pinned seat from its anchor,
 * as a fraction of the distance to that seat's nearest neighbour.
 *
 * The bound is what makes a fixed composition actually fixed. A seat
 * stays within `f · dᵢ` of its own anchor, and every other anchor is at
 * least `dᵢ` away, so it remains closer to where it was placed than to
 * anywhere else in the field as long as `f < 0.5` — no seat can drift
 * into another's slot, swap with a neighbour, or leave the band it was
 * written into, at any view in the drift.
 *
 * It is set far below that. Not swapping places is the floor; what an
 * authored composition actually wants is to be DRAWN as it is written,
 * and a pass with a fifth of the gap to play with will happily spend it —
 * levelling a band that was written to undulate, or lifting somebody a
 * tenth of the frame out of the corner they were placed in. At a
 * twelfth it can still open a couple of pixels between two labels that
 * graze and it cannot restate anything.
 */
export const PIN_FRACTION = 0.08

/** An anchor a seat is held near, with the radius it may move inside. */
export interface Pin {
  x: number
  y: number
  r: number
}

/**
 * A light safety net, NOT a layout: it nudges apart only seats that
 * actually collide on screen, with a small step and a tight threshold, so
 * the authored composition survives intact. Turning this up spreads the
 * team evenly and destroys the cluster structure.
 */
export interface Footprint {
  /** Half-width of the whole card, portrait or label — whichever is wider. */
  rx: number
  /** Half-height of the portrait plus the label sitting under it. */
  ry: number
  /** How far the footprint centre sits below the portrait centre. */
  offsetY: number
}

/**
 * Clearance around a footprint. Small on purpose: it is the difference
 * between labels that merely fail to touch and labels that read as
 * separate, and every point of it costs the composition some of its
 * authored shape.
 */
const MARGIN = 1.05

export function relaxSeats(
  seats: Placement[],
  boxes: Footprint[],
  spreadX: number,
  spreadY: number,
  boxW: number,
  boxH: number,
  /**
   * The views the result has to hold in — normally the extremes of the
   * idle drift, not just the resting view.
   *
   * The field never stops moving, and yaw foreshortens one side of the
   * composition while it opens the other. Separating the seats at a
   * single view therefore guarantees nothing: the layout is clean at rest
   * and collides a few seconds later at the end of the swing. Every
   * sampled view is solved simultaneously, so what comes out is spaced
   * for the worst moment of the drift rather than the calmest.
   */
  views: ReadonlyArray<{ yaw: number; pitch: number }>,
  /**
   * Anchors the seats are held near, one per seat, or null to let the
   * pass place them freely.
   *
   * With pins the separation stops being a layout of last resort and
   * becomes what it is named: a safety net over a composition somebody
   * wrote. It may still open a few pixels between two labels that graze;
   * it may not decide where anybody sits. See `PIN_FRACTION`.
   */
  pins: ReadonlyArray<Pin> | null = null,
): void {
  if (boxW < 2 || boxH < 2) return
  /* Surface units per pixel. Getting this wrong by an order of magnitude
     turns the safety net into a layout engine and scatters the authored
     composition across the whole field, so it is derived rather than
     tuned: one surface unit spans spread% of the box, times the mean
     perspective scale. */
  const ux = 1 / ((spreadX / 100) * boxW * 1.35)
  const uy = 1 / ((spreadY / 100) * boxH * 1.35)
  /* A single non-finite input here would propagate into every seat and
     from there into a transform the browser silently discards, dropping
     the whole field into the container's top-left corner. Refuse to run
     rather than hand back a composition that cannot be rendered. */
  if (!(ux > 0) || !(uy > 0) || !Number.isFinite(ux) || !Number.isFinite(uy)) return
  for (const b of boxes) {
    if (!Number.isFinite(b.rx) || !Number.isFinite(b.ry) || !Number.isFinite(b.offsetY)) return
  }

  for (let iter = 0; iter < 260; iter++) {
    const px = views.map((v) => {
      const view: ViewState = { yaw: v.yaw, pitch: v.pitch, advance: 1, spreadX, spreadY }
      return seats.map((s) => {
        const q = project(s, view)
        return { x: ((50 + q.left) / 100) * boxW, y: ((50 + q.top) / 100) * boxH, s: q.scale }
      })
    })
    let moved = false
    for (let i = 0; i < seats.length; i++) {
      for (let j = i + 1; j < seats.length; j++) {
        /* Each pair is resolved ONCE per iteration, against whichever
           view it is worst in. Pushing a pair apart separately in every
           view cancels out — the view that wants them further left undoes
           the one that wants them further right, and the pair settles into
           a stable overlap that no number of iterations clears. */
        let worst: { penX: number; penY: number; dx: number; dy: number; pen: number } | null = null
        for (let v = 0; v < views.length; v++) {
          const a = px[v][i]
          const b = px[v][j]
          /* Boxes, not circles: a node is a portrait with a label under
             it, so it is far taller than wide and its true extent is a
             rectangle. Testing an ellipse through that rectangle's
             corners reports two nodes as clear while their corners still
             overlap, which is exactly how a long role ends up grazing the
             portrait below it. */
          const needX = (boxes[i].rx * a.s + boxes[j].rx * b.s) * MARGIN
          const needY = (boxes[i].ry * a.s + boxes[j].ry * b.s) * MARGIN
          const dx = b.x - a.x
          const dy = b.y + boxes[j].offsetY * b.s - (a.y + boxes[i].offsetY * a.s)
          const penX = needX - Math.abs(dx)
          const penY = needY - Math.abs(dy)
          /* Clear on either axis is clear, full stop. */
          if (penX <= 0 || penY <= 0) continue
          const pen = Math.min(penX, penY)
          if (!worst || pen > worst.pen) worst = { penX, penY, dx, dy, pen }
        }
        if (!worst) continue
        moved = true
        /* Resolve along the axis of least penetration: the smallest move
           that separates them, which is also the one that disturbs the
           authored composition least. */
        if (worst.penX < worst.penY) {
          const push = (worst.dx >= 0 ? 1 : -1) * worst.penX * 0.5 * 0.85 * ux
          seats[i].x -= push
          seats[j].x += push
        } else {
          const push = (worst.dy >= 0 ? 1 : -1) * worst.penY * 0.5 * 0.85 * uy
          seats[i].y += push
          seats[j].y -= push
        }
      }
    }
    /* Hold each seat to its anchor before re-seating, so the clamp and
       the surface constraint are satisfied together rather than one
       undoing the other on the next pass. */
    if (pins) {
      for (let i = 0; i < seats.length; i++) {
        const pin = pins[i]
        if (!pin || !(pin.r > 0)) continue
        const dx = seats[i].x - pin.x
        const dy = seats[i].y - pin.y
        const d = Math.hypot(dx, dy)
        if (d > pin.r) {
          seats[i].x = pin.x + (dx / d) * pin.r
          seats[i].y = pin.y + (dy / d) * pin.r
        }
      }
    }
    /* Re-seat on the ellipsoid: nodes stay attached to the surface. */
    for (const s of seats) {
      const nx = s.x / RX
      const ny = s.y / RY
      const r = Math.hypot(nx, ny)
      if (r > CAP_SIN) {
        s.x *= CAP_SIN / r
        s.y *= CAP_SIN / r
      }
      const k = (s.x / RX) ** 2 + (s.y / RY) ** 2
      s.z = RZ * Math.sqrt(Math.max(0, 1 - k))
      s.centrality = Math.min(1, Math.hypot(s.x / RX, s.y / RY))
    }
    if (!moved) break
  }
}

export interface Projected {
  /** Viewport offsets in percent from the centre. */
  left: number
  top: number
  /** Perspective scale, ~1 at the surface centre. */
  scale: number
  /** Painter's-algorithm depth; larger is nearer. */
  depth: number
}

export interface ViewState {
  yaw: number
  pitch: number
  /** Extra push toward the viewer, 0..1, used by the scroll reveal. */
  advance: number
  /** Horizontal spread in viewport percent. */
  spreadX: number
  /** Vertical spread in viewport percent. */
  spreadY: number
  /**
   * Vertical offset in viewport percent, for a field taller than its
   * frame. It shifts the whole projection equally, so it cannot change
   * how far apart any two seats are — which is why the separation pass
   * ignores it and only the draw applies it.
   */
  pan?: number
  /** Horizontal counterpart of `pan`, for the same reason. */
  panX?: number
}

/**
 * Rotate a surface point by the current view and project it. Yaw and
 * pitch stay small, so the cap never turns far enough for a node to hide
 * behind the field — all fifteen people remain visible at all times.
 */
export function project(p: { x: number; y: number; z: number }, v: ViewState): Projected {
  const cy = Math.cos(v.yaw)
  const sy = Math.sin(v.yaw)
  const cp = Math.cos(v.pitch)
  const sp = Math.sin(v.pitch)

  const x1 = p.x * cy + p.z * sy
  const z1 = -p.x * sy + p.z * cy
  const y2 = p.y * cp - z1 * sp
  const z2 = p.y * sp + z1 * cp

  const zz = z2 + v.advance * 0.16
  const k = FOCAL / (CAM_Z - zz)
  return {
    left: x1 * k * v.spreadX + (v.panX ?? 0),
    top: -y2 * k * v.spreadY + (v.pan ?? 0),
    /* Softened — see DEPTH_SOFT. Returned from here rather than applied
       at the point of use so the seat relaxation and the renderer size
       every node identically; a solver that separates footprints at one
       scale while the screen draws them at another is separating the
       wrong boxes. */
    scale: (k / (FOCAL / CAM_Z)) ** DEPTH_SOFT,
    depth: zz,
  }
}

/**
 * The curved surface itself — drawn, not implied — deliberately running
 * past the cap so the structure continues beyond the frame.
 *
 * One geometry per composition, and that is the point: all three are the
 * same ellipsoid seen the same way, so they read as one world, but the
 * lines drawn on it say what each team does. A mesh for a network, open
 * bands for a flow, closed rings for a validation loop. Nothing else about
 * the world changes — same radii, same camera, same weight, same colour
 * treatment — so the family holds.
 */
export function fieldArcs(
  kind: CompositionKind = 'network',
): Array<Array<{ x: number; y: number; z: number }>> {
  const arcs: Array<Array<{ x: number; y: number; z: number }>> = []
  const SEG = 34
  const lat = (v: number, from: number, span: number, bow = 0, phase = 0) => {
    const pts = []
    for (let i = 0; i <= SEG; i++) {
      const t = i / SEG
      const a = from + t * span
      /* A travelling offset rather than a fixed latitude: the band rises
         and falls across the frame, which is what separates a current
         from a ruled line. */
      const lv = v + Math.sin(t * Math.PI * 2 + phase) * bow
      const r = Math.cos(lv)
      pts.push({ x: Math.sin(a) * r * RX, y: Math.sin(lv) * RY, z: Math.cos(a) * r * RZ })
    }
    return pts
  }
  const lon = (h: number, from: number, span: number) => {
    const pts = []
    for (let i = 0; i <= SEG; i++) {
      const a = from + (i / SEG) * span
      pts.push({
        x: Math.sin(h) * Math.cos(a) * RX,
        y: Math.sin(a) * RY,
        z: Math.cos(h) * Math.cos(a) * RZ,
      })
    }
    return pts
  }

  if (kind === 'flow') {
    /* Open bands running the width of the field, each one phase-shifted
       so they travel rather than stack. No longitudes at all: a crossing
       line would close the bands into cells and the current would stop
       reading as a current. */
    const bands: Array<[number, number, number]> = [
      [-0.66, 0.1, 0.4],
      [-0.34, 0.13, 2.1],
      [-0.02, 0.15, 3.7],
      [0.3, 0.13, 5.2],
      [0.62, 0.1, 0.9],
    ]
    for (const [v, bow, phase] of bands) arcs.push(lat(v, -1.55, 3.1, bow, phase))
    return arcs
  }

  if (kind === 'orbit') {
    /* Closed rings around the centre of the field — the shells the team
       sits on, and the only composition whose lines come back to where
       they started. Two short meridians hold the rings on the surface so
       the set still reads as a curved solid rather than flat ellipses. */
    for (const r of [0.3, 0.56, 0.82, 1.06]) {
      const pts = []
      for (let i = 0; i <= SEG; i++) {
        const a = (i / SEG) * Math.PI * 2
        const u = Math.sin(r) * Math.cos(a)
        const v = Math.sin(r) * Math.sin(a)
        const k = Math.max(0, 1 - u * u - v * v)
        pts.push({ x: u * RX, y: v * RY, z: Math.sqrt(k) * RZ })
      }
      arcs.push(pts)
    }
    for (const h of [-0.62, 0.62]) arcs.push(lon(h, -0.95, 1.9))
    return arcs
  }

  /* network — latitudes for the horizontal curvature, sparser longitudes
     so the mesh never reads as a grid. */
  for (const v of [-0.62, -0.2, 0.22, 0.6]) arcs.push(lat(v, -1.5, 3.0))
  for (const h of [-1.05, -0.35, 0.35, 1.05]) arcs.push(lon(h, -0.95, 1.9))
  return arcs
}

export interface Flow {
  a: number
  b: number
  /** Perpendicular bow of the arc; the sign picks the side. */
  bow: number
  /** Resting weight, 0..1 — not every path carries the same emphasis. */
  weight: number
  /** What the path represents, which is also what drives emphasis. */
  kind: 'spine' | 'cluster' | 'cross'
  /** Group this path belongs to; -1 for spine and cross paths. */
  cluster: number
}

/**
 * Paths that mean something. The vocabulary is shared by all three
 * compositions so a reader learns it once:
 *
 *   spine    lead ↔ the structure it holds     strongest
 *   cluster  the working relationships          the body of the field
 *   cross    links across groups                shared delivery, faintest
 *
 * Every path is bowed, and neighbouring bows alternate, so the paths arc
 * past one another instead of radiating like a star.
 *
 * Links naming someone who is not on this roster are dropped rather than
 * drawn to a seat that does not exist — the authored composition and the
 * roster are two files, and they are allowed to disagree.
 */
export function buildLinks(links: readonly LinkSpec[], indexOf: Record<string, number>): Flow[] {
  const flows: Flow[] = []
  for (const l of links) {
    if (indexOf[l.a] === undefined || indexOf[l.b] === undefined) continue
    flows.push({
      a: indexOf[l.a],
      b: indexOf[l.b],
      bow: l.bow,
      weight: l.weight,
      kind: l.kind,
      cluster: l.group,
    })
  }
  return flows
}
