import { useEffect, useMemo, useRef } from 'react'
import type { Person } from '../ppmd-people/peopleTypes'
import { displayRole } from '../ppmd-people/peopleData'
import { portraitFocus } from '../ppmd-people/portraitFraming'
import {
  buildLinks,
  fieldArcs,
  placeSeats,
  project,
  relaxSeats,
  surfaceField,
  CAP_SIN,
  PIN_FRACTION,
  RX,
  RY,
  RZ,
  type Pin,
  type Placement,
  type Footprint,
  type Role,
  type ViewState,
} from './spatialLayout'
import {
  COMPACT_SHAPE,
  FIELD_H_MAX,
  FIT_MIN,
  FIT_VIEWS,
  fieldHeightFor,
  fitFor,
  frameSpread,
  isCompact,
  labelMaxFor,
  LABEL_MAX,
  nodeSize,
  typeFor,
  LABEL_GAP,
  PITCH_DRIFT,
  PITCH_POINTER,
  RELAX_VIEWS,
  YAW_DRIFT,
  YAW_POINTER,
} from './sceneMetrics'
import type { TeamComposition } from './compositions'
import { compactRole } from './roleDisplay'
import s from './SpatialTeamScene.module.css'

interface SpatialTeamSceneProps {
  roster: Person[]
  accent: string
  /** Which of the three fields this is — see `compositions`. */
  composition: TeamComposition
  /**
   * 0..1 — how far the chapter block itself has faded in. This is what
   * decides whether the field is on screen, and therefore whether it has
   * to be drawn; `reveal` starts much later and answers a different
   * question.
   */
  visible: number
  /** 0..1 reveal driven by the section's scroll progress. */
  reveal: number
  /** 0..1 as the chapter arrives, and 0..1 as it leaves. */
  enter: number
  exit: number
  reducedMotion: boolean
  onOpen: (p: Person) => void
}

/**
 * A team field: the abstract world in SVG, the people as real DOM buttons
 * over it.
 *
 * That split keeps the surface genuinely spatial while every person stays
 * a focusable element with a real portrait and the shared profile dialog
 * on click — nothing about identity depends on pointer or 3D interaction.
 *
 * Surface points, contour arcs, paths and portraits are all seated on the
 * SAME ellipsoid and projected by the same view each frame, so the whole
 * scene drifts together; nothing sits still while its neighbours move.
 *
 * All three teams render through this one component. Only `composition`
 * differs — which is the entire point of the section.
 */
