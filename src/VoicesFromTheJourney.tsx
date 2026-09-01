import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react'
import type { MotionValue } from 'motion/react'
import { X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { VOICES } from './ppmd-voices/voicesData'
import { EmphasizedText } from './ppmd-content/EmphasizedText'
import { CHORUS, CHORUS_PHRASE, CLOSING, FIELD, PLANES, STATEMENT, TIMELINE, byLine } from './ppmd-voices/chorusData'
import type { Token } from './ppmd-voices/chorusData'
import { primaryTheme } from './ppmd-voices/voiceThemes'
import s from './VoicesFromTheJourney.module.css'

/**
 * KINETIC EDITORIAL CHORUS.
 *
 * The section is one pinned stage and one scrubbable timeline. Scroll
 * position is the only clock: every phase is a window on the same
 * progress value, which is why the whole thing runs backwards as
 * faithfully as it runs forwards — there is no state that has to be
 * unwound, only numbers that have to be read the other way.
 *
 *   opening      a chorus of names and fragments on five planes,
 *                drifting at five rates behind an oversized VOICES
 *   convergence  the chorus contracts and the words of the shared
 *                statement fly in from where its pieces were
 *   hold         the statement, still, long enough to read
 *   field        the twenty-one names again, calm and choosable
 *   closing      the chorus returns and compresses into the last line
 *
 * Choosing somebody is the one thing that is NOT on the timeline: it is
 * a state, it can happen at any point in the field, and it puts a full
 * testimonial on the stage until it is dismissed.
 *
 * WHAT MOVES AND WHAT COSTS.
 * Scroll drives motion values, not React state — the five planes, the
 * twelve word-tokens and every phase opacity are `MotionValue`s, so
 * scrubbing the timeline never re-renders a component. The idle breath
 * is CSS on each item. React state changes only when somebody points at
 * a name or opens one.
 */

/** Total scroll for the section. The stage is one screen of it. */
const SECTION_VH = 440

type CelestialBody =
  | 'sun'
  | 'mercury'
  | 'venus'
  | 'earth'
  | 'moon'
  | 'mars'
  | 'jupiter'
  | 'saturn'
  | 'uranus'
  | 'neptune'

/* One coherent planetary language for all twenty-one voices. The Sun
   carries three voices; every other body carries two, keeping the
   sequence varied without turning it into a separate selector UI. */
const VOICE_BODY: Record<string, CelestialBody> = {
  'VOICE-01': 'neptune',
  'VOICE-02': 'jupiter',
  'VOICE-03': 'sun',
  'VOICE-04': 'mars',
  'VOICE-05': 'saturn',
  'VOICE-06': 'moon',
  'VOICE-07': 'jupiter',
  'VOICE-08': 'sun',
  'VOICE-09': 'earth',
  'VOICE-10': 'venus',
  'VOICE-11': 'uranus',
  'VOICE-12': 'neptune',
  'VOICE-13': 'sun',
  'VOICE-14': 'mercury',
  'VOICE-15': 'moon',
  'VOICE-16': 'saturn',
  'VOICE-17': 'uranus',
  'VOICE-18': 'venus',
  'VOICE-19': 'earth',
  'VOICE-20': 'mars',
  'VOICE-21': 'mercury',
}

const CELESTIAL_ASSETS = {
  sun: 'solar-corona-normalized.png',
  mercury: 'mercury-glow-normalized.png',
  venus: 'venus-glow-realistic.png',
  moon: 'moon-corona-normalized.png',
  earth: 'earth-glow-normalized.png',
  mars: 'mars-glow-realistic.png',
  jupiter: 'jupiter-glow-realistic.png',
  saturn: 'saturn-glow-realistic.png',
  uranus: 'uranus-glow-realistic.png',
  neptune: 'neptune-glow-realistic.png',
} as const

/* Phase edges live beside the composition they belong to, so the shape
   of the section can be checked without a React tree. */
const { openOut: OPEN_OUT, converge: CONVERGE, statementIn: STATEMENT_IN,
  statementOut: STATEMENT_OUT, fieldIn: FIELD_IN, fieldOut: FIELD_OUT,
  returnIn: RETURN_IN, closingIn: CLOSING_IN, exit: EXIT } = TIMELINE

export default function VoicesFromTheJourney() {
  const reduced = useReducedMotion() ?? false
  const wide = useWideViewport()
  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const voiceOpenerRef = useRef<HTMLElement | null>(null)
  const voiceOpenerIdRef = useRef<string | null>(null)
  const voiceReturnProgressRef = useRef(0.56)

  const [spot, setSpot] = useState<string | null>(null)
  const [open, setOpen] = useState<string | null>(null)
  const [returningToField, setReturningToField] = useState(false)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })
  /* A light spring so scrubbing feels weighted rather than mechanical.
     Stiff enough that it never lags behind a deliberate scroll. */
  const p = useSpring(scrollYProgress, { stiffness: 220, damping: 40, mass: 0.35 })

  const openIndex = open ? VOICES.findIndex((v) => v.id === open) : -1
  const openVoice = openIndex >= 0 ? VOICES[openIndex] : null
  const accent = openVoice ? primaryTheme(openVoice.id).color : spot ? primaryTheme(spot).color : '#e8c188'

  const goTo = useCallback((i: number) => {
    const n = VOICES.length
    setOpen(VOICES[((i % n) + n) % n].id)
  }, [])

  const openFromField = useCallback((id: string) => {
    voiceOpenerRef.current = document.activeElement as HTMLElement
    voiceOpenerIdRef.current = id
    const el = sectionRef.current
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY
      const travel = Math.max(1, el.offsetHeight - window.innerHeight)
      voiceReturnProgressRef.current = Math.min(1, Math.max(0, (window.scrollY - top) / travel))
    }
    setReturningToField(false)
    setOpen(id)
  }, [])

  const exploreAll = useCallback(() => {
    setReturningToField(true)
    setOpen(null)
    setSpot(null)
  }, [])

  const finishReturnToField = useCallback(() => {
    if (!returningToField) return
    const el = sectionRef.current
    const targetY = el
      ? el.getBoundingClientRect().top
        + window.scrollY
        + (el.offsetHeight - window.innerHeight) * voiceReturnProgressRef.current
      : window.scrollY
    setReturningToField(false)
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const stored = voiceOpenerRef.current
        const opener = stored?.isConnected
          ? stored
          : document.querySelector<HTMLElement>(
              `[data-voice-id="${voiceOpenerIdRef.current ?? ''}"]`,
            )
        opener?.focus({ preventScroll: true })
        window.scrollTo({ top: targetY, behavior: 'instant' })
      }),
    )
  }, [returningToField])

  /* Arrows and Escape while a voice is open. */
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goTo(openIndex - 1)
      else if (e.key === 'ArrowRight') goTo(openIndex + 1)
      else if (e.key === 'Escape') exploreAll()
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, openIndex, goTo, exploreAll])

  /* The global section rail remains usable above the full-screen voice.
     Close without restoring the Voices scroll position when that rail is
     used, otherwise the detail would follow the visitor into a new section. */
  useEffect(() => {
    if (!open) return
    const onSectionNavigation = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null
      if (!target?.closest('nav[aria-label="Sections"] button')) return
      setReturningToField(false)
      setOpen(null)
      setSpot(null)
    }
    document.addEventListener('click', onSectionNavigation, true)
    return () => document.removeEventListener('click', onSectionNavigation, true)
  }, [open])

  if (!wide) {
    return <NarrowChorus reduced={reduced} sectionRef={sectionRef} />
  }

  return (
    <section
      ref={sectionRef}
      className={s.container}
      aria-label="Voices from the journey"
      style={{ height: `${SECTION_VH}vh` }}
    >
      <div
        ref={stageRef}
        className={s.stage}
        data-open={open !== null || returningToField || undefined}
        style={{ ['--accent' as string]: accent }}
      >
        <div className={s.ground} aria-hidden="true" />

        <Chorus p={p} reduced={reduced} dim={open !== null} />
        <DisplayWord p={p} reduced={reduced} hidden={open !== null} />
        <ScrollCue p={p} hidden={open !== null} />
        <Assembly p={p} tokens={STATEMENT} inRange={STATEMENT_IN} outRange={STATEMENT_OUT}
          converge={CONVERGE} reduced={reduced} hidden={open !== null} className={s.statement} />
        <Field p={p} spot={spot} setSpot={setSpot} open={open} onOpen={openFromField} />
        <Assembly p={p} tokens={CLOSING} inRange={CLOSING_IN} outRange={EXIT}
          converge={CLOSING_IN} reduced={reduced} hidden={open !== null} className={s.closing} />

        <AnimatePresence mode="sync" onExitComplete={finishReturnToField}>
          {openVoice && (
            <Spotlight
              voice={openVoice}
              reduced={reduced}
              onPrev={() => goTo(openIndex - 1)}
              onNext={() => goTo(openIndex + 1)}
              onExplore={exploreAll}
            />
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

function ScrollCue({ p, hidden }: { p: MotionValue<number>; hidden: boolean }) {
  const opacity = useTransform(p, [0, 0.16, 0.21], [1, 1, 0])
  const y = useTransform(p, [0, 0.21], [0, -8])

  return (
    <motion.div
      className={s.scrollCue}
      style={{ opacity, y }}
      aria-hidden="true"
      data-hidden={hidden || undefined}
    >
      <span>Scroll to gather the voices</span>
      <i />
    </motion.div>
  )
}

/* ── The opening chorus ──────────────────────────────────────
   Forty pieces of type on five planes. Each PLANE carries the
   scroll-driven travel, so the timeline moves five elements and not
   forty; each ITEM carries its own idle breath in CSS, so the chorus is
   alive when the page is still. */
function Chorus({ p, reduced, dim }: { p: MotionValue<number>; reduced: boolean; dim: boolean }) {
  const fade = useTransform(p, [0, OPEN_OUT[0], OPEN_OUT[1]], [1, 1, 0])
  /* The chorus comes back for the closing, travelling the other way. */
  const back = useTransform(p, [RETURN_IN[0], RETURN_IN[1], CLOSING_IN[1]], [0, 0.5, 0])
  const opacity = useTransform([fade, back] as MotionValue<number>[], ([a, b]: number[]) =>
    Math.max(a, b),
  )

  /* The dimming while a testimonial is open is a WRAPPER, not a term
     inside the transform: a transform's function is built once and would
     keep whatever value `dim` had on the first render for ever. */
  return (
    <div className={s.chorusDim} data-dim={dim || undefined} aria-hidden="true">
      <motion.div className={s.chorus} style={{ opacity }}>
        {PLANES.map((plane, k) => (
          <Plane key={k} p={p} plane={plane} index={k} reduced={reduced} />
        ))}
      </motion.div>
    </div>
  )
}

function Plane({
  p,
  plane,
  index,
  reduced,
}: {
  p: MotionValue<number>
  plane: (typeof PLANES)[number]
  index: number
  reduced: boolean
}) {
  const items = useMemo(() => CHORUS.filter((c) => c.plane === index), [index])

  /* Out along the plane's own vector through the opening, then pulled
     back toward the middle as the statement assembles — the pieces
     visibly gather rather than simply fading out. */
  const x = useTransform(
    p,
    [0, CONVERGE[0], CONVERGE[1]],
    ['0vw', `${plane.driftX}vw`, `${plane.driftX * 0.12}vw`],
  )
  const y = useTransform(
    p,
    [0, CONVERGE[0], CONVERGE[1]],
    ['0vh', `${plane.driftY}vh`, `${plane.driftY * 0.1}vh`],
  )
  const scale = useTransform(p, [CONVERGE[0], CONVERGE[1]], [1, 0.62])
  const rotate = useTransform(
    p,
    [0, CONVERGE[0], CONVERGE[1]],
    [0, index % 2 === 0 ? -1.6 : 1.6, 0],
  )
  const blurPx = useTransform(p, [CONVERGE[0], CONVERGE[1]], [plane.blur, plane.blur + 5])
  const filter = useMotionTemplate`blur(${blurPx}px)`

  /* Every hook runs on every render; only the style is conditional. */
  const style = reduced
    ? { opacity: plane.opacity, zIndex: plane.z }
    : { x, y, scale, rotate, filter, opacity: plane.opacity, zIndex: plane.z }

  return (
    <motion.div className={s.plane} style={style}>
      {items.map((it) => (
        <span
          key={it.key}
          className={`${s.piece} ${it.kind === 'name' ? s.pieceName : s.piecePhrase}`}
          style={{
            left: `${it.x}%`,
            top: `${it.y}%`,
            /* Sized in vw, not rem: the scatter is authored in
               percentages, so type that does not scale with the stage
               would take a larger share of the width on a narrower
               screen and start colliding. */
            fontSize: `${plane.scale * 1.25}vw`,
            ['--breath' as string]: `${plane.breath}s`,
            ['--delay' as string]: `${it.delay}s`,
            ['--tint' as string]: it.color,
          }}
        >
          {it.text}
        </span>
      ))}
    </motion.div>
  )
}

/** The oversized word the chorus drifts around, cropped by the stage. */
function DisplayWord({ p, reduced, hidden }: { p: MotionValue<number>; reduced: boolean; hidden: boolean }) {
  /* The word is a ghost the chorus drifts across, so its resting value
     is the low one — an inline opacity would otherwise override the
     stylesheet and print it at full strength. */
  const opacity = useTransform(p, [0, 0.08, 0.2], [0.07, 0.07, 0])
  const scale = useTransform(p, [0, 0.2], [1, 1.28])
  const y = useTransform(p, [0, 0.2], ['0vh', '-6vh'])

  const style = reduced
    ? { opacity: hidden ? 0 : 0.07, pointerEvents: 'none' as const }
    : { opacity, scale, y, pointerEvents: 'none' as const }

  return (
    <motion.p className={s.display} aria-hidden="true" style={hidden ? { ...style, opacity: 0 } : style}>
      VOICES
    </motion.p>
  )
}

/* ── Words that assemble ─────────────────────────────────────
   Each token flies in from where a piece of the chorus was, unblurring
   and settling to its place in the line. Reversing the scroll runs the
   same interpolation backwards, so the statement comes apart into the
   directions its pieces arrived from. */
function Assembly({
  p,
  tokens,
  inRange,
  outRange,
  converge,
  reduced,
  hidden,
  className,
}: {
  p: MotionValue<number>
  tokens: Token[]
  inRange: readonly [number, number]
  outRange: readonly [number, number]
  converge: readonly [number, number]
  reduced: boolean
  hidden: boolean
  className: string
}) {
  const opacity = useTransform(
    p,
    [inRange[0], inRange[1], outRange[0], outRange[1]],
    [0, 1, 1, 0],
  )
  return (
    <motion.p className={className} style={{ opacity: hidden ? 0 : opacity }} aria-hidden="true">
      {byLine(tokens).map((line, li) => (
        <span key={li} className={s.assemblyLine}>
          {line.map((t) => (
            <AssemblyToken key={t.text + li} p={p} token={t} converge={converge} reduced={reduced} />
          ))}
        </span>
      ))}
    </motion.p>
  )
}

function AssemblyToken({
  p,
  token,
  converge,
  reduced,
}: {
  p: MotionValue<number>
  token: Token
  converge: readonly [number, number]
  reduced: boolean
}) {
  const span: [number, number] = [converge[0], converge[1]]
  const x = useTransform(p, span, [`${token.fromX}vw`, '0vw'])
  const y = useTransform(p, span, [`${token.fromY}vh`, '0vh'])
  const scale = useTransform(p, span, [token.fromScale, 1])
  const blurPx = useTransform(p, span, [7, 0])
  const filter = useMotionTemplate`blur(${blurPx}px)`
  const o = useTransform(p, [span[0], span[0] + (span[1] - span[0]) * 0.45], [0.25, 1])

  if (reduced) return <span className={s.token}>{token.text}</span>
  return (
    <motion.span className={s.token} style={{ x, y, scale, filter, opacity: o }}>
      {token.text}
    </motion.span>
  )
}

/* ── The author field ────────────────────────────────────────
   Twenty names, calm and evenly laid out, each one a real button.
   Pointing at one brings it forward and eases its neighbours away — a
   small, distance-weighted shove, computed here rather than animated
   per element, so a hover costs one render. */
function Field({
  p,
  spot,
  setSpot,
  open,
  onOpen,
}: {
  p: MotionValue<number>
  spot: string | null
  setSpot: (v: string | null) => void
  open: string | null
  onOpen: (v: string) => void
}) {
  const opacity = useTransform(p, [FIELD_IN[0], FIELD_IN[1], FIELD_OUT[0], FIELD_OUT[1]], [0, 1, 1, 0])
  const isFieldWindow = useCallback(
    (value: number) => value >= FIELD_IN[1] && value <= FIELD_OUT[0],
    [],
  )
  const [interactive, setInteractive] = useState(() => isFieldWindow(p.get()))
  useMotionValueEvent(p, 'change', (value) => {
    const next = isFieldWindow(value)
    setInteractive((current) => (current === next ? current : next))
  })
  const hovered = spot ? FIELD.find((f) => f.id === spot) : null
  const unavailable = !interactive || open !== null

  return (
    <motion.div
      className={s.field}
      style={{ opacity }}
      data-open={open !== null || undefined}
      data-interactive={!unavailable || undefined}
      /* While a testimonial is open the field is inert and its names
         drift to the edges as traces — see `.fieldSeat[data-traced]`. */
      inert={unavailable || undefined}
      aria-hidden={unavailable || undefined}
    >
      <p className={s.fieldInstruction}>Choose a voice</p>
      <div className={s.fieldAtmosphere} aria-hidden="true">
        <span className={`${s.fieldOrbit} ${s.fieldOrbitA}`} />
        <span className={`${s.fieldOrbit} ${s.fieldOrbitB}`} />
        <span className={s.fieldPulse} />
        <span className={s.fieldScan} />
      </div>
      {FIELD.map((seat, index) => {
        /* Offsets are in viewport units, not percentages: a percentage
           translate resolves against the ELEMENT's own box, so a name
           two hundred pixels wide would be nudged by a fraction of
           itself rather than across the field. */
        let dx = 0
        let dy = 0
        if (hovered && hovered.id !== seat.id) {
          const ax = seat.x - hovered.x
          const ay = (seat.y - hovered.y) * 0.6
          const d = Math.hypot(ax, ay) || 1
          const push = Math.max(0, 1 - d / 26) * 3.2
          dx = (ax / d) * push
          dy = (ay / d) * push * 0.6
        }
        const isSpot = spot === seat.id
        const isSelected = open === seat.id
        return (
          <button
            key={seat.id}
            type="button"
            className={s.fieldSeat}
            data-voice-id={seat.id}
            data-spot={isSpot || undefined}
            data-selected={isSelected || undefined}
            style={{
              left: `${seat.x}%`,
              top: `${seat.y}%`,
              ['--dx' as string]: `${dx}vw`,
              ['--dy' as string]: `${dy}vh`,
              ['--sc' as string]: String(seat.scale * (isSpot ? 1.18 : 1)),
              ['--tint' as string]: seat.color,
              ['--trace-delay' as string]: `${index * 0.42}s`,
            }}
            onPointerEnter={() => setSpot(seat.id)}
            onPointerLeave={() => setSpot(null)}
            onClick={() => onOpen(seat.id)}
          >
            <span className={s.seatName}>
              {seat.name}
            </span>
            {seat.role && <span className={s.seatRole}>{seat.role}</span>}
            <span className={s.seatPhrase} aria-hidden="true">
              {CHORUS_PHRASE[seat.id]}
            </span>
            <span className={s.srOnly}>
              Read the full testimonial.
            </span>
          </button>
        )
      })}
    </motion.div>
  )
}

/* ── One testimonial ─────────────────────────────────────────
   Every voice now belongs to the same planetary composition. The body,
   its light and its colour change; the editorial structure stays calm
   and consistent across all twenty-one pieces. */
function Spotlight({
  voice,
  reduced,
  onPrev,
  onNext,
  onExplore,
}: {
  voice: (typeof VOICES)[number]
  reduced: boolean
  onPrev: () => void
  onNext: () => void
  onExplore: () => void
}) {
  const theme = primaryTheme(voice.id)
  const swipe = useRef<{ x: number; y: number } | null>(null)
  const articleRef = useRef<HTMLElement>(null)
  const body = VOICE_BODY[voice.id] ?? 'sun'

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      articleRef.current?.focus({ preventScroll: true })
    })
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <motion.article
      ref={articleRef}
      tabIndex={-1}
      className={s.spot}
      data-effect="celestial"
      style={{ ['--accent' as string]: theme.color }}
      aria-labelledby={`voice-${voice.id}-name`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0.12 : 0.42, ease: [0.22, 1, 0.36, 1] }}
      onPointerDown={(e) => {
        swipe.current = { x: e.clientX, y: e.clientY }
      }}
      onPointerUp={(e) => {
        const from = swipe.current
        swipe.current = null
        if (!from) return
        const dx = e.clientX - from.x
        if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(e.clientY - from.y) * 1.4) return
        if (!window.getSelection()?.isCollapsed) return
        if (dx < 0) onNext()
        else onPrev()
      }}
    >
      <CelestialTestimonial
        voice={voice}
        reduced={reduced}
        body={body}
        onExplore={onExplore}
      />
    </motion.article>
  )
}

