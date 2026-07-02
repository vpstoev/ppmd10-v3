/* ============================================================
   AppPrototype — cinematic chapter redesign (v9, correction pass)

   A SEPARATE, visually dramatic prototype of the PPMD 10-year
   anniversary homepage. It does NOT replace the production App.
   It reads from the existing `src/data/*` so content meaning is
   preserved; layout, atmosphere, motion and interactions are new.
   Supplemental "activities / facts" copy is local placeholder data
   so no data files are touched.

   The page is built as CHAPTERS, not stacked cards:
   · Hero — pinned 200vh opening scene with three depth layers;
     the 10 YEARS lockup + department band punch in then recede
     while the first chapter panel slides up OVER the scene.
   · Foundation — compact active-feature pillar stage with tabs.
   · Teams & People — overview strip + team cards → dedicated
     team chapter (identity → unified people composition with
     integrated leadership → capability tiles).
   · In Motion — ONE shared hot-topics carousel for all teams.
   · Journey — vertical scroll timeline with a self-drawing spine
     and a sticky watermark year.
   · Voices — editorial quotes + closing mark + credit.

   All motion is transform/opacity only and reduced-motion safe.
   ============================================================ */

import { type ReactNode, useEffect, useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from 'motion/react'
import styles from './AppPrototype.module.css'

import { department } from './data/department'
import { departmentPillars } from './data/pillars'
import { teams } from './data/teams'
import { people, head } from './data/people'
import { timeline } from './data/timeline'
import { messages } from './data/messages'
import type { Person, Team, TeamId } from './data/types'

/* ── Motion helpers (transform/opacity only) ───────────────── */

const ease = [0.22, 1, 0.36, 1] as const

/** Text that rises out of an overflow-clipped mask — the chapter
 *  header signature move. Falls back to a plain fade when reduced. */
function MaskRise({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const reduce = useReducedMotion()
  return (
    <span className={`${styles.maskRise} ${className ?? ''}`}>
      <motion.span
        className={styles.maskRiseInner}
        initial={reduce ? { opacity: 0 } : { y: '110%' }}
        whileInView={reduce ? { opacity: 1 } : { y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.85, ease, delay }}
      >
        {children}
      </motion.span>
    </span>
  )
}

/** Generic block reveal on scroll. */
function Rise({
  children,
  className,
  delay = 0,
  y = 36,
}: {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.75, ease, delay }}
    >
      {children}
    </motion.div>
  )
}

/** A chapter that recedes (fades / shrinks / drifts up) while the
 *  next chapter scrolls in over its tail. Screen-to-screen handoff. */
function Recede({
  children,
  className,
  id,
}: {
  children: ReactNode
  className?: string
  id?: string
}) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['end end', 'end start'],
  })
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.2])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.955])
  const yOut = useTransform(scrollYProgress, [0, 1], [0, -64])
  return (
    <motion.section
      ref={ref}
      id={id}
      className={className}
      style={reduce ? undefined : { opacity, scale, y: yOut }}
    >
      {children}
    </motion.section>
  )
}

/** Shared editorial chapter header: giant index + masked title. */
function ChapterHead({
  index,
  label,
  title,
  lede,
}: {
  index: string
  label: string
  title: ReactNode
  lede: ReactNode
}) {
  const reduce = useReducedMotion()
  return (
    <header className={styles.secHead}>
      <div className={styles.secHeadIndexCol} aria-hidden="true">
        <MaskRise>
          <span className={styles.secIndexBig}>{index}</span>
        </MaskRise>
      </div>
      <div className={styles.secHeadMain}>
        <span className={styles.eyebrow}>
          {index} — {label}
        </span>
        <h2 className={styles.secTitle}>
          <MaskRise delay={0.08}>{title}</MaskRise>
        </h2>
        <motion.p
          className={styles.secLede}
          initial={{ opacity: 0, y: reduce ? 0 : 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, ease, delay: 0.2 }}
        >
          {lede}
        </motion.p>
      </div>
    </header>
  )
}

/* ── Small shared bits ─────────────────────────────────────── */

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function Avatar({ person, className }: { person: Person; className: string }) {
  return (
    <span className={className} aria-hidden="true">
      {person.photo ? <img src={person.photo} alt="" /> : initials(person.name)}
    </span>
  )
}

/** Leadership = every Team Lead, plus PM's two Program Managers. */
function isLeader(p: Person) {
  if (p.roleGroup === 'teamLead') return true
  if (p.team === 'pm' && p.roleGroup === 'programManager') return true
  return false
}