export function SpatialTeamScene({
  roster,
  accent,
  composition,
  visible,
  reveal,
  enter,
  exit,
  reducedMotion,
  onOpen,
}: SpatialTeamSceneProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const nodeRefs = useRef<Array<HTMLButtonElement | null>>([])
  const tagRefs = useRef<Array<HTMLSpanElement | null>>([])
  const flowRef = useRef<SVGGElement>(null)
  const arcRef = useRef<SVGGElement>(null)
  const dustRef = useRef<SVGGElement>(null)
  const revealRef = useRef(reveal)
  const visibleRef = useRef(visible)
  const enterRef = useRef(enter)
  const exitRef = useRef(exit)
  /** Hovered/focused person, held in a ref so emphasis costs no re-render. */
  const hotRef = useRef(-1)
  revealRef.current = reveal
  visibleRef.current = visible
  enterRef.current = enter
  exitRef.current = exit

  /**
   * The authored composition, resolved against this roster. A seat is
   * matched by person id, so a roster that gains or loses somebody shows
   * up here as a missing seat rather than as a silently shifted field.
   */
  const seated = useMemo(() => {
    const named = new Set(composition.seats.map((spec) => spec.id))
    const indexOf: Record<string, number> = {}
    roster.forEach((person, i) => {
      indexOf[person.id] = i
    })
    /* Anyone the composition does not name still gets a seat, tucked just
       below the authored field, so nobody can silently vanish from a
       scene because two files fell out of step. */
    const extras = roster.filter((p) => !named.has(p.id))
    const spec = [
      ...composition.seats.filter((seat) => indexOf[seat.id] !== undefined),
      ...extras.map((p, i) => ({
        id: p.id,
        at: [-0.55 + (i % 4) * 0.37, -0.78 - Math.floor(i / 4) * 0.18] as readonly [number, number],
        role: 'member' as Role,
        group: 0,
      })),
    ]
    return { spec, indexOf }
  }, [composition, roster])

  const arcs = useMemo(() => fieldArcs(composition.kind), [composition.kind])
  const dust = useMemo(() => surfaceField(150), [])

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    const pointer = { x: 0, y: 0 }
    const smooth = { x: 0, y: 0 }

    /* Clamped, because the listener is on the window and the scene is a
       sticky panel: a pointer well above or below it normalises to far
       outside ±1, and the view would then swing past the envelope the
       seats were separated for. */
    const clamp1 = (v: number) => (v < -1 ? -1 : v > 1 ? 1 : v)
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      const r = wrap.getBoundingClientRect()
      pointer.x = clamp1(((e.clientX - r.left) / Math.max(1, r.width)) * 2 - 1)
      pointer.y = clamp1(((e.clientY - r.top) / Math.max(1, r.height)) * 2 - 1)
    }
    if (!reducedMotion) window.addEventListener('pointermove', onMove, { passive: true })

    /* Everything the layout decides lives here and is rewritten whenever
       the frame changes; the draw loop only ever reads it. */
    const layout = {
      seats: [] as Placement[],
      flows: buildLinks(composition.links, seated.indexOf),
      cluster: [] as number[],
      role: [] as Role[],
      spreadX: composition.spread[0],
      spreadY: composition.spread[1],
      fieldH: 1,
      /** Static offsets that centre the drawn field in its frame. */
      centre: 0,
      centreX: 0,
      /** How far the view may travel when the field is taller than the frame. */
      panRange: 0,
    }
    const boxes: Footprint[] = roster.map(() => ({ rx: 0, ry: 0, offsetY: 0 }))

    /**
     * A measurement is only usable if it is a real, positive layout box.
     *
     * `offsetWidth` reports 0 — not `undefined` — for an element the
     * browser has not laid out yet or has laid out inside a `display:
     * none` subtree, so a nullish fallback sails straight past the bad
     * case and hands the solver a zero-sized footprint. Zero footprints
     * collide with nothing, which switches the separation pass off
     * silently at exactly the moment the layout is least trustworthy.
     */
    const usable = (v: number | undefined, fallback: number) =>
      typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : fallback

    /**
     * Read each label's real layout box instead of assuming one.
     *
     * `offsetWidth/Height` are pre-transform, so they give the label at
     * its authored size even though every node carries a per-frame
     * perspective scale — which is exactly the footprint the relaxation
     * works in. Measuring rather than guessing is what makes long titles
     * safe: a two- or three-line role reports a taller box and the field
     * opens up around that node on its own, with no per-person special
     * cases anywhere in the layout. It is also what lets a colleague with
     * no role line take the smaller footprint they actually occupy.
     */
    const measure = (fit: number) => {
      for (let i = 0; i < roster.length; i++) {
        /* Read the rendered portrait rather than recomputing it, so the
           viewport fit applied in CSS is already baked into the number. */
        const d = usable(nodeRefs.current[i]?.offsetWidth, nodeSize(roster[i]) * fit)
        const tag = tagRefs.current[i]
        const lw = usable(tag?.offsetWidth, d)
        /* Zero is a legitimate label height (a node with no label), so
           this one only has to be a number. */
        const rawLh = tag?.offsetHeight ?? 0
        const lh = Number.isFinite(rawLh) ? rawLh : 0
        const gap = LABEL_GAP * fit
        boxes[i] = {
          rx: Math.max(d, lw) / 2,
          ry: (d + gap + lh) / 2,
          offsetY: (gap + lh) / 2,
        }
      }
    }

    /** The widest the authored composition reaches, in surface units. */
    const span = (qs: ReadonlyArray<{ x: number; y: number }>) => {
      if (qs.length === 0) return 0
      const xs = qs.map((q) => q.x)
      const ys = qs.map((q) => q.y)
      return Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys))
    }

    /**
     * Is this a composition, or wreckage?
     *
     * Two opposite failures are worth catching, and neither announces
     * itself: seats carrying a non-finite number, and seats that have
     * closed up into a pile. A solve is the one place in this file where
     * a single bad number reaches a whole roster of transforms at once,
     * so the result is checked rather than trusted.
     */
    const plausible = (qs: Placement[], authoredSpan: number) => {
      for (const q of qs) {
        if (!Number.isFinite(q.x) || !Number.isFinite(q.y) || !Number.isFinite(q.z)) return false
        /* Every seat has to still be on the cap the solver re-seats onto;
           anything past it was never projected from this surface. */
        if (Math.hypot(q.x / RX, q.y / RY) > CAP_SIN * 1.001 + 1e-6) return false
      }
      /* A field that has closed to a fraction of its authored width is the
         top-left collapse in another guise — technically finite, and
         still unusable. */
      return span(qs) > authoredSpan * 0.5
    }

    let alive = true
    /* The last view actually written to the DOM. A re-layout repaints
       through this rather than through the resting view, so re-solving
       mid-drift does not snap the whole field back to centre. */
    let lastView: ViewState = {
      yaw: 0,
      pitch: 0,
      advance: revealRef.current,
      spreadX: layout.spreadX,
      spreadY: layout.spreadY,
      pan: 0,
    }
    let lastTime = 0
    const redraw = () => draw(lastView, lastView.advance, lastTime)

    const relax = () => {
      const r = wrap.getBoundingClientRect()
      /* Never solve from a container that has no usable layout.
         A ResizeObserver fires on teardown, on `display: none`, and on
         the first observation of an element the browser has not laid out
         yet, and all three report a zero box. Solving against one of
         those produces an arrangement that is wrong everywhere, so the
         previous valid layout is kept and the next observation is waited
         for instead. */
      if (!(r.width >= 2 && r.height >= 2)) return
      const compact = isCompact(r.width, r.height)
      /* A fixed composition is held at its anchors and fitted to the
         frame, rather than spread by authored numbers and separated
         freely — see `anchored` in `compositions`.

         Compact frames stay on the general path. A phone re-proportions
         the whole lateral plane and then genuinely needs the separation
         pass to place people, which is a different problem from holding
         a desktop composition still, and solving it with pins on would
         mean leaving labels overlapping instead. */
      const anchored = composition.anchored === true && !compact
      const baseFit = fitFor(r.width, r.height, compact)
      /* `fit` multiplies every size in the scene, so a NaN or an infinity
         would not just mis-size the field — it would propagate into the
         measured footprints and from there into the solve. */
      if (!Number.isFinite(baseFit) || baseFit <= 0) return

      const map = placeSeats(seated.spec, compact ? COMPACT_SHAPE : undefined)
      const authored = roster.map((p) => map.seats[p.id]).filter(Boolean)
      const authoredSpan = span(authored)
      const seat = (p: Person): Placement => map.seats[p.id] ?? { x: 0, y: 0, z: 0, centrality: 1 }

      let halfLabel = 0
      let above = 0
      let below = 0
      /**
       * Adopt a node scale and re-read the labels at it.
       *
       * Everything the spreads and the separation are solved against is
       * downstream of this — the measured footprints, the room the labels
       * claim at the edges of the frame, the plane the field is written
       * on — so it is one step that runs in full whenever the scale
       * changes, rather than a set of assignments to keep in step by
       * hand.
       */
      const applyFit = (fit: number) => {
        wrap.style.setProperty('--fit', fit.toFixed(4))
        wrap.style.setProperty('--type', typeFor(fit).toFixed(4))
        /* The width a title wraps against, and the two kinds of field
           want it solved in opposite directions.
           A free field buys room by moving people, so the cheapest thing
           it can give up is label width: closing the cap fast makes every
           node narrower, and the separation pass spends the width it
           releases. `labelMaxFor` is that ramp, and it closes faster than
           the type shrinks on purpose.
           An anchored field cannot move anybody, so the same trick costs
           it instead of paying: a cap tight enough to wrap a name onto
           two lines makes every node roughly forty per cent TALLER, and
           height is the axis a three-band composition has least of. So
           the cap tracks the type here — the label keeps its proportions
           as the field shrinks, names stay on one line, and what the
           composition needs is depth rather than width. */
        wrap.style.setProperty(
          '--label-max',
          `${anchored ? Math.round(LABEL_MAX * typeFor(fit)) : labelMaxFor(fit, compact)}px`,
        )
        /* Below full width the longest titles switch to their compact
           form. Set before measuring: it changes the label's box, and the
           box is what the field spaces itself around. */
        if (fit < 1) wrap.dataset.compact = 'true'
        else delete wrap.dataset.compact
        measure(fit)
        halfLabel = Math.max(...boxes.map((b) => b.rx))
        above = Math.max(...boxes.map((b) => b.ry - b.offsetY))
        below = Math.max(...boxes.map((b) => b.ry + b.offsetY))
        /* The frame decides the plane the composition is written on, and
           the plane decides the spreads. Both are set before the solve,
           so the seats are separated in exactly the space they are drawn
           in. */
        layout.fieldH = compact ? fieldHeightFor(boxes, r.width, r.height) : 1
      }

      /**
       * Where the finished field actually starts and ends on screen,
       * labels included, in frame percent from the centre — and, on the
       * side, where the seats alone reach.
       *
       * Measured rather than predicted. Everything upstream — the seat
       * solve, the perspective divide, a three-line role that makes one
       * node taller than the rest — feeds into this, and the point of the
       * numbers is to be right about the composition that exists rather
       * than about the one that was estimated.
       *
       * The two extents answer different questions and both are needed to
       * size a field: the drawn one is what has to fit in the frame, and
       * the difference between them is what the labels cost, which is a
       * number of pixels that does not move when the spread does.
       */
      const extents = (
        qs: ReadonlyArray<Placement>,
        views: ReadonlyArray<{ yaw: number; pitch: number }>,
      ) => {
        let loX = Infinity
        let hiX = -Infinity
        let loY = Infinity
        let hiY = -Infinity
        let seatLoX = Infinity
        let seatHiX = -Infinity
        let seatLoY = Infinity
        let seatHiY = -Infinity
        for (const v of views) {
          const view: ViewState = {
            yaw: v.yaw,
            pitch: v.pitch,
            advance: 1,
            spreadX: layout.spreadX,
            spreadY: layout.spreadY,
          }
          qs.forEach((q, i) => {
            const p = project(q, view)
            const sc = p.scale
            const halfW = ((boxes[i].rx * sc) / r.width) * 100
            const up = (((boxes[i].ry - boxes[i].offsetY) * sc) / r.height) * 100
            const down = (((boxes[i].ry + boxes[i].offsetY) * sc) / r.height) * 100
            seatLoX = Math.min(seatLoX, p.left)
            seatHiX = Math.max(seatHiX, p.left)
            seatLoY = Math.min(seatLoY, p.top)
            seatHiY = Math.max(seatHiY, p.top)
            loX = Math.min(loX, p.left - halfW)
            hiX = Math.max(hiX, p.left + halfW)
            loY = Math.min(loY, p.top - up)
            hiY = Math.max(hiY, p.top + down)
          })
        }
        return { loX, hiX, loY, hiY, seatLoX, seatHiX, seatLoY, seatHiY }
      }

      /**
       * The views a field is sized against.
       *
       * An anchored field is sized to hold its whole idle swing, so the
       * composition is inside the frame at every moment of it rather than
       * at the one instant it happens to be at rest. Everything else
       * keeps the resting view it was reviewed at.
       */
      const fitViews: ReadonlyArray<{ yaw: number; pitch: number }> = anchored
        ? FIT_VIEWS
        : [{ yaw: 0, pitch: 0 }]

      const bounds = (qs: Placement[]) => extents(qs, fitViews)

      /**
       * Fill the frame with a fixed composition.
       *
       * The arrangement is already decided, so the only question left is
       * how large to draw it, and the honest answer is: as large as the
       * frame allows once the labels have their room. Both are measured
       * rather than estimated — the seats where the perspective divide
       * actually puts them, the labels at the size they actually render.
       *
       * One step per axis, not a search. A seat's projected offset is
       * exactly proportional to the spread, while the label hanging off
       * it is a fixed number of pixels, so the room left over after the
       * labels divides straight through. The loop only runs again in case
       * the widest label at one edge is not the widest at the next
       * spread, and it settles well inside three passes.
       */
      const anchoredFit = (qs: ReadonlyArray<Placement>) => {
        const FILL = 99
        for (let pass = 0; pass < 3; pass++) {
          const b = extents(qs, fitViews)
          const seatW = b.seatHiX - b.seatLoX
          const seatH = b.seatHiY - b.seatLoY
          const padW = b.hiX - b.loX - seatW
          const padH = b.hiY - b.loY - seatH
          if (!(seatW > 0.01) || !(seatH > 0.01)) return
          const nx = (layout.spreadX * Math.max(6, FILL - padW)) / seatW
          const ny = (layout.spreadY * Math.max(6, FILL * layout.fieldH - padH)) / seatH
          if (!Number.isFinite(nx) || !Number.isFinite(ny) || nx <= 0 || ny <= 0) return
          layout.spreadX = nx
          layout.spreadY = ny
        }
      }

      /**
       * Set the spreads so a given set of seats fills the frame exactly.
       *
       * Wide frames use the authored numbers; those are reviewed, and
       * 1920 is what they were reviewed at.
       */
      const setSpreads = (qs: ReadonlyArray<Placement>) => {
        if (anchored) {
          layout.centre = 0
          anchoredFit(qs)
          return
        }
        if (!compact) {
          layout.spreadX = composition.spread[0]
          layout.spreadY = composition.spread[1] * layout.fieldH
          layout.centre = 0
          return
        }
        const fitted = frameSpread(
          Math.max(0.05, ...qs.map((q) => Math.abs(q.x))),
          Math.max(0.05, ...qs.map((q) => Math.abs(q.y))),
          r.width,
          r.height * layout.fieldH,
          halfLabel,
          above,
          below,
        )
        layout.spreadX = fitted.spreadX
        layout.spreadY = fitted.spreadY * layout.fieldH
      }

      /**
       * The anchors, and how far the separation pass may take a seat from
       * its own.
       *
       * The radius is a fraction of the distance to that seat's NEAREST
       * neighbour rather than one number for the field, which is what
       * makes the guarantee hold everywhere in it: the two people closest
       * together are the pair the pass is most likely to want to move,
       * and they are also the pair with the least room to be moved into.
       * Deriving the allowance from that distance means a crowded corner
       * is held tightly and an open one is held loosely, and neither can
       * produce a seat that has left its own place. See `PIN_FRACTION`.
       */
      const anchorAt = roster.map((p) => seat(p))
      const pins: Pin[] | null = anchored
        ? anchorAt.map((q, i) => {
            let nearest = Infinity
            for (let j = 0; j < anchorAt.length; j++) {
              if (j === i) continue
              nearest = Math.min(nearest, Math.hypot(anchorAt[j].x - q.x, anchorAt[j].y - q.y))
            }
            return { x: q.x, y: q.y, r: Number.isFinite(nearest) ? nearest * PIN_FRACTION : 0 }
          })
        : null

      /* Solve into a copy: a solver that returns nonsense must not be
         able to leave the live seats in that state. */
      const solveOnce = () => {
        const out = roster.map((p) => ({ ...seat(p) }))
        relaxSeats(out, boxes, layout.spreadX, layout.spreadY, r.width, r.height, RELAX_VIEWS, pins)
        return out
      }

      /**
       * How far out the separation pass may carry a seat.
       *
       * The pass knows about its neighbours and nothing about the frame,
       * and it is free to push a seat all the way to the rim of the cap —
       * which on a narrow frame is roughly twice as far out as the
       * authored field reaches. Letting that stand means either a label
       * off the edge, or, if the spread is refitted to it, one outlier
       * setting the scale for everybody and the other fourteen bunching
       * into the middle. Neither is a composition.
       *
       * So the field is allowed to grow, by a bounded amount, and the
       * spread is solved for that bound. Anything past it is drawn back
       * onto the boundary rather than off the frame.
       */
      const GROW = 1.12
      const authoredR = Math.max(
        0.05,
        ...authored.map((q) => Math.hypot(q.x / RX, q.y / RY)),
      )
      const limitR = Math.min(CAP_SIN, authoredR * GROW)

      const bound = (qs: Placement[]) => {
        for (const q of qs) {
          const rr = Math.hypot(q.x / RX, q.y / RY)
          if (rr > limitR) {
            q.x *= limitR / rr
            q.y *= limitR / rr
            const k = (q.x / RX) ** 2 + (q.y / RY) ** 2
            q.z = RZ * Math.sqrt(Math.max(0, 1 - k))
            q.centrality = Math.min(1, Math.hypot(q.x / RX, q.y / RY))
          }
        }
        return qs
      }

      /**
       * The deepest overlap left in a finished solve, in pixels.
       *
       * The same test the separation pass uses, run once over the result:
       * two nodes are clear when they are clear on either axis, in every
       * view the field is allowed to drift to. Zero means the composition
       * came out clean.
       */
      const worstOverlap = (qs: Placement[]) => {
        let worst = 0
        for (const v of RELAX_VIEWS) {
          const view: ViewState = {
            yaw: v.yaw,
            pitch: v.pitch,
            advance: 1,
            spreadX: layout.spreadX,
            spreadY: layout.spreadY,
          }
          const px = qs.map((q) => {
            const p = project(q, view)
            return { x: ((50 + p.left) / 100) * r.width, y: ((50 + p.top) / 100) * r.height, s: p.scale }
          })
          for (let i = 0; i < px.length; i++) {
            for (let j = i + 1; j < px.length; j++) {
              const a = px[i]
              const b = px[j]
              const penX = boxes[i].rx * a.s + boxes[j].rx * b.s - Math.abs(b.x - a.x)
              const penY =
                boxes[i].ry * a.s +
                boxes[j].ry * b.s -
                Math.abs(b.y + boxes[j].offsetY * b.s - (a.y + boxes[i].offsetY * a.s))
              if (penX > 0 && penY > 0) worst = Math.max(worst, Math.min(penX, penY))
            }
          }
        }
        return worst
      }

      const grown = () => authored.map((q) => ({ ...q, x: q.x * GROW, y: q.y * GROW }))
      /* An anchored field is fitted to the seats it actually has. The
         pass may move somebody a few pixels and no further, so leaving it
         room to grow by a tenth would only under-fill the frame by the
         same tenth. */
      const fitTo = () => (anchored ? authored : grown())

      let fit = baseFit
      applyFit(fit)
      setSpreads(fitTo())
      let solved = bound(solveOnce())
      /**
       * Ask for the height the field actually needs.
       *
       * `fieldHeightFor` estimates it from the total label area, and an
       * estimate is the wrong instrument for the question: a composition
       * is clustered, not evenly spread, so two fields of identical area
       * can need very different amounts of room. The solve itself answers
       * it exactly — so the field is solved, checked, and given more room
       * only if the check says it is short.
       *
       * A wide frame never enters this loop: those spreads are authored,
       * the field fits, and a laptop that started panning would be a
       * regression rather than a rescue.
       */
      for (let attempt = 0; compact && attempt < 3; attempt++) {
        if (worstOverlap(solved) <= 0 || layout.fieldH >= FIELD_H_MAX) break
        layout.fieldH = Math.min(FIELD_H_MAX, layout.fieldH * 1.35)
        setSpreads(fitTo())
        solved = bound(solveOnce())
      }

      /**
       * An anchored field cannot spread its way out of a collision.
       *
       * Everywhere else in this file a crowded layout is answered by
       * moving people, and the pins are precisely the thing that stops
       * that here — which leaves one honest response when a frame is too
       * small for the composition at this node scale: draw the whole
       * formation smaller. Every node shrinks by the same step, the
       * labels shrink with them and release width back to the fit, and
       * the arrangement that comes out is the same arrangement.
       *
       * On the sizes this composition is reviewed at the loop does not
       * run at all. It is what stands between an unusual frame and a
       * label sitting on a portrait, not part of how the field is sized.
       */
      /**
       * What counts as an overlap worth shrinking for.
       *
       * The footprints the solve works in are the label's LAYOUT boxes,
       * and a label carries its own padding — nine pixels of it either
       * side of the text, six above and seven below, all scaled with the
       * type. Two boxes touching therefore still leaves the words
       * themselves clearly apart, and treating that as a collision would
       * shrink every portrait in the section to buy back space that is
       * already empty. The tolerance is that padding rather than a number
       * picked to make a layout pass: inside it, no two characters can
       * meet, and a portrait is a circle drawn inside its box so its
       * corners are emptier still.
       */
      const slack = 13 * typeFor(fit)
      for (let attempt = 0; anchored && attempt < 4; attempt++) {
        const w = worstOverlap(solved)
        if (w <= slack || fit <= FIT_MIN + 1e-4) break
        fit = Math.max(FIT_MIN, fit * 0.94)
        applyFit(fit)
        setSpreads(fitTo())
        solved = bound(solveOnce())
      }

      /**
       * Pull the spread in if the finished field would leave the frame.
       *
       * A wide frame uses the authored spreads, and those are written for
       * the composition as authored — not for the composition after the
       * separation pass has pushed it outwards, which on a crowded field
       * is measurably wider. The difference used to be absorbed by the
       * portraits being small; at the size they are now it is the
       * difference between a full frame and a clipped label.
       *
       * Shrinking the spread after the solve costs a little of the
       * separation the pass just found, and the amount is small because
       * the overshoot is small. A field a few percent tighter is a far
       * better outcome than one a few percent off the edge.
       */
      const fitted = bounds(solved)
      const overX = Math.max(-fitted.loX, fitted.hiX) / 49
      const overY = Math.max(-fitted.loY, fitted.hiY) / 49
      if (Number.isFinite(overX) && overX > 1) layout.spreadX /= overX
      if (Number.isFinite(overY) && overY > 1) layout.spreadY /= overY

      /* Centre the finished field on both axes. The composition is not
         symmetric — every label hangs below its portrait, and the seats
         themselves are hand-placed rather than balanced — so centring the
         seats would leave the field visibly high in its frame. Centring
         what is drawn puts the same amount of air above and below it. */
      const b = bounds(solved)
      layout.centre = -(b.loY + b.hiY) / 2
      layout.centreX = -(b.loX + b.hiX) / 2
      /* A field wider or taller than its frame has to be travelled
         through rather than seen at once. Horizontal travel is never
         wanted — a field that does not fit sideways is a field that
         needed a taller plane — so only the vertical range is kept, and
         it is exactly the overshoot rather than a guess at it. */
      layout.panRange = Math.max(0, (b.hiY - b.loY) / 2 - 50)

      /* Adopt the solve only if it is still a composition. If it is not,
         the authored arrangement is used instead — valid by construction.
         The field is drawn and revealed either way: a composition solved
         for a slightly stale size is a far better failure than a whole
         team hidden or piled in a corner. */
      layout.seats = plausible(solved, authoredSpan) ? solved : roster.map((p) => ({ ...seat(p) }))
      layout.cluster = roster.map((p) => map.cluster[p.id] ?? 0)
      layout.role = roster.map((p) => map.role[p.id] ?? 'member')
      /* Apply the new solve immediately. Positions are never left to the
         next animation frame, which may be a long way off — the loop
         idles whenever the chapter is off screen. */
      redraw()
      /* Only now are the nodes safe to show: see `.nodes` in the
         stylesheet, which keeps them hidden until this flag appears. */
      wrap.dataset.laid = 'true'
    }

    /**
     * Write one view of the field to the DOM — contour arcs, surface
     * points, paths and the people.
     *
     * Separate from the animation loop because the composition also has
     * to be repainted the moment it is re-laid-out, without waiting for a
     * frame and without snapping back to the resting view.
     */
    const draw = (view: ViewState, rv: number, time: number) => {
      lastView = view
      lastTime = time
      const hot = hotRef.current
      const seats = layout.seats
      if (seats.length === 0) return

      /* Contour arcs — the curvature of the world, and the one drawn
         element that says which composition this is. */
      const arcG = arcRef.current
      if (arcG) {
        for (let a = 0; a < arcs.length && a < arcG.children.length; a++) {
          let d = ''
          for (let i = 0; i < arcs[a].length; i++) {
            const q = project(arcs[a][i], view)
            d += `${i === 0 ? 'M' : 'L'}${(50 + q.left).toFixed(2)} ${(50 + q.top).toFixed(2)}`
          }
          arcG.children[a].setAttribute('d', d)
        }
      }

      /* Surface dust — seated on the same ellipsoid, so it belongs to the
         world rather than floating as a separate particle layer. */
      const dustG = dustRef.current
      if (dustG) {
        for (let i = 0; i < dust.length && i < dustG.children.length; i++) {
          const q = project(dust[i], view)
          const el = dustG.children[i] as SVGCircleElement
          el.setAttribute('cx', (50 + q.left).toFixed(2))
          el.setAttribute('cy', (50 + q.top).toFixed(2))
          el.setAttribute('r', (0.09 + q.depth * 0.14).toFixed(3))
          el.setAttribute('opacity', (0.06 + q.depth * 0.18).toFixed(3))
        }
      }

      const proj = seats.map((p) => project(p, view))

      /* Paths — few, curved, and clearly brighter where they touch the
         active person. */
      const flowG = flowRef.current
      if (flowG) {
        for (let i = 0; i < layout.flows.length && i < flowG.children.length; i++) {
          const f = layout.flows[i]
          const pa = proj[f.a]
          const pb = proj[f.b]
          if (!pa || !pb) continue
          const x1 = 50 + pa.left
          const y1 = 50 + pa.top
          const x2 = 50 + pb.left
          const y2 = 50 + pb.top
          const dx = x2 - x1
          const dy = y2 - y1
          const cx = (x1 + x2) / 2 + -dy * f.bow
          const cy = (y1 + y2) / 2 + dx * f.bow
          const el = flowG.children[i] as SVGPathElement
          el.setAttribute(
            'd',
            `M${x1.toFixed(2)} ${y1.toFixed(2)}Q${cx.toFixed(2)} ${cy.toFixed(2)} ${x2.toFixed(2)} ${y2.toFixed(2)}`,
          )
          const near = (pa.depth + pb.depth) * 0.5
          /* The paths carry each composition's identity — three currents,
             or a closed shell — so they sit a little above the whisper a
             single network needed them at. Still well under the
             portraits: connective material, never diagram. */
          const base = (0.1 + near * 0.2) * f.weight
          /* Emphasis follows the structure, not just the endpoints: a
             person lights their own path, an anchor lights its group, the
             lead lights the spine and every group a little. */
          let em = 0
          if (hot >= 0) {
            const hotRole = layout.role[hot]
            const hotCluster = layout.cluster[hot]
            if (f.a === hot || f.b === hot) em = 1
            else if (hotRole === 'anchor' && f.kind === 'cluster' && f.cluster === hotCluster)
              em = 0.85
            else if (hotRole === 'lead')
              em = f.kind === 'spine' ? 1 : f.kind === 'cluster' ? 0.45 : 0.2
            else if (hotRole === 'member' && f.kind === 'cluster' && f.cluster === hotCluster)
              em = 0.28
          }
          const dimmed = hot >= 0 && em === 0 ? 0.55 : 1
          const opacity = Math.min(0.7, base * dimmed * (1 + em * 3.4))
          el.setAttribute('opacity', opacity.toFixed(3))
          el.setAttribute('stroke-width', (0.85 + em * 0.75).toFixed(2))
        }
      }

      for (let i = 0; i < proj.length; i++) {
        const el = nodeRefs.current[i]
        if (!el) continue
        const q = proj[i]
        const drift = reducedMotion ? 0 : Math.sin(time * 0.42 + i * 1.7) * 0.3
        const scale = q.scale * (0.88 + rv * 0.12)
        /* The last line of defence, and the cheapest.
           A node's ONLY position is this transform; its box is pinned at
           `left: 0; top: 0`. A non-finite number here neither throws nor
           warns — the browser rejects the whole `transform` declaration,
           the node drops back to that pin, and one bad frame puts the
           entire team in the container's top-left corner. So an
           unrenderable value is never written: the node keeps the last
           transform that was good, and the composition holds. */
        if (
          !Number.isFinite(q.left) ||
          !Number.isFinite(q.top) ||
          !Number.isFinite(drift) ||
          !Number.isFinite(scale) ||
          scale <= 0
        ) {
          continue
        }
        el.style.transform =
          `translate3d(calc(${(50 + q.left).toFixed(2)}cqw - 50%),` +
          ` calc(${(50 + q.top).toFixed(2)}cqh - 50% + ${drift.toFixed(2)}px), 0)` +
          ` scale(${scale.toFixed(3)})`
        el.style.zIndex = String(100 + Math.round(q.depth * 60))
        /* Calmer at rest; whatever is active reads clearly above the rest.
           The floor matters as much as the emphasis: a colleague who is
           not the active one is still someone this section is about, so
           nobody is ever dimmed toward the background. */
        let dim = 1
        if (hot >= 0 && hot !== i) {
          const hotRole = layout.role[hot]
          const sameGroup = layout.cluster[hot] === layout.cluster[i]
          dim =
            hotRole === 'lead'
              ? 0.9
              : hotRole === 'anchor' && sameGroup
                ? 0.92
                : layout.role[i] === 'lead' || layout.role[i] === 'anchor'
                  ? 0.82
                  : 0.74
        }
        el.style.opacity = Math.max(0.55, (0.74 + q.depth * 0.26) * dim).toFixed(3)
      }
    }

    relax()
    /* Labels are measured, so the layout has to be re-run once the web
       font replaces the fallback — otherwise every footprint is sized
       from the wrong metrics and the spacing is subtly wrong. */
    document.fonts?.ready.then(() => {
      if (alive) relax()
    })
    const ro = new ResizeObserver(relax)
    ro.observe(wrap)

    let raf = 0
    const t0 = performance.now()
    const frame = () => {
      raf = requestAnimationFrame(frame)
      /* Idle while the CHAPTER is off screen — not while the reveal is
         still at zero. Those are two different moments: the block fades
         in a long stretch of scrolling before the members begin to
         assemble, and gating the loop on the reveal left the field
         undrawn for the whole of that stretch. Undrawn means unpositioned
         — a node's only position is the transform written here — so the
         whole team sat stacked in the scene's top-left corner while the
         chapter faded up around them. */
      if (visibleRef.current <= 0.005) return
      /* Reduced motion gets the settled composition and holds it: no
         drift, no reveal push, no handover morph, no pan. It is the same
         arrangement the solver was given, which is the most legible
         moment this field has. */
      const rv = reducedMotion ? 1 : revealRef.current
      const time = reducedMotion ? 0 : (performance.now() - t0) / 1000

      const k = reducedMotion ? 1 : 0.045
      smooth.x += (pointer.x - smooth.x) * k
      smooth.y += (pointer.y - smooth.y) * k

      /* The handover. A chapter arrives holding the shape the previous
         one left in, and leaves holding the shape the next one arrives
         in, so what crosses on screen is one field reorganising rather
         than two fields swapped. Both ends are locked to the same
         progress that drives the opacity, so the morph only ever happens
         while the chapter is partly transparent — the settled field is
         always the one the seats were solved for. */
      const inK = reducedMotion ? 1 : enterRef.current
      const outK = reducedMotion ? 0 : exitRef.current
      const morph = (base: number, from: number, to: number) =>
        base * (from + (1 - from) * inK) * (1 + (to - 1) * outK)

      draw(
        {
          yaw: reducedMotion ? 0 : Math.sin(time * 0.052) * YAW_DRIFT + smooth.x * YAW_POINTER,
          pitch: reducedMotion ? 0 : Math.sin(time * 0.039) * PITCH_DRIFT + smooth.y * PITCH_POINTER,
          advance: rv,
          spreadX: morph(layout.spreadX, composition.enterShape[0], composition.exitShape[0]),
          spreadY: morph(layout.spreadY, composition.enterShape[1], composition.exitShape[1]),
          /* Two offsets on one channel: the static one that centres an
             asymmetric field in its frame, and the travel for a field
             taller than the frame. The travel is driven by the chapter's
             own arrival and departure rather than by the reveal, so it
             runs the whole length of the chapter and settles at the
             middle of the field — the reveal finishes early and would
             have parked the view at the bottom for the rest of it. At
             `fieldH` 1, which is every size tested here, the term is
             exactly zero. */
          pan:
            layout.centre +
            layout.panRange * (1 - 2 * (reducedMotion ? 0.5 : (inK + outK) / 2)),
          panX: layout.centreX,
        },
        rv,
        time,
      )
    }
    raf = requestAnimationFrame(frame)
    return () => {
      alive = false
      ro.disconnect()
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
    }
  }, [arcs, dust, seated, composition, roster, reducedMotion])

  return (
    <div ref={wrapRef} className={s.scene} style={{ ['--label-gap' as string]: `${LABEL_GAP}px` }}>
      <span
        className={s.glow}
        aria-hidden="true"
        style={{
          background:
            `radial-gradient(52% 46% at 46% 44%, ${accent}12, transparent 72%),` +
            ` radial-gradient(80% 64% at 52% 56%, rgba(245,239,228,0.035), transparent 78%)`,
        }}
      />

      <svg
        className={s.structure}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <g ref={dustRef} fill={accent}>
          {dust.map((_, i) => (
            <circle key={i} />
          ))}
        </g>
        <g ref={arcRef} stroke={accent} strokeWidth="1" fill="none" opacity="0.16">
          {arcs.map((_, i) => (
            <path key={i} vectorEffect="non-scaling-stroke" />
          ))}
        </g>
        <g ref={flowRef} stroke={accent} strokeWidth="0.85" fill="none" strokeLinecap="round">
          {composition.links.map((_, i) => (
            <path key={i} vectorEffect="non-scaling-stroke" />
          ))}
        </g>
      </svg>

      <div className={s.nodes}>
        {roster.map((person, i) => {
          const lead = person.leadershipLevel === 'team-lead'
          const mgr = person.leadershipLevel === 'program-manager'
          const size = nodeSize(person)
          const role = displayRole(person)
          /* Both forms are rendered; the stylesheet shows whichever one
             the current width calls for, so switching between them costs
             no re-render and no re-measure of the roster. */
          const compact = role ? compactRole(role) : undefined
          return (
            <button
              key={person.id}
              type="button"
              ref={(el) => {
                nodeRefs.current[i] = el
              }}
              className={`${s.node} ${lead ? s.nodeLead : ''} ${mgr ? s.nodeMgr : ''}`}
              style={{ ['--node-d' as string]: `${size}px`, ['--accent' as string]: accent }}
              onPointerEnter={() => {
                hotRef.current = i
              }}
              onPointerLeave={() => {
                if (hotRef.current === i) hotRef.current = -1
              }}
              onFocus={() => {
                hotRef.current = i
              }}
              onBlur={() => {
                if (hotRef.current === i) hotRef.current = -1
              }}
              onClick={() => onOpen(person)}
            >
              <span className={s.ring} aria-hidden="true" />
              <span className={s.disc}>
                <img
                  className={s.photo}
                  src={person.photo}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  style={{ objectPosition: portraitFocus(person.photoPosition) }}
                />
              </span>
              <span
                className={s.tag}
                ref={(el) => {
                  tagRefs.current[i] = el
                }}
              >
                <span className={s.tagName}>{person.name}</span>
                {/* A role line only when there is a role to show. An
                    unconfirmed title is missing data, and printing that
                    fact under someone's portrait tells the reader nothing
                    about them. */}
                {role && (
                  <span className={s.tagRole}>
                    {compact === role ? (
                      role
                    ) : (
                      <>
                        <span className={s.roleFull}>{role}</span>
                        <span className={s.roleCompact}>{compact}</span>
                      </>
                    )}
                  </span>
                )}
              </span>
              <span className={s.srOnly}>
                {person.name}
                {role ? `, ${role}` : ''}. Open profile.
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
