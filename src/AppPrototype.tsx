/* ============================================================
   AppPrototype — cinematic chapter redesign (v7)

   A SEPARATE, visually dramatic prototype of the PPMD 10-year
   anniversary homepage. It does NOT replace the production App.
   It reads from the existing `src/data/*` so content meaning is
   preserved; layout, atmosphere, motion and interactions are new.
   Supplemental "activities / facts" copy is local placeholder data
   so no data files are touched.

   The page is built as CHAPTERS, not stacked cards:
   · Hero — pinned 200vh scene; the number pushes through the
     screen while the first chapter panel slides up OVER it.
   · Foundation — compact active-feature pillar stage with tabs.
   · Teams & People — overview strip + team cards → dedicated
     team chapter (intro → leadership → carousel → tiles → roster).
   · Journey — center-snapped milestone rail with arrows.
   · Voices — editorial quotes + closing mark.

   All motion is transform/opacity only and reduced-motion safe.
   ============================================================ */

import { type ReactNode, useEffect, useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
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

/* ── Local placeholder copy (NOT from data files) ──────────────
   Illustrative "current activities" and capability facts per team
   so the dedicated chapter has a carousel + tiles. Swap freely. */

const teamActivities: Record<TeamId, { tag: string; title: string; detail: string }[]> = {
  pm: [
    {
      tag: 'In progress',
      title: 'Company-wide delivery portfolio',
      detail: 'Coordinating a portfolio of cross-functional initiatives from kickoff to launch.',
    },
    {
      tag: 'Scaling',
      title: 'Delivery framework, next iteration',
      detail: 'Refining the planning, risk and governance model the department runs on.',
    },
    {
      tag: 'Ongoing',
      title: 'Stakeholder alignment forums',
      detail: 'Keeping business and delivery aligned across every active project.',
    },
    {
      tag: 'Kicking off',
      title: 'Portfolio reporting upgrade',
      detail: 'One live view of every initiative — status, risk and value in a single place.',
    },
  ],
  pp: [
    {
      tag: 'In progress',
      title: 'Process documentation refresh',
      detail: 'Bringing core company processes into one clear, trusted, shared library.',
    },
    {
      tag: 'Rollout',
      title: 'Procedure governance model',
      detail: 'Standardizing how procedures are approved, versioned and maintained.',
    },
    {
      tag: 'Ongoing',
      title: 'Continuous improvement cycles',
      detail: 'Every review makes a key workflow a little simpler than before.',
    },
    {
      tag: 'Kicking off',
      title: 'Knowledge management platform',
      detail: 'Making the right process knowledge findable by anyone, in seconds.',
    },
  ],
  bpt: [
    {
      tag: 'In progress',
      title: 'Business process transformation',
      detail: 'Reshaping and simplifying core operational flows across the company.',
    },
    {
      tag: 'Scaling',
      title: 'Test automation suite',
      detail: 'Expanding automated coverage that runs before every major release.',
    },
    {
      tag: 'Ongoing',
      title: 'Release quality gates',
      detail: 'The last check before a change reaches a customer is ours to make.',
    },
    {
      tag: 'Kicking off',
      title: 'End-to-end regression program',
      detail: 'A single regression pack protecting the customer journeys that matter most.',
    },
  ],
}

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

/* ── 1. Hero — pinned push-through scene ───────────────────── */
function Hero() {
  const reduce = useReducedMotion()
  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end end'],
  })

  // Two-phase push-through: the lockup breathes IN toward the
  // viewer first (scale up), then recedes upward while the copy
  // sinks with its own depth — and the chapter panel sweeps over.
  const lockupScale = useTransform(scrollYProgress, [0, 0.3, 1], [1, 1.12, 0.82])
  const lockupY = useTransform(scrollYProgress, [0, 0.3, 1], [0, -12, -180])
  const lockupOpacity = useTransform(scrollYProgress, [0, 0.5, 0.92], [1, 1, 0])
  const copyY = useTransform(scrollYProgress, [0, 0.65], [0, 150])
  const copyScale = useTransform(scrollYProgress, [0, 0.65], [1, 0.94])
  const copyOpacity = useTransform(scrollYProgress, [0.08, 0.5], [1, 0])
  const barsOpacity = useTransform(scrollYProgress, [0, 0.22], [1, 0])
  const ghostScale = useTransform(scrollYProgress, [0, 1], [1, 1.3])
  const ghostOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.2])

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
        {/* Giant outlined wordmark — deepest parallax layer */}
        <div className={styles.heroGhostWrap} aria-hidden="true">
          <motion.span
            className={styles.heroGhost}
            style={reduce ? undefined : { scale: ghostScale, opacity: ghostOpacity }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.4, ease, delay: 0.15 }}
          >
            PPMD
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

          <div className={styles.heroStage}>
            <span className={styles.heroGlowBig} aria-hidden="true" />
            <motion.div
              className={styles.heroLockup}
              variants={numberIn}
              style={reduce ? undefined : { scale: lockupScale, y: lockupY, opacity: lockupOpacity }}
            >
              <span className={styles.heroNumber} aria-hidden="true">
                10
              </span>
              <span className={styles.heroYears}>
                <span className={styles.heroYearsWord}>Years</span>
                <span className={styles.heroYearsSub}>of {department.short}</span>
                <span className={styles.heroYearsRange}>2015 — 2025</span>
              </span>
            </motion.div>

            <motion.div
              className={styles.heroCopy}
              style={reduce ? undefined : { y: copyY, scale: copyScale, opacity: copyOpacity }}
            >
              <motion.h1 className={styles.heroHeadline} variants={enter}>
                A decade of delivery, structure and quality —{' '}
                <em>and the people behind all of it.</em>
              </motion.h1>
              <motion.p className={styles.heroIntro} variants={enter}>
                {department.intro}
              </motion.p>
            </motion.div>
          </div>

          <motion.div
            className={styles.heroBottom}
            variants={enter}
            style={reduce ? undefined : { opacity: barsOpacity }}
          >
            <span className={styles.heroScroll}>
              <span className={styles.heroScrollLine} aria-hidden="true" />
              Scroll to begin
            </span>
            <span className={styles.heroNext}>Next — 01 Foundation</span>
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
      style={{ ['--accent' as string]: team.accentHex }}
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