/* ── Prototype accent palette (visual identity only) ────────────
   Overrides the data-file accents WITHOUT touching src/data:
   · PM keeps the signature red,
   · Process & Procedures gets a coral-rose nuance,
   · BPT & Testing gets a steel-blue accent,
   · the Department Head has a unique gold identity. */

const teamAccent: Record<TeamId, string> = {
  pm: '#ff3340',
  pp: '#f2788f',
  bpt: '#5b9ee0',
}
const headAccent = '#e3a455'

/* ── Local placeholder copy (NOT from data files) ──────────────
   Department-wide hot topics for the shared carousel and
   capability facts per team. Swap freely — the list length of
   `hotTopics` can vary. */

type HotTopic = { tag: string; team: string; title: string; detail: string }

const hotTopics: HotTopic[] = [
  {
    tag: 'In progress',
    team: 'Project Management',
    title: 'Company-wide delivery portfolio',
    detail: 'A portfolio of cross-functional initiatives coordinated from kickoff to launch.',
  },
  {
    tag: 'Rollout',
    team: 'Process & Procedures',
    title: 'Process documentation refresh',
    detail: 'Core company processes brought into one clear, trusted, shared library.',
  },
  {
    tag: 'Scaling',
    team: 'BPT & Testing',
    title: 'Test automation suite',
    detail: 'Automated coverage expanding before every major release.',
  },
  {
    tag: 'Kicking off',
    team: 'Project Management',
    title: 'Portfolio reporting upgrade',
    detail: 'One live view of every initiative — status, risk and value in a single place.',
  },
  {
    tag: 'Ongoing',
    team: 'Process & Procedures',
    title: 'Knowledge management platform',
    detail: 'The right process knowledge findable by anyone, in seconds.',
  },
  {
    tag: 'In progress',
    team: 'BPT & Testing',
    title: 'Business process transformation',
    detail: 'Core operational flows reshaped and simplified across the company.',
  },
]

const teamFacts: Record<TeamId, { value: string; label: string }[]> = {
  pm: [
    { value: '120+', label: 'Projects delivered' },
    { value: '14', label: 'Active initiatives' },
    { value: 'PMP · PMI', label: 'Certifications' },
    { value: '92%', label: 'On-time delivery' },
  ],
  pp: [
    { value: '40+', label: 'Processes owned' },
    { value: '200+', label: 'Procedures maintained' },
    { value: 'ISO', label: 'Aligned standards' },
    { value: '25+', label: 'Improvement cycles / yr' },
  ],
  bpt: [
    { value: '1000s', label: 'Tests executed' },
    { value: '65%', label: 'Automation coverage' },
    { value: '12', label: 'Transformation topics' },
    { value: '100%', label: 'Release gates held' },
  ],
}

/* ── Ambient atmosphere (fixed, static — no animation loops) ── */
function Atmosphere() {
  return (
    <>
      <div className={styles.atmosphere} aria-hidden="true" />
      <div className={styles.grain} aria-hidden="true" />
    </>
  )
}

