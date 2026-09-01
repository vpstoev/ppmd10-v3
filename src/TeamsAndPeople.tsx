import { useEffect, useMemo, useRef, useState } from 'react'
import { StreamField } from './ppmd-shared/StreamField'
import { SpatialTeamScene } from './ppmd-people-spatial/SpatialTeamScene'
import {
  detectWebGL,
  useNearViewport,
  useReducedMotionPref,
  useSectionProgress,
} from './ppmd-shared/sectionHooks'
import {
  DH_WINDOW,
  MEMBERS_IN,
  PEOPLE_WINDOWS,
  PEOPLE_INTRO_WINDOW,
  SD_WINDOW,
  TEAMS,
  TEAMS_CLOSE1_IN,
  TEAMS_CLOSE2_IN,
  TEAMS_OPENING_OUT,
  TEAMS_PHASES,
  TEAMS_STREAM_COLORS,
  TEAMS_VH,
  TEAM_NAMES,
  teamsWeights,
} from './ppmd-teams/teamsData'
import { LEADERSHIP_PROFILES } from './ppmd-teams/leadershipData'
import { LeadershipProfile } from './ppmd-teams/LeadershipProfile'
import { TEAM_COMPOSITIONS } from './ppmd-people-spatial/compositions'
import { displayRole, peopleByTeam, teamCount, validatePeopleData } from './ppmd-people/peopleData'
import { portraitFocus } from './ppmd-people/portraitFraming'
import type { Person, ProfileDetailData } from './ppmd-people/peopleTypes'
import { leadershipToProfile, personToProfile } from './ppmd-people/profileMapping'
import { ProfileDialog } from './ppmd-people/ProfileDialog'
import { fadeWindow, smoothstep } from './hg-hero/heroTheme'
import s from './TeamsAndPeople.module.css'

/**
 * One editorial 4:5 portrait. Leadership portraits are large; the
 * Team Leader carries a slight emphasis without leaving the group.
 * Every rendered portrait corresponds to exactly one data record.
 */
function Portrait({
  person,
  lead,
  onOpen,
  style,
}: {
  person: Person
  lead?: boolean
  onOpen: (p: Person) => void
  style?: React.CSSProperties
}) {
  const isTL = person.role === 'Team Leader'
  /* Absent while a title is unconfirmed — the same rule the fields use. */
  const role = displayRole(person)
  // The abstract wash stays underneath as the frame's own background, so a
  // portrait that fails to load falls back to it with nothing to toggle.
  const [imgFailed, setImgFailed] = useState(false)
  const showPhoto = !!person.photo && !imgFailed
  const cls = [s.portrait, lead ? s.portraitLead : '', isTL ? s.portraitTL : '']
    .filter(Boolean)
    .join(' ')
  return (
    <button type="button" className={cls} style={style} onClick={() => onOpen(person)}>
      <span
        className={s.frame}
        aria-hidden="true"
        style={{
          borderColor: lead ? person.accent : `${person.accent}55`,
          borderTopWidth: isTL ? 4 : undefined,
          background: `radial-gradient(130% 90% at 30% 16%, ${person.accent}30, transparent 60%), linear-gradient(168deg, rgba(245,239,228,0.08) 0%, rgba(245,239,228,0.02) 45%, transparent 75%)`,
        }}
      >
        {showPhoto && (
          <img
            className={s.framePhoto}
            src={person.photo}
            alt=""
            loading="lazy"
            decoding="async"
            style={{ objectPosition: portraitFocus(person.photoPosition) }}
            onError={() => setImgFailed(true)}
          />
        )}
        <span className={s.frameSheen} />
      </span>
      <span className={s.cardText}>
        {lead && role && (
          <span className={s.leadTagLine} style={{ color: person.accent }}>
            {role}
          </span>
        )}
        <span className={s.portraitName}>{person.name}</span>
        {!lead && role && <span className={s.portraitRole}>{role}</span>}
        {person.cardBio && <span className={s.portraitBio}>{person.cardBio}</span>}
      </span>
    </button>
  )
}

/**
 * Teams & People — Senior Director → Department Head → three team
 * chapters → three team fields → one department.
 *
 * The three fields are one design system arranged three ways: a network
 * for Project Management, a flow for Process & Procedures, an orbit for
 * BPT & Testing. Same portraits, same label typography, same interaction,
 * same world — see `ppmd-people-spatial/compositions`.
 *
 * Every count on screen derives from peopleData (15 / 11 / 7 = 33), never
 * from an expected figure.
 */