function Identity({ voice }: { voice: (typeof VOICES)[number] }) {
  return (
    <header className={s.detailIdentity}>
      <h3 id={`voice-${voice.id}-name`} className={s.spotName}>{voice.name}</h3>
      {voice.role && <p className={s.spotRole}>{voice.role}</p>}
      {voice.unit && <p className={s.spotUnit}>{voice.unit}</p>}
    </header>
  )
}

function CelestialTestimonial({
  voice,
  reduced,
  body,
  onExplore,
}: {
  voice: (typeof VOICES)[number]
  reduced: boolean
  body: keyof typeof CELESTIAL_ASSETS
  onExplore: () => void
}) {
  const length = voice.quote.length
  const density = length > 850 ? 'xlong' : length > 600 ? 'long' : length > 330 ? 'medium' : 'short'

  return (
    <div className={s.solarStage} data-body={body} data-density={density}>
      <button
        type="button"
        className={s.voiceClose}
        aria-label="Close testimonial and return to all voices"
        onPointerDown={(event) => event.stopPropagation()}
        onPointerUp={(event) => event.stopPropagation()}
        onClick={onExplore}
      >
        <X size={20} strokeWidth={1.8} aria-hidden="true" />
      </button>
      <div className={s.solarBeam} aria-hidden="true" />
      <div className={s.solarSun} aria-hidden="true">
        <img
          src={`${import.meta.env.BASE_URL}visuals/${CELESTIAL_ASSETS[body]}`}
          alt=""
          decoding="async"
        />
      </div>
      <div className={s.solarCopy} data-solar-copy>
        <button type="button" className={s.solarKicker} data-voice-return onClick={onExplore}>
          Voices
          <span className={s.srOnly}> — back to all voices</span>
        </button>
        <div className={s.solarReveal}>
          <blockquote className={s.solarQuote}>
            {voice.paragraphs.map((paragraph, index) => (
              <p key={index}><EmphasizedText text={paragraph} phrases={voice.emphasis} className={s.solarEmphasis} /></p>
            ))}
          </blockquote>
        </div>
        <Identity voice={voice} />
      </div>
      {reduced && <span className={s.srOnly}>Celestial reveal animation reduced.</span>}
    </div>
  )
}