/* ── 1. Hero — anniversary opening scene ───────────────────── */
function Hero() {
  const reduce = useReducedMotion()
  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end end'],
  })

  // Three depth layers, three scroll speeds:
  // · background — outlined wordmark drifts and grows slowest,
  // · midground  — the 10 YEARS lockup + department band punch
  //   toward the viewer first (scale up), then recede upward,
  // · foreground — the headline strip sinks fastest,
  // while the chapter panel sweeps over the whole scene.
  const backScale = useTransform(scrollYProgress, [0, 1], [1, 1.22])
  const backY = useTransform(scrollYProgress, [0, 1], [0, -70])
  const backOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.1])
  // The lockup STARTS slightly compact, grows past full size on the
  // first scroll (while the supporting line reveals), then recedes.
  const midScale = useTransform(scrollYProgress, [0, 0.3, 1], [0.92, 1.06, 0.66])
  const midY = useTransform(scrollYProgress, [0, 0.3, 1], [0, -6, -230])
  const midOpacity = useTransform(scrollYProgress, [0, 0.55, 0.92], [1, 1, 0])
  const revealOpacity = useTransform(scrollYProgress, [0.06, 0.24], [0, 1])
  const revealY = useTransform(scrollYProgress, [0.06, 0.24], [36, 0])
  const frontY = useTransform(scrollYProgress, [0, 0.55], [0, 170])
  const frontOpacity = useTransform(scrollYProgress, [0.06, 0.45], [1, 0])
  const barsOpacity = useTransform(scrollYProgress, [0, 0.22], [1, 0])

  const enter: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 34 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.85, ease } },
  }
  const numberIn: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 60, scale: reduce ? 1 : 0.9 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 1.1, ease } },
  }
  const container: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: reduce ? 0 : 0.13, delayChildren: 0.1 } },
  }

  return (
    <section ref={heroRef} className={styles.hero} aria-label="10 years of PPMD">
      <div className={styles.heroSticky}>
        {/* Background layer: architectural grid + edge markers +
            giant outlined wordmark */}
        <div className={styles.heroArch} aria-hidden="true" />
        <span className={styles.heroEdge} aria-hidden="true">
          Est. 2015
        </span>
        <span className={`${styles.heroEdge} ${styles.heroEdgeRight}`} aria-hidden="true">
          Anniversary · 2025
        </span>
        <div className={styles.heroGhostWrap} aria-hidden="true">
          <motion.span
            className={styles.heroGhost}
            style={reduce ? undefined : { scale: backScale, y: backY, opacity: backOpacity }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.4, ease, delay: 0.15 }}
          >
            {department.short}
          </motion.span>
        </div>

        <motion.div
          className={styles.heroFrame}
          variants={container}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className={styles.heroTop}
            variants={enter}
            style={reduce ? undefined : { opacity: barsOpacity }}
          >
            <span>
              <strong className={styles.heroTopMark}>{department.company} Bulgaria</strong> ·{' '}
              {department.name}
            </span>
            <span>Anniversary Edition · 2015 — 2025</span>
          </motion.div>

          {/* Midground layer: the anniversary statement */}
          <motion.div
            className={styles.heroMid}
            style={reduce ? undefined : { scale: midScale, y: midY, opacity: midOpacity }}
          >
            <span className={styles.heroGlowBig} aria-hidden="true" />
            <motion.div className={styles.heroLockup} variants={numberIn}>
              <span className={styles.heroNumber} aria-hidden="true">
                10
              </span>
              <span className={styles.heroYears}>
                <span className={styles.heroYearsWord}>Years</span>
                <span className={styles.heroYearsRange}>2015 — 2025</span>
              </span>
            </motion.div>

            <motion.div className={styles.heroDeptBand} variants={enter}>
              <span className={styles.heroDeptShort}>{department.short}</span>
              <span className={styles.heroDeptName}>{department.name}</span>
              <span className={styles.heroDeptCo}>{department.company} Bulgaria</span>
            </motion.div>

            {/* Supporting line — revealed by the first scroll */}
            <motion.p
              className={styles.heroReveal}
              style={reduce ? undefined : { opacity: revealOpacity, y: revealY }}
            >
              For a whole decade we have helped {department.company} stay a market leader —
              growing our people, adapting to every change, and keeping the customer at the
              centre of everything we deliver.{' '}
              <em>In the biggest challenges, we are the department the company counts on.</em>
            </motion.p>
          </motion.div>

          {/* Foreground layer: headline strip + scroll cue */}
          <motion.div
            className={styles.heroBottom}
            variants={enter}
            style={reduce ? undefined : { y: frontY, opacity: frontOpacity }}
          >
            <div className={styles.heroCopy}>
              <h1 className={styles.heroHeadline}>
                A decade of delivery, structure and quality —{' '}
                <em>and the people behind all of it.</em>
              </h1>
              <p className={styles.heroIntro}>{department.intro}</p>
            </div>
            <div className={styles.heroCue}>
              <span className={styles.heroScroll}>
                <span className={styles.heroScrollLine} aria-hidden="true" />
                Scroll to begin
              </span>
              <span className={styles.heroNext}>Next — 01 Foundation</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

