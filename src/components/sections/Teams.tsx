import { Fragment } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Container } from '../ui/Container'
import { Section } from '../ui/Section'
import { SectionHeading } from '../ui/SectionHeading'
import { ArrowRightIcon, CheckIcon } from '../ui/icons'
import { teamIcons } from '../ui/iconMap'
import { teamsById } from '../../data/teams'
import type { Team } from '../../data/types'
import { easeOut, plainUp, sceneReveal, viewportOnce } from '../../lib/motion'
import styles from './Teams.module.css'

/** Panel reveal — transform + opacity only (no animated blur). */
const panelReveal = {
  hidden: { opacity: 0, y: 30, scale: 0.985 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: easeOut } },
}

export function Teams() {
  return (
    <Section id="teams">
      <Container>
        <SectionHeading
          index="02"
          eyebrow="Three Modules"
          title="One standard,"
          highlight="three ways of working"
          description="Each team runs its own playbook — a delivery pipeline, a process stack, a quality console. Different by design, aligned by purpose."
        />
      </Container>

      <div className={styles.chapters}>
        <Chapter team={teamsById.pm} idx="01">
          <PmVisual team={teamsById.pm} />
        </Chapter>
        <Chapter team={teamsById.pp} idx="02" reversed>
          <PpVisual team={teamsById.pp} />
        </Chapter>
        <Chapter team={teamsById.bpt} idx="03">
          <BptVisual team={teamsById.bpt} />
        </Chapter>
      </div>
    </Section>
  )
}

/** A single team scroll chapter — story on one side, its distinct visual on the other. */
function Chapter({
  team,
  idx,
  reversed = false,
  children,
}: {
  team: Team
  idx: string
  reversed?: boolean
  children: ReactNode
}) {
  const Icon = teamIcons[team.icon]
  const reduce = useReducedMotion()
  const style = {
    '--accent': `var(${team.accentVar})`,
    '--accent-glow': `var(${team.accentGlowVar})`,
  } as CSSProperties

  // Story slides in from the text side; the visual panel morphs up out of blur.
  const textVariant = reduce
    ? plainUp
    : {
        hidden: { opacity: 0, x: reversed ? 40 : -40 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: easeOut } },
      }
  const visualVariant = reduce ? plainUp : panelReveal

  return (
    <motion.div
      className={`${styles.chapter} ${reversed ? styles.reversed : ''}`}
      style={style}
      variants={sceneReveal}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
    >
      <span className={styles.ghost} aria-hidden>
        {idx}
      </span>
      <Container>
        <div className={styles.inner}>
          <motion.div className={styles.text} variants={textVariant}>
            <span className={styles.mark}>
              <span className={styles.icon}>
                <Icon width={20} height={20} />
              </span>
              <span className={styles.codename}>{team.codename}</span>
            </span>
            <h3 className={styles.name}>{team.name}</h3>
            <p className={styles.story}>{team.story}</p>
            <p className={styles.mission}>{team.mission}</p>
          </motion.div>

          <motion.div
            className={styles.visual}
            variants={visualVariant}
            whileHover={reduce ? undefined : { y: -4 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          >
            {children}
          </motion.div>
        </div>
      </Container>
    </motion.div>
  )
}

/** Typed instrument header so each module reads as its own kind of tool. */
function VisualHead({
  kind,
  meta,
  console: isConsole = false,
}: {
  kind: string
  meta: string
  console?: boolean
}) {
  return (
    <header className={`${styles.vHead} ${isConsole ? styles.vHeadConsole : ''}`}>
      {isConsole && (
        <span className={styles.vDots} aria-hidden>
          <i />
          <i />
          <i />
        </span>
      )}
      <span className={styles.vKind}>{kind}</span>
      <span className={styles.vMeta}>{meta}</span>
    </header>
  )
}

/** PM — a horizontal delivery pipeline. */
function PmVisual({ team }: { team: Team }) {
  return (
    <div className={styles.pm}>
      <VisualHead kind="Delivery pipeline" meta={`${team.facets.length} phases · linear`} />
      <div className={styles.pipeline}>
        {team.facets.map((f, i) => (
          <Fragment key={f.title}>
            <div className={styles.phase}>
              <span className={styles.phaseDot} aria-hidden />
              <span className={styles.phaseStep}>{`Phase ${String(i + 1).padStart(2, '0')}`}</span>
              <h4>{f.title}</h4>
              <p>{f.desc}</p>
            </div>
            {i < team.facets.length - 1 && (
              <ArrowRightIcon className={styles.phaseArrow} width={18} height={18} aria-hidden />
            )}
          </Fragment>
        ))}
      </div>
    </div>
  )
}

/** PP — layered process strata, like a stack. */
function PpVisual({ team }: { team: Team }) {
  return (
    <div className={styles.pp}>
      <VisualHead kind="Process stack" meta="layered · governed" />
      <div className={styles.stack}>
        {team.facets.map((f, i) => (
          <div className={styles.layer} key={f.title} style={{ '--i': i } as CSSProperties}>
            <span className={styles.layerIndex}>{String(i + 1).padStart(2, '0')}</span>
            <div>
              <h4>{f.title}</h4>
              <p>{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/** BPT — a quality console: validation checklist + a "validated" readout. */
function BptVisual({ team }: { team: Team }) {
  return (
    <div className={styles.bpt}>
      <VisualHead kind="quality.console" meta="● all green" console />
      <div className={styles.console}>
        <ul className={styles.checks}>
          {team.facets.map((f) => (
            <li key={f.title}>
              <span className={styles.checkMark} aria-hidden>
                <CheckIcon width={13} height={13} />
              </span>
              <div>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            </li>
          ))}
        </ul>
        <div className={styles.gauge} aria-hidden>
          <span className={styles.gaugeRing}>
            <CheckIcon width={22} height={22} />
          </span>
          <span className={styles.gaugeValue}>100%</span>
          <span className={styles.gaugeLabel}>every release</span>
        </div>
      </div>
    </div>
  )
}