export default function TeamsAndPeople() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const reducedMotion = useReducedMotionPref()
  const webgl = useMemo(() => detectWebGL(), [])
  const isMobile = useMemo(() => window.innerWidth < 768, [])
  const near = useNearViewport(containerRef)
  const p = useSectionProgress(containerRef)
  const [activeProfile, setActiveProfile] = useState<ProfileDetailData | null>(null)
  const openPerson = (person: Person) => setActiveProfile(personToProfile(person))

  useEffect(() => {
    validatePeopleData()
  }, [])

  const leaders = useMemo(
    () => [...LEADERSHIP_PROFILES].sort((a, b) => a.displayOrder - b.displayOrder),
    [],
  )
  const rosters = useMemo(() => TEAM_NAMES.map((t) => peopleByTeam(t)), [])

  const openingO = 1 - smoothstep(TEAMS_OPENING_OUT[0], TEAMS_OPENING_OUT[1], p)
  const leaderWindows = [SD_WINDOW, DH_WINDOW]
  const close1 = smoothstep(TEAMS_CLOSE1_IN[0], TEAMS_CLOSE1_IN[1], p)
  const close2 = smoothstep(TEAMS_CLOSE2_IN[0], TEAMS_CLOSE2_IN[1], p)
  const peopleIntro = fadeWindow(p, ...PEOPLE_INTRO_WINDOW)

  /**
   * Which scene owns the pointer.
   *
   * Every chapter in this section is a full-bleed `inset: 0` layer stacked
   * on the same overlay, so at any scroll position five interactive scenes
   * physically cover the viewport and the last one in document order takes
   * the click. Fading a chapter out does not change that: opacity has no
   * effect on hit-testing, and the two windows either side of a handover
   * are deliberately overlapped, so there is always a stretch where an
   * outgoing scene is still in front of the incoming one.
   *
   * So presence, not paint order, decides: the chapter the reader is
   * actually looking at is the only one left interactive, and every other
   * one is marked `inert`. `inert` rather than `pointer-events`, because
   * both `pointer-events` and `visibility` are inherited and a descendant
   * can re-declare them — which is precisely how this broke — whereas an
   * inert subtree cannot opt back in. It also takes the hidden scenes out
   * of the tab order and the accessibility tree, which is the same
   * question asked in a different way.
   */
  const scenePresence = [
    ...leaderWindows.map((w) => fadeWindow(p, ...w)),
    ...PEOPLE_WINDOWS.map((w) => fadeWindow(p, ...w)),
  ]
  const front = scenePresence.reduce((best, v, i) => (v > scenePresence[best] ? i : best), 0)
  /* Between chapters nothing is on screen and nothing is clickable. The
     threshold matches the one the blocks hide themselves at. */
  const liveScene = scenePresence[front] > 0.02 ? front : -1

  if (!webgl) {
    return (
      <>
        <StaticFallback
          onOpenPerson={openPerson}
          onOpenLeader={(l) => setActiveProfile(leadershipToProfile(l))}
        />
        <ProfileDialog profile={activeProfile} onClose={() => setActiveProfile(null)} />
      </>
    )
  }

  return (
    <section
      ref={containerRef}
      className={s.container}
      style={{ height: `${TEAMS_VH}vh` }}
      aria-label="The People Behind"
    >
      <div className={s.sticky}>
        <div className={s.canvasLayer} aria-hidden="true">
          {near && (
            <StreamField
              containerRef={containerRef}
              reducedMotion={reducedMotion}
              isMobile={isMobile}
              colors={TEAMS_STREAM_COLORS}
              phases={TEAMS_PHASES}
              weights={teamsWeights}
              density={1.5}
              depthFog
            />
          )}
        </div>

        <div className={s.overlay}>
          {/* 1 — Section introduction */}
          <div
            className={s.centerBlock}
            style={{
              opacity: openingO,
              transform: `translateY(${-26 * (1 - openingO)}px)`,
              visibility: openingO <= 0.01 ? 'hidden' : undefined,
            }}
          >
            <h2 className={s.bigTitle}>
              <span className={s.titleLine}>THREE TEAMS.</span>
              <span className={s.titleLine}>ONE DEPARTMENT.</span>
            </h2>
            <p className={s.supportLine}>Different expertise. Shared responsibility.</p>
          </div>

          {/* 2–3 — Senior Director, then Department Head */}
          {leaders.map((leader, i) => {
            const w = fadeWindow(p, ...leaderWindows[i])
            const enter = Math.min(1, w * 1.5)
            return (
              <div
                key={leader.id}
                className={s.leaderBlock}
                inert={liveScene !== i}
                style={{
                  opacity: enter,
                  transform: `translateY(${(1 - enter) * 24}px)`,
                  visibility: w > 0.02 ? undefined : 'hidden',
                }}
              >
                <LeadershipProfile
                  data={leader}
                  variant={i}
                  active={enter}
                  reducedMotion={reducedMotion}
                  onOpen={(l) => setActiveProfile(leadershipToProfile(l))}
                />
              </div>
            )
          })}

          {/* 4–6 — Team introduction chapters */}
          {TEAMS.map((team, k) => {
            const w = fadeWindow(p, team.window[0], team.window[1], team.window[2], team.window[3])
            const enter = Math.min(1, w * 1.5)
            const count = teamCount(TEAM_NAMES[k])
            return (
              <div
                key={team.id}
                className={k % 2 === 0 ? s.teamBlock : `${s.teamBlock} ${s.teamRight}`}
                style={{ visibility: w > 0.02 ? undefined : 'hidden' }}
              >
                <span
                  className={s.teamNum}
                  aria-hidden="true"
                  style={{ color: `${team.accent}29`, opacity: enter }}
                >
                  {team.num}
                </span>
                <div
                  className={s.teamContent}
                  style={{ opacity: enter, transform: `translateY(${(1 - enter) * 24}px)` }}
                >
                  {/* The eyebrow carries the team's name in its accent —
                      the sequence number the chapters used to print in
                      front of it said nothing a reader needed. */}
                  <p className={s.teamMeta} style={{ color: team.accent }}>
                    {team.name}
                  </p>
                  <h3 className={s.teamHeadline}>{team.headline}</h3>
                  <p className={s.teamDescription}>{team.description}</p>
                  <p className={s.teamCount}>
                    {count} people · {team.leadershipCount} leadership function
                    {team.leadershipCount > 1 ? 's' : ''}
                  </p>
                  {/* No block at all when there are no figures: the
                      workbook's three evidence numbers are still TBD, and
                      an empty container would leave its own margin behind
                      as a gap under the count line. */}
                  {team.facts.length > 0 && (
                  <div className={s.teamFacts}>
                    {team.facts.map((fact, fi) => {
                      const factO = smoothstep(
                        team.window[1] + fi * 0.012,
                        team.window[1] + 0.024 + fi * 0.012,
                        p,
                      )
                      return (
                        <p
                          key={`${fact.value}-${fi}`}
                          className={!fact.label ? `${s.fact} ${s.factBullet}` : s.fact}
                          style={{
                            opacity: factO * enter,
                            transform: `translateX(${(1 - factO) * 18}px)`,
                          }}
                        >
                          {!fact.label && (
                            <span
                              className={s.factDot}
                              style={{
                                background: team.accent,
                                boxShadow: `0 0 16px ${team.accent}8f`,
                              }}
                              aria-hidden="true"
                            />
                          )}
                          <span
                            className={s.factValue}
                            style={!fact.label ? { color: team.accent } : undefined}
                          >
                            {fact.value}
                          </span>
                          {fact.label && <span className={s.factLabel}>{fact.label}</span>}
                        </p>
                      )
                    })}
                  </div>
                  )}
                  <p className={s.distinctive} style={{ color: team.accent }}>
                    {team.distinctiveFact}
                  </p>
                </div>
              </div>
            )
          })}

          {/* A named handoff keeps the People chapter visible in the
              long scroll, before the first roster begins to assemble. */}
          <div
            className={s.peopleIntro}
            style={{
              opacity: peopleIntro,
              transform: `translateY(${(1 - peopleIntro) * 22}px)`,
              visibility: peopleIntro > 0.02 ? undefined : 'hidden',
            }}
            aria-hidden="true"
          >
            <p className={s.peopleIntroKicker}>FROM TEAMS TO PEOPLE</p>
            <h2>THE PEOPLE BEHIND.</h2>
            <p>Meet the professionals who turn shared standards into everyday delivery.</p>
          </div>

          {/* 7–9 — The three team fields.
              One component, one visual system, three compositions: the
              network, the flow and the orbit. Each chapter also carries
              its own entry and exit progress, which is what lets the
              field that is leaving and the field that is arriving hold
              the same shape at the moment they cross. */}
          {TEAMS.map((team, k) => {
            const win = PEOPLE_WINDOWS[k]
            const w = fadeWindow(p, ...win)
            const enter = Math.min(1, w * 1.5)
            const membersBase = smoothstep(MEMBERS_IN[k][0], MEMBERS_IN[k][1], p)
            const roster = rosters[k]
            const composition = TEAM_COMPOSITIONS[TEAM_NAMES[k]]
            return (
              <div
                key={`people-${team.id}`}
                className={`${s.people} ${s.pcSpatial}`}
                inert={liveScene !== 2 + k}
                style={{ opacity: enter, visibility: w > 0.02 ? undefined : 'hidden' }}
              >
                <div className={s.spatialHead}>
                  <p className={s.peopleTeamName} style={{ color: team.accent }}>
                    {team.rosterTitle}
                  </p>
                  <p className={s.peopleCount}>{roster.length} PROFESSIONALS</p>
                  <p className={s.spatialLede}>{team.rosterLede}</p>
                </div>
                <SpatialTeamScene
                  roster={roster}
                  accent={team.accent}
                  composition={composition}
                  visible={enter}
                  reveal={membersBase}
                  enter={smoothstep(win[0], win[1], p)}
                  exit={smoothstep(win[2], win[3], p)}
                  reducedMotion={reducedMotion}
                  onOpen={openPerson}
                />
              </div>
            )
          })}

          {/* 10 — Closing */}
          <div className={s.centerBlock} style={{ visibility: close1 <= 0.01 ? 'hidden' : undefined }}>
            <p
              className={s.closeFirst}
              style={{
                opacity: close1 * (1 - close2 * 0.4),
                transform: `translateY(${(1 - close1) * 20}px)`,
              }}
            >
              THE WORK IS COMPLEX.
            </p>
            <h2
              className={s.closeMain}
              style={{ opacity: close2, transform: `translateY(${(1 - close2) * 24}px)` }}
            >
              THE PEOPLE MAKE IT POSSIBLE.
            </h2>
          </div>
        </div>
      </div>

      <ProfileDialog profile={activeProfile} onClose={() => setActiveProfile(null)} />
    </section>
  )
}