/* ── Narrow ──────────────────────────────────────────────────
   Not the desktop stage made small. A vertical sequence: the display
   word, then the twenty-one names and their fragments arriving as the page
   scrolls, then one complete testimonial at a time, swipeable. */
function NarrowChorus({
  reduced,
  sectionRef,
}: {
  reduced: boolean
  sectionRef: React.RefObject<HTMLElement | null>
}) {
  const [index, setIndex] = useState<number | null>(null)
  const voice = index === null ? null : VOICES[index]
  const openerRef = useRef<HTMLButtonElement | null>(null)

  const pick = useCallback((i: number) => {
    const n = VOICES.length
    setIndex(((i % n) + n) % n)
  }, [])

  const closeVoice = useCallback(() => {
    setIndex(null)
    requestAnimationFrame(() => openerRef.current?.focus({ preventScroll: true }))
  }, [])

  useEffect(() => {
    if (index === null) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeVoice()
      else if (event.key === 'ArrowLeft') pick(index - 1)
      else if (event.key === 'ArrowRight') pick(index + 1)
      else return
      event.preventDefault()
    }

    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [closeVoice, index, pick])

  return (
    <section ref={sectionRef} className={`${s.container} ${s.narrow}`} aria-label="Voices from the journey">
      <div className={s.ground} aria-hidden="true" />
      <div className={s.narrowInner}>
        <p className={s.narrowDisplay} aria-hidden="true">
          VOICES
        </p>

        <ol className={s.narrowList}>
          {VOICES.map((v, i) => (
            <li key={v.id}>
              <motion.button
                type="button"
                className={s.narrowSeat}
                aria-current={index === i ? 'true' : undefined}
                style={{
                  ['--tint' as string]: primaryTheme(v.id).color,
                  ['--trace-delay' as string]: `${i * 0.42}s`,
                }}
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-12% 0px -12% 0px' }}
                transition={{ duration: reduced ? 0.2 : 0.55, ease: [0.22, 1, 0.36, 1] }}
                onClick={(event) => {
                  openerRef.current = event.currentTarget
                  pick(i)
                }}
              >
                <span className={s.narrowName}>{v.name}</span>
                {v.role && <span className={s.narrowRole}>{v.role}</span>}
                <span className={s.narrowPhrase}>{CHORUS_PHRASE[v.id]}</span>
              </motion.button>
            </li>
          ))}
        </ol>

        <p className={s.narrowStatement} aria-hidden="true">
          <span>21 VOICES.</span>
          <span>ONE SHARED VIEW.</span>
        </p>

        <p className={s.narrowClosing} aria-hidden="true">
          <span>TEN YEARS OF</span>
          <span>PEOPLE, STRUCTURE</span>
          <span>AND DELIVERY.</span>
        </p>
      </div>
      {createPortal(
        <div className={s.narrowVoicePortal} data-open={voice ? true : undefined}>
          <AnimatePresence mode="wait">
            {voice && (
              <Spotlight
                key={voice.id}
                voice={voice}
                reduced={reduced}
                onPrev={() => pick(index! - 1)}
                onNext={() => pick(index! + 1)}
                onExplore={closeVoice}
              />
            )}
          </AnimatePresence>
        </div>,
        document.body,
      )}
    </section>
  )
}

function useWideViewport(): boolean {
  const [wide, setWide] = useState(() => window.matchMedia('(min-width: 900px)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 900px)')
    const onChange = () => setWide(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return wide
}