/* ── 2. Foundation — compact active-feature pillar stage ───── */
function Foundation() {
  const reduce = useReducedMotion()
  const [active, setActive] = useState(0)
  const [dir, setDir] = useState(1)
  const p = departmentPillars[active]

  const select = (i: number) => {
    if (i === active) return
    setDir(i > active ? 1 : -1)
    setActive(i)
  }

  // Direction-aware slide: content enters from the side you move toward.
  const slideVariants: Variants = {
    enter: (d: number) => ({ opacity: 0, x: reduce ? 0 : 84 * d, scale: reduce ? 1 : 0.97 }),
    center: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.45, ease } },
    exit: (d: number) => ({
      opacity: 0,
      x: reduce ? 0 : -64 * d,
      scale: reduce ? 1 : 0.98,
      transition: { duration: 0.3, ease },
    }),
  }

  return (
    <Recede id="foundation" className={`${styles.section} ${styles.foundation}`}>
      <ChapterHead
        index="01"
        label="Foundation"
        title="Four disciplines, one foundation."
        lede={
          <>
            Not four silos — a single foundation. Each discipline carries part of how{' '}
            {department.short} turns ambiguity into delivery for {department.company}.
          </>
        }
      />

      <Rise className={styles.pillarStage}>
        <div className={styles.pillarTabs}>
          {departmentPillars.map((pl, i) => (
            <button
              key={pl.title}
              type="button"
              className={`${styles.pillarTab} ${i === active ? styles.pillarTabActive : ''}`}
              onMouseEnter={() => select(i)}
              onFocus={() => select(i)}
              onClick={() => select(i)}
              aria-pressed={i === active}
            >
              <span className={styles.pillarTabIndex}>{String(i + 1).padStart(2, '0')}</span>
              <span className={styles.pillarTabLabel}>{pl.short}</span>
              <span className={styles.pillarTabBar} aria-hidden="true" />
            </button>
          ))}
        </div>

        <div className={styles.pillarActive}>
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={active}
              className={styles.pillarActiveInner}
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <span className={styles.pillarBigIndex} aria-hidden="true">
                {String(active + 1).padStart(2, '0')}
              </span>
              <div className={styles.pillarActiveBody}>
                <span className={styles.pillarKicker}>
                  {p.short}
                  <span className={styles.pillarCount}>
                    {String(active + 1).padStart(2, '0')} / 04
                  </span>
                </span>
                <h3 className={styles.pillarTitle}>{p.title}</h3>
                <p className={styles.pillarDesc}>{p.description}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </Rise>
    </Recede>
  )
}

/* ── 3. Teams & People ─────────────────────────────────────── */

type ModalState = { person: Person; accent: string; label: string }

function PersonCard({
  person,
  team,
  lead,
  onOpen,
  variants,
}: {
  person: Person
  team: Team
  lead?: boolean
  onOpen: () => void
  variants: Variants
}) {
  const reduce = useReducedMotion()
  return (
    <motion.button
      type="button"
      className={`${styles.personCard} ${lead ? styles.personCardLead : ''}`}
      style={{ ['--accent' as string]: teamAccent[team.id] }}
      variants={variants}
      onClick={onOpen}
      whileHover={reduce ? undefined : { y: -5 }}
    >
      {lead && <span className={styles.personLeadTag}>{person.role}</span>}
      <div className={styles.personTop}>
        <Avatar person={person} className={lead ? styles.personAvatarLead : styles.personAvatar} />
        <div className={styles.personIdent}>
          <h4 className={styles.personName}>{person.name}</h4>
          <p className={styles.personRole}>{person.role}</p>
        </div>
      </div>
      <p className={styles.personDetail}>{person.superpower}</p>
      <div className={styles.personFoot}>
        <span className={styles.personTag}>{team.short}</span>
        <span className={styles.personOpen} aria-hidden="true">
          View →
        </span>
      </div>
    </motion.button>
  )
}

function PersonModal({ state, onClose }: { state: ModalState; onClose: () => void }) {
  const reduce = useReducedMotion()
  const closeRef = useRef<HTMLButtonElement>(null)
  const { person, accent, label } = state

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  return (
    <motion.div
      className={styles.modalOverlay}
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <motion.div
        className={styles.modalCard}
        style={{ ['--accent' as string]: accent }}
        role="dialog"
        aria-modal="true"
        aria-label={`${person.name} — ${person.role}`}
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: reduce ? 1 : 0.93, y: reduce ? 0 : 28 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: reduce ? 1 : 0.97, y: reduce ? 0 : 12 }}
        transition={{ duration: 0.32, ease }}
      >
        <span className={styles.modalBand} aria-hidden="true" />
        <button ref={closeRef} className={styles.modalClose} onClick={onClose} aria-label="Close">
          ✕
        </button>

        <div className={styles.modalHead}>
          <Avatar person={person} className={styles.modalAvatar} />
          <div>
            <span className={styles.modalTeamTag}>{label}</span>
            <h3 className={styles.modalName}>{person.name}</h3>
            <p className={styles.modalRole}>{person.role}</p>
          </div>
        </div>

        <div className={styles.modalDivider} />

        <div className={styles.modalRow}>
          <span className={styles.modalLabel}>Superpower</span>
          <p className={styles.modalValue}>{person.superpower}</p>
        </div>
        <div className={styles.modalRow}>
          <span className={styles.modalLabel}>Good to know</span>
          <p className={styles.modalValue}>{person.funFact}</p>
        </div>
        <div className={styles.modalRow}>
          <span className={styles.modalLabel}>Area &amp; impact</span>
          <p className={styles.modalValue}>{person.contribution}</p>
        </div>
        <div className={styles.modalRow}>
          <span className={styles.modalLabel}>In their words</span>
          <p className={styles.modalQuote}>{person.quote}</p>
        </div>
      </motion.div>
    </motion.div>
  )
}