/** Premium activity carousel — one featured activity at a time. */
function ActivityCarousel({ team }: { team: Team }) {
  const reduce = useReducedMotion()
  const items = teamActivities[team.id]
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
        <span className={styles.carouselKicker}>Current top activities</span>
        <div className={styles.carouselNav}>
          <span className={styles.carouselCounter}>
            {String(i + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
          </span>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={() => go(-1)}
            aria-label="Previous activity"
          >
            ←
          </button>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={() => go(1)}
            aria-label="Next activity"
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
            <span className={styles.carouselTag}>{a.tag}</span>
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
            aria-label={`Activity ${d + 1}`}
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
    { value: String(roster.length), label: 'People', filled: true },
    ...teamFacts[team.id].map((f) => ({ ...f, filled: false })),
    { value: '10 yrs', label: 'With the department', filled: false },
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
    onPerson({ person, accent: team.accentHex, label: `Part of ${team.name}` })

  return (
    <motion.div
      className={styles.teamChapter}
      style={{ ['--accent' as string]: team.accentHex }}
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

      {/* Editorial team identity — open composition, no box */}
      <motion.header className={styles.tHead} variants={cardVariants}>
        <span className={styles.tGhost} aria-hidden="true">
          {team.codename.split('.')[0]}
        </span>
        <span className={styles.tCode}>{team.codename}</span>
        <h3 className={styles.tName}>{team.name}</h3>
        <p className={styles.tMission}>{team.mission}</p>
        <p className={styles.tStory}>{team.story}</p>
      </motion.header>

      {/* Leadership highlight */}
      <div className={styles.rosterGroup}>
        <motion.span className={styles.rosterLabel} variants={cardVariants}>
          Leadership <span className={styles.rosterCount}>{leaders.length}</span>
        </motion.span>
        <div className={styles.leadRow}>
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
        </div>
      </div>

      {/* Activities carousel */}
      <motion.div variants={cardVariants}>
        <ActivityCarousel team={team} />
      </motion.div>

      {/* Capability / certification tiles */}
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

      {/* Full roster for this team only */}
      <div className={styles.rosterGroup}>
        <motion.span className={styles.rosterLabel} variants={cardVariants}>
          The team <span className={styles.rosterCount}>{members.length}</span>
        </motion.span>
        <div className={styles.memberGrid}>
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
    </motion.div>
  )
}

function TeamsPeople() {
  const reduce = useReducedMotion()
  const [selected, setSelected] = useState<TeamId | null>(null)
  const [modal, setModal] = useState<ModalState | null>(null)
  const anchorRef = useRef<HTMLDivElement>(null)

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
            leadership, current activities and the full roster.
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
            {/* Compact Head-of-Department strip */}
            <Rise className={styles.headStrip}>
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
              </div>
              <button
                type="button"
                className={styles.ctaBtn}
                onClick={() =>
                  setModal({
                    person: head,
                    accent: '#e2001a',
                    label: `Head of Department · ${department.short}`,
                  })
                }
              >
                View details →
              </button>
            </Rise>

            {/* Team overview cards */}
            <div className={styles.teamGrid}>
              {teams.map((team, ti) => {
                const count = people.filter((p) => p.team === team.id).length
                return (
                  <Rise key={team.id} delay={ti * 0.09}>
                    <motion.button
                      type="button"
                      className={styles.teamCard}
                      style={{ ['--accent' as string]: team.accentHex }}
                      onClick={() => goTo(team.id)}
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

/* ── 4. Journey — center-snapped milestone rail ────────────── */
function Journey() {
  const reduce = useReducedMotion()
  const viewportRef = useRef<HTMLDivElement>(null)
  const drag = useRef({ down: false, moved: false, startX: 0, startLeft: 0 })
  const [progress, setProgress] = useState(0)
  const [activeIdx, setActiveIdx] = useState(0)

  const measure = () => {
    const el = viewportRef.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setProgress(max > 0 ? el.scrollLeft / max : 0)

    const cards = el.querySelectorAll<HTMLElement>('[data-tl-card]')
    const center = el.scrollLeft + el.clientWidth / 2
    let best = 0
    let bestDist = Infinity
    cards.forEach((c, i) => {
      const cc = c.offsetLeft + c.offsetWidth / 2
      const d = Math.abs(cc - center)
      if (d < bestDist) {
        bestDist = d
        best = i
      }
    })
    setActiveIdx(best)
  }

  useEffect(() => {
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** Center the milestone at `idx` in the viewport. */
  const centerCard = (idx: number) => {
    const el = viewportRef.current
    if (!el) return
    const clamped = Math.max(0, Math.min(timeline.length - 1, idx))
    const card = el.querySelectorAll<HTMLElement>('[data-tl-card]')[clamped]
    if (!card) return
    el.scrollTo({
      left: card.offsetLeft + card.offsetWidth / 2 - el.clientWidth / 2,
      behavior: reduce ? 'auto' : 'smooth',
    })
  }

  const onPointerDown = (e: React.PointerEvent) => {
    const el = viewportRef.current
    if (!el) return
    drag.current = { down: true, moved: false, startX: e.clientX, startLeft: el.scrollLeft }
    el.setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    const el = viewportRef.current
    if (!el || !drag.current.down) return
    const dx = e.clientX - drag.current.startX
    if (Math.abs(dx) > 8) drag.current.moved = true
    el.scrollLeft = drag.current.startLeft - dx
  }
  const onPointerUp = (e: React.PointerEvent) => {
    drag.current.down = false
    viewportRef.current?.releasePointerCapture(e.pointerId)
  }

  const milestoneVariants: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
  }

  return (
    <Recede id="journey" className={`${styles.section} ${styles.journey}`}>
      <ChapterHead
        index="03"
        label="Journey"
        title="Ten years, told in milestones."
        lede={
          <>
            From a small founding group to a department the company relies on — move through the
            decade, one milestone at a time.
          </>
        }
      />

      <Rise className={styles.tlControls}>
        <span className={styles.tlHint}>
          <span className={styles.tlHintDot} aria-hidden="true" />
          Drag or use the arrows
        </span>
        <div className={styles.tlButtons}>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={() => centerCard(activeIdx - 1)}
            disabled={activeIdx === 0}
            aria-label="Previous milestone"
          >
            ←
          </button>
          <span className={styles.tlCounter}>
            {String(activeIdx + 1).padStart(2, '0')} / {String(timeline.length).padStart(2, '0')}
          </span>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={() => centerCard(activeIdx + 1)}
            disabled={activeIdx === timeline.length - 1}
            aria-label="Next milestone"
          >
            →
          </button>
        </div>
      </Rise>

      <div className={styles.tlStage}>
        {/* Giant watermark of the active year — the decade anchor */}
        <div className={styles.tlGhostWrap} aria-hidden="true">
          <AnimatePresence mode="wait">
            <motion.span
              key={timeline[activeIdx].year}
              className={styles.tlGhostYear}
              initial={{ opacity: 0, y: reduce ? 0 : 44 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduce ? 0 : -44 }}
              transition={{ duration: 0.45, ease }}
            >
              {timeline[activeIdx].year}
            </motion.span>
          </AnimatePresence>
        </div>

        <div
          ref={viewportRef}
          className={styles.timelineViewport}
          onScroll={measure}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className={styles.timelineTrack}>
          <span className={styles.timelineLine} aria-hidden="true" />
          {timeline.map((m, i) => (
            <motion.div
              key={m.year}
              data-tl-card
              className={`${styles.tlCard} ${activeIdx === i ? styles.tlCardActive : ''} ${
                m.major ? styles.tlCardMajor : ''
              }`}
              variants={milestoneVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.4 }}
              onClick={() => {
                if (!drag.current.moved) centerCard(i)
              }}
            >
              <div className={styles.tlCardInner}>
                <p className={`${styles.tlYear} ${m.major ? styles.tlYearMajor : ''}`}>{m.year}</p>
                <div className={styles.tlNodeRow}>
                  <span
                    className={`${styles.tlNode} ${m.major ? styles.tlNodeMajor : ''}`}
                    aria-hidden="true"
                  />
                </div>
                <div className={styles.tlBody}>
                  <h3 className={styles.tlTitle}>{m.title}</h3>
                  <p className={styles.tlDesc}>{m.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
          </div>
        </div>
      </div>

      <div className={styles.tlProgress} aria-hidden="true">
        <span
          className={styles.tlProgressBar}
          style={{ transform: `scaleX(${progress || 0.001})` }}
        />
      </div>
    </Recede>
  )
}

/* ── 5. Voices from the Organization ───────────────────────── */
function Voices() {
  const featured = messages.slice(0, 3)

  return (
    <section id="voices" className={`${styles.section} ${styles.voices}`}>
      <div className={styles.voicesHead}>
        <MaskRise>
          <span className={styles.eyebrow}>04 — Appreciation</span>
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

/* ── Root ──────────────────────────────────────────────────── */
export default function AppPrototype() {
  return (
    <div className={styles.root}>
      <Atmosphere />
      <Hero />
      {/* Every chapter after the hero lives in one panel that
          slides up OVER the pinned hero scene. */}
      <div className={styles.panel}>
        <Foundation />
        <TeamsPeople />
        <Journey />
        <Voices />
      </div>
    </div>
  )
}