/** No-WebGL fallback — the full sequence in normal flow; profiles work. */
function StaticFallback({
  onOpenPerson,
  onOpenLeader,
}: {
  onOpenPerson: (p: Person) => void
  onOpenLeader: (l: (typeof LEADERSHIP_PROFILES)[number]) => void
}) {
  const leaders = [...LEADERSHIP_PROFILES].sort((a, b) => a.displayOrder - b.displayOrder)
  return (
    <section className={s.fallback} aria-label="Teams and people">
      <div className={`${s.fbBlock} ${s.fbCenter}`}>
        <h2 className={s.bigTitle}>
          <span className={s.titleLine}>THREE TEAMS.</span>
          <span className={s.titleLine}>ONE DEPARTMENT.</span>
        </h2>
        <p className={s.supportLine}>Different expertise. Shared responsibility.</p>
      </div>
      {leaders.map((leader, i) => (
        <div key={leader.id} className={s.fbBlock}>
          <LeadershipProfile data={leader} variant={i} onOpen={onOpenLeader} />
        </div>
      ))}
      <div className={`${s.fbBlock} ${s.fbCenter} ${s.peopleIntroFallback}`}>
        <p className={s.peopleIntroKicker}>FROM TEAMS TO PEOPLE</p>
        <h2 className={s.closeMain}>THE PEOPLE BEHIND.</h2>
        <p className={s.supportLine}>Meet the professionals who turn shared standards into everyday delivery.</p>
      </div>
      {TEAMS.map((team, k) => {
        const roster = peopleByTeam(TEAM_NAMES[k])
        const leads = roster.filter((x) => x.isLeadership)
        const members = roster.filter((x) => !x.isLeadership)
        return (
          <div key={team.id} className={`${s.fbBlock} ${[s.pcPM, s.pcPROC, s.pcBPT][k]}`}>
            <p className={s.teamMeta} style={{ color: team.accent }}>
              {team.name}
            </p>
            <h3 className={s.teamHeadline}>{team.headline}</h3>
            <p className={s.teamDescription}>{team.description}</p>
            <div className={s.peopleHead}>
              <p className={s.peopleTeamName} style={{ color: team.accent }}>
                {team.rosterTitle}
              </p>
              <p className={s.peopleCount}>{roster.length} PROFESSIONALS</p>
            </div>
            <div className={s.stage}>
              <div className={s.leadGroup}>
                {leads.map((person) => (
                  <Portrait key={person.id} person={person} lead onOpen={onOpenPerson} />
                ))}
              </div>
              <div className={s.memberArea}>
                {members.map((person) => (
                  <Portrait key={person.id} person={person} onOpen={onOpenPerson} />
                ))}
              </div>
            </div>
          </div>
        )
      })}
      <div className={`${s.fbBlock} ${s.fbCenter}`}>
        <p className={s.closeFirst}>THE WORK IS COMPLEX.</p>
        <h2 className={s.closeMain}>THE PEOPLE MAKE IT POSSIBLE.</h2>
      </div>
    </section>
  )
}