/** Premium hot-topics carousel — one featured item at a time.
 *  Shared across the department; `items` can be any length. */
function HotTopicsCarousel({ items }: { items: HotTopic[] }) {
  const reduce = useReducedMotion()
  const [i, setI] = useState(0)
  const [dir, setDir] = useState(1)
  const a = items[i]

  const go = (d: number) => {
    setDir(d)
    setI((prev) => (prev + d + items.length) % items.length)
  }
  const jump = (to: number) => {
    setDir(to > i ? 1 : -1)
    setI(to)
  }

  const slide: Variants = {
    enter: (d: number) => ({ opacity: 0, x: reduce ? 0 : d > 0 ? 56 : -56 }),
    center: { opacity: 1, x: 0, transition: { duration: 0.42, ease } },
    exit: (d: number) => ({
      opacity: 0,
      x: reduce ? 0 : d > 0 ? -56 : 56,
      transition: { duration: 0.3, ease },
    }),
  }

  return (
    <div className={styles.carousel}>
      <div className={styles.carouselHead}>
        <span className={styles.carouselKicker}>Hot topics · all teams</span>
        <div className={styles.carouselNav}>
          <span className={styles.carouselCounter}>
            {String(i + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
          </span>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={() => go(-1)}
            aria-label="Previous topic"
          >
            ←
          </button>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={() => go(1)}
            aria-label="Next topic"
          >
            →
          </button>
        </div>
      </div>

      <div className={styles.carouselStage}>
        <span className={styles.carouselGhost} aria-hidden="true">
          {String(i + 1).padStart(2, '0')}
        </span>
        <AnimatePresence mode="wait" custom={dir}>
          <motion.article
            key={i}
            className={styles.carouselCard}
            custom={dir}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
          >
            <div className={styles.carouselMeta}>
              <span className={styles.carouselTag}>{a.tag}</span>
              <span className={styles.carouselTeam}>{a.team}</span>
            </div>
            <h4 className={styles.carouselTitle}>{a.title}</h4>
            <p className={styles.carouselDetail}>{a.detail}</p>
          </motion.article>
        </AnimatePresence>
      </div>

      <div className={styles.carouselDots}>
        {items.map((_, d) => (
          <button
            key={d}
            type="button"
            aria-label={`Topic ${d + 1}`}
            className={`${styles.carouselDot} ${d === i ? styles.carouselDotActive : ''}`}
            onClick={() => jump(d)}
          />
        ))}
      </div>
    </div>
  )
}

function TeamChapter({
  team,
  onBack,
  onPerson,
}: {
  team: Team
  onBack: () => void
  onPerson: (s: ModalState) => void
}) {
  const reduce = useReducedMotion()
  const roster = people.filter((pp) => pp.team === team.id)
  const leaders = roster.filter(isLeader)
  const members = roster.filter((pp) => !isLeader(pp))

  const tiles = [
    ...teamFacts[team.id].map((f) => ({ ...f, filled: false })),
    { value: '10 years', label: 'With the department', filled: true },
  ]

  const listVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: reduce ? 0 : 0.05, delayChildren: 0.05 } },
  }
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 20, scale: reduce ? 1 : 0.975 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease } },
  }

  const openPerson = (person: Person) =>
    onPerson({ person, accent: teamAccent[team.id], label: `Part of ${team.name}` })

  return (
    <motion.div
      className={styles.teamChapter}
      style={{ ['--accent' as string]: teamAccent[team.id] }}
      variants={listVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.button
        type="button"
        className={styles.ctaBtn}
        onClick={onBack}
        variants={cardVariants}
      >
        ← All teams
      </motion.button>

      {/* A. Team identity — name, intro, people count, focus areas */}
      <motion.header className={styles.tHead} variants={cardVariants}>
        <span className={styles.tGhost} aria-hidden="true">
          {team.codename.split('.')[0]}
        </span>
        <span className={styles.tCode}>{team.codename}</span>
        <h3 className={styles.tName}>{team.name}</h3>
        <p className={styles.tMission}>{team.mission}</p>
        <p className={styles.tStory}>{team.story}</p>
        <div className={styles.tMeta}>
          <span className={styles.tCount}>
            <strong>{roster.length}</strong> people
          </span>
          <div className={styles.tFocus}>
            {team.contributions.slice(0, 4).map((c) => (
              <span key={c} className={styles.teamChip}>
                {c}
              </span>
            ))}
          </div>
        </div>
      </motion.header>

      {/* B. The team — ONE composition: leadership highlighted but
          integrated with everyone else, nothing in between */}
      <div className={styles.rosterGroup}>
        <motion.span className={styles.rosterLabel} variants={cardVariants}>
          The team <span className={styles.rosterCount}>{roster.length}</span>
        </motion.span>
        <div className={styles.teamComposition}>
          {leaders.map((person) => (
            <PersonCard
              key={person.id}
              person={person}
              team={team}
              lead
              variants={cardVariants}
              onOpen={() => openPerson(person)}
            />
          ))}
          {members.map((person) => (
            <PersonCard
              key={person.id}
              person={person}
              team={team}
              variants={cardVariants}
              onOpen={() => openPerson(person)}
            />
          ))}
        </div>
      </div>

      {/* C. The team in numbers — capability / certification tiles */}
      <div className={styles.rosterGroup}>
        <motion.span className={styles.rosterLabel} variants={cardVariants}>
          The team in numbers
        </motion.span>
        <motion.div className={styles.statGrid} variants={cardVariants}>
          {tiles.map((s) => (
            <div
              key={s.label}
              className={`${styles.statTile} ${s.filled ? styles.statTileFilled : ''}`}
            >
              <span className={styles.statValue}>{s.value}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Second exit — keeps the other teams one click away */}
      <motion.button
        type="button"
        className={`${styles.ctaBtn} ${styles.backBottom}`}
        onClick={onBack}
        variants={cardVariants}
      >
        ← Back to all teams
      </motion.button>
    </motion.div>
  )
}

function TeamsPeople() {
  const reduce = useReducedMotion()
  const [selected, setSelected] = useState<TeamId | null>(null)
  const [modal, setModal] = useState<ModalState | null>(null)
  const anchorRef = useRef<HTMLDivElement>(null)

  // Scroll-driven emphasis: as the team-card row travels up the
  // viewport, the spotlight moves 1st → 2nd → 3rd card.
  const gridRef = useRef<HTMLDivElement>(null)
  const [emphasis, setEmphasis] = useState(0)
  const { scrollYProgress: gridProgress } = useScroll({
    target: gridRef,
    offset: ['start 0.9', 'end 0.2'],
  })
  useMotionValueEvent(gridProgress, 'change', (v) => {
    setEmphasis(Math.min(2, Math.max(0, Math.floor(v * 3))))
  })

  const selectedTeam = teams.find((t) => t.id === selected) ?? null

  const goTo = (id: TeamId | null) => {
    setSelected(id)
    anchorRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  }

  return (
    <section id="teams" className={`${styles.section} ${styles.people}`}>
      <div ref={anchorRef} className={styles.chapterAnchor} aria-hidden="true" />
      <ChapterHead
        index="02"
        label="Teams & People"
        title="The teams behind the work."
        lede={
          <>
            One Head of Department and three teams. Open a team to enter its chapter — identity,
            people and the numbers behind the work.
          </>
        }
      />

      <AnimatePresence mode="wait">
        {selectedTeam === null ? (
          <motion.div
            key="overview"
            className={styles.overview}
            initial={{ opacity: 0, y: reduce ? 0 : 24 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease } }}
            exit={{
              opacity: 0,
              y: reduce ? 0 : -28,
              scale: reduce ? 1 : 0.98,
              transition: { duration: 0.3 },
            }}
          >
            {/* Head-of-Department: own gold identity, not team red */}
            <motion.div
              className={styles.headStrip}
              style={{ ['--accent' as string]: headAccent }}
              initial={{ opacity: 0, y: reduce ? 0 : 30, scale: reduce ? 1 : 0.965 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.8, ease }}
            >
              <span className={styles.headGhost} aria-hidden="true">
                {initials(head.name)}
              </span>
              <span className={styles.headAvatar} aria-hidden="true">
                {head.photo ? <img src={head.photo} alt="" /> : initials(head.name)}
              </span>
              <div className={styles.headBody}>
                <span className={styles.headRole}>{head.role}</span>
                <h3 className={styles.headName}>{head.name}</h3>
                <p className={styles.headLine}>{head.superpower}</p>
                <p className={styles.headQuote}>“{head.quote}”</p>
              </div>
              <button
                type="button"
                className={styles.ctaBtn}
                onClick={() =>
                  setModal({
                    person: head,
                    accent: headAccent,
                    label: `Head of Department · ${department.short}`,
                  })
                }
              >
                View details →
              </button>
            </motion.div>

            {/* Team overview cards */}
            <div ref={gridRef} className={styles.teamGrid}>
              {teams.map((team, ti) => {
                const count = people.filter((p) => p.team === team.id).length
                return (
                  <Rise key={team.id} delay={ti * 0.09}>
                    <motion.button
                      type="button"
                      className={styles.teamCard}
                      style={{ ['--accent' as string]: teamAccent[team.id] }}
                      onClick={() => goTo(team.id)}
                      animate={
                        reduce
                          ? undefined
                          : {
                              scale: emphasis === ti ? 1.02 : 0.98,
                              opacity: emphasis === ti ? 1 : 0.88,
                            }
                      }
                      transition={{ duration: 0.5, ease }}
                      whileHover={reduce ? undefined : { y: -6 }}
                    >
                      <span className={styles.teamCardBar} aria-hidden="true" />
                      <span className={styles.teamGhost} aria-hidden="true">
                        {String(ti + 1).padStart(2, '0')}
                      </span>
                      <span className={styles.teamCode}>{team.codename}</span>
                      <h3 className={styles.teamName}>{team.name}</h3>
                      <p className={styles.teamMission}>{team.mission}</p>
                      <div className={styles.teamChips}>
                        {team.contributions.slice(0, 3).map((c) => (
                          <span key={c} className={styles.teamChip}>
                            {c}
                          </span>
                        ))}
                      </div>
                      <div className={styles.teamFoot}>
                        <span className={styles.teamCount}>{count} people</span>
                        <span className={styles.teamEnter}>Explore team →</span>
                      </div>
                    </motion.button>
                  </Rise>
                )
              })}
            </div>
          </motion.div>
        ) : (
          <TeamChapter
            key={selectedTeam.id}
            team={selectedTeam}
            onBack={() => goTo(null)}
            onPerson={setModal}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modal && <PersonModal state={modal} onClose={() => setModal(null)} />}
      </AnimatePresence>
    </section>
  )
}

/* ── 4. In Motion — shared department-wide hot topics ──────── */
function InMotion() {
  return (
    <Recede id="now" className={`${styles.section} ${styles.pulse}`}>
      <ChapterHead
        index="03"
        label="In Motion"
        title="What we're driving right now."
        lede={
          <>
            A live pulse of the department — the initiatives and hot topics currently in motion
            across all three teams.
          </>
        }
      />
      <Rise>
        <HotTopicsCarousel items={hotTopics} />
      </Rise>
    </Recede>
  )
}

/* ── 5. Journey — vertical scroll timeline ─────────────────── */
function Journey() {
  const reduce = useReducedMotion()
  const railRef = useRef<HTMLDivElement>(null)
  const [activeIdx, setActiveIdx] = useState(0)

  // The spine draws itself in as the decade scrolls past.
  const { scrollYProgress } = useScroll({
    target: railRef,
    offset: ['start 0.72', 'end 0.5'],
  })
  const spineScale = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <Recede id="journey" className={`${styles.section} ${styles.journey}`}>
      <ChapterHead
        index="04"
        label="Journey"
        title="Ten years, told in milestones."
        lede={
          <>
            From a small founding group to a department the company relies on — the decade
            unfolds as you scroll, one milestone at a time.
          </>
        }
      />

      <div ref={railRef} className={styles.tlRail}>
        {/* Sticky watermark of the milestone currently in focus */}
        <div className={styles.tlWatermark} aria-hidden="true">
          <AnimatePresence mode="wait">
            <motion.span
              key={timeline[activeIdx].year}
              className={styles.tlWatermarkYear}
              initial={{ opacity: 0, y: reduce ? 0 : 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduce ? 0 : -40 }}
              transition={{ duration: 0.4, ease }}
            >
              {timeline[activeIdx].year}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* The spine: base line + scroll-linked fill */}
        <div className={styles.tlSpine} aria-hidden="true">
          <motion.span
            className={styles.tlSpineFill}
            style={reduce ? undefined : { scaleY: spineScale }}
          />
        </div>

        <ol className={styles.tlList}>
          {timeline.map((m, i) => (
            <motion.li
              key={m.year}
              className={`${styles.tlItem} ${i === activeIdx ? styles.tlItemActive : ''} ${
                m.major ? styles.tlItemMajor : ''
              }`}
              initial={{ opacity: 0, y: reduce ? 0 : 46 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.6, ease }}
            >
              {/* Sentinel: marks this milestone active while it
                  crosses the middle band of the viewport */}
              <motion.span
                className={styles.tlSentinel}
                aria-hidden="true"
                viewport={{ margin: '-44% 0px -44% 0px' }}
                onViewportEnter={() => setActiveIdx(i)}
              />
              <span className={styles.tlNode} aria-hidden="true" />
              <div className={styles.tlItemBody}>
                <p className={styles.tlYear}>{m.year}</p>
                <h3 className={styles.tlTitle}>{m.title}</h3>
                <p className={styles.tlDesc}>{m.description}</p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </Recede>
  )
}

/* ── 6. Voices from the Organization ───────────────────────── */
function Voices() {
  const featured = messages.slice(0, 3)

  return (
    <section id="voices" className={`${styles.section} ${styles.voices}`}>
      <div className={styles.voicesHead}>
        <MaskRise>
          <span className={styles.eyebrow}>05 — Appreciation</span>
        </MaskRise>
        <h2 className={styles.voicesTitle}>
          <MaskRise delay={0.08}>Voices from the Organization</MaskRise>
        </h2>
        <Rise>
          <p className={styles.secLede}>
            How the rest of {department.company} experiences working with the department.
          </p>
        </Rise>
      </div>

      <div className={styles.voicesList}>
        {featured.map((v, i) => (
          <Rise key={v.role} delay={i * 0.05} y={44}>
            <figure className={styles.voiceFigure}>
              <blockquote className={styles.voiceQuote}>{v.text}</blockquote>
              <figcaption className={styles.voiceAttr}>
                <span className={styles.voiceAuthor}>{v.author}</span>
                <span className={styles.voiceMeta}>
                  {v.role} · {v.department}
                </span>
                <span className={styles.voiceRel}>{v.relationship}</span>
              </figcaption>
            </figure>
          </Rise>
        ))}
      </div>

      <Rise className={styles.closing} y={40}>
        <p className={styles.closingMark}>
          {department.anniversary} years of {department.short} — <em>the best is still ahead.</em>
        </p>
        <p className={styles.closingSub}>
          {department.name} · {department.company} Bulgaria
        </p>
      </Rise>
    </section>
  )
}

/* ── Background music toggle ───────────────────────────────────
   Browsers block autoplay with sound, so the control is visible
   immediately but playback only ever starts from a user gesture:
   · clicking the button, or
   · (if the visitor previously chose "on" — persisted in
     localStorage) the first interaction anywhere on the page.
   AUDIO FILE: place the track at  public/audio/ppmd-theme.mp3
   — until it exists the button simply stays in the "off" state. */

const MUSIC_KEY = 'ppmd-music'
const MUSIC_SRC = '/audio/ppmd-theme.mp3'

function MusicToggle() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)

  const toggle = () => {
    const el = audioRef.current
    if (!el) return
    if (playing) {
      el.pause()
      setPlaying(false)
      try {
        localStorage.setItem(MUSIC_KEY, 'off')
      } catch {
        /* storage unavailable — preference just won't persist */
      }
    } else {
      el.volume = 0.35
      el.play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false)) // blocked or file missing
      try {
        localStorage.setItem(MUSIC_KEY, 'on')
      } catch {
        /* ignore */
      }
    }
  }

  // Visitor opted in previously → resume on the FIRST interaction
  // (the gesture makes play() allowed by autoplay policies).
  useEffect(() => {
    let saved: string | null = null
    try {
      saved = localStorage.getItem(MUSIC_KEY)
    } catch {
      /* ignore */
    }
    if (saved !== 'on') return
    const resume = () => {
      const el = audioRef.current
      if (!el) return
      el.volume = 0.35
      el.play()
        .then(() => setPlaying(true))
        .catch(() => {})
    }
    window.addEventListener('pointerdown', resume, { once: true })
    window.addEventListener('keydown', resume, { once: true })
    return () => {
      window.removeEventListener('pointerdown', resume)
      window.removeEventListener('keydown', resume)
    }
  }, [])

  return (
    <>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption -- background music */}
      <audio ref={audioRef} src={MUSIC_SRC} loop preload="none" />
      <button
        type="button"
        className={`${styles.musicBtn} ${playing ? styles.musicOn : ''}`}
        onClick={toggle}
        aria-pressed={playing}
        aria-label={playing ? 'Pause background music' : 'Play background music'}
        title={playing ? 'Pause background music' : 'Play background music'}
      >
        <span className={styles.musicBars} aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        Music
      </button>
    </>
  )
}

/* ── Root ──────────────────────────────────────────────────── */
export default function AppPrototype() {
  return (
    <div className={styles.root}>
      <Atmosphere />
      <MusicToggle />
      <Hero />
      {/* Every chapter after the hero lives in one panel that
          slides up OVER the pinned hero scene. */}
      <div className={styles.panel}>
        <Foundation />
        <TeamsPeople />
        <InMotion />
        <Journey />
        <Voices />
        <footer className={styles.credit}>Made by Valentin Stoev</footer>
      </div>
    </div>
  )
}
