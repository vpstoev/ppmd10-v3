import { useEffect, useMemo, useRef, useState } from 'react'
import { StreamField } from './ppmd-shared/StreamField'
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
import { peopleByTeam, teamCount, validatePeopleData } from './ppmd-people/peopleData'
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
  return (
    <button
      type="button"
      className={lead ? `${s.portrait} ${s.portraitLead}` : s.portrait}
      style={style}
      onClick={() => onOpen(person)}
    >
      <span
        className={s.frame}
        aria-hidden="true"
        style={{
          borderColor: lead ? person.accent : `${person.accent}55`,
          borderTopWidth: isTL ? 4 : undefined,
          background: `radial-gradient(130% 90% at 30% 16%, ${person.accent}30, transparent 60%), linear-gradient(168deg, rgba(245,239,228,0.08) 0%, rgba(245,239,228,0.02) 45%, transparent 75%)`,
        }}
      >
        <span className={s.frameSheen} />
      </span>
      {lead && <span className={s.leadTagLine} style={{ color: person.accent }}>{person.role}</span>}
      <span className={s.portraitName}>{person.name}</span>
      {!lead && <span className={s.portraitRole}>{person.role}</span>}
    </button>
  )
}

/**
 * Teams & People — Senior Director → Department Head → three team
 * chapters → three cinematic team rosters (leadership state, then the
 * full team assembling) → one department. All counts derive from
 * peopleData (16 / 11 / 7 = 34).
 */
export default function TeamsAndPeople() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const reducedMotion = useReducedMotionPref()
  const webgl = useMemo(detectWebGL, [])
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
      aria-label="Teams and people"
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
                style={{
                  opacity: enter,
                  transform: `translateY(${(1 - enter) * 24}px)`,
                  visibility: w > 0.02 ? undefined : 'hidden',
                }}
              >
                <LeadershipProfile
                  data={leader}
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
                  <p className={s.teamMeta} style={{ color: team.accent }}>
                    <span className={s.teamMetaNum}>{team.num}</span>
                    {team.name}
                  </p>
                  <h3 className={s.teamHeadline}>{team.headline}</h3>
                  <p className={s.teamDescription}>{team.description}</p>
                  <p className={s.teamCount}>
                    {count} people · {team.leadershipCount} leadership function
                    {team.leadershipCount > 1 ? 's' : ''}
                  </p>
                  <div className={s.teamFacts}>
                    {team.facts.map((fact, fi) => {
                      const factO = smoothstep(
                        team.window[1] + fi * 0.012,
                        team.window[1] + 0.024 + fi * 0.012,
                        p,
                      )
                      return (
                        <p
                          key={fact.label}
                          className={fi === 0 ? `${s.fact} ${s.factMain}` : s.fact}
                          style={{
                            opacity: factO * enter,
                            transform: `translateX(${(1 - factO) * 18}px)`,
                          }}
                        >
                          <span
                            className={s.factValue}
                            style={fi === 0 ? { color: team.accent } : undefined}
                          >
                            {fact.value}
                          </span>
                          <span className={s.factLabel}>{fact.label}</span>
                        </p>
                      )
                    })}
                  </div>
                  <p className={s.distinctive} style={{ color: team.accent }}>
                    {team.distinctiveFact}
                  </p>
                </div>
              </div>
            )
          })}

          {/* 7–9 — Cinematic team rosters: leadership, then full team */}
          {TEAMS.map((team, k) => {
            const w = fadeWindow(p, ...PEOPLE_WINDOWS[k])
            const enter = Math.min(1, w * 1.5)
            const membersBase = smoothstep(MEMBERS_IN[k][0], MEMBERS_IN[k][1], p)
            const roster = rosters[k]
            const leads = roster.filter((x) => x.isLeadership)
            const members = roster.filter((x) => !x.isLeadership)
            const layoutClass = [s.pcPM, s.pcPROC, s.pcBPT][k]
            return (
              <div
                key={`people-${team.id}`}
                className={`${s.people} ${layoutClass}`}
                style={{ opacity: enter, visibility: w > 0.02 ? undefined : 'hidden' }}
              >
                <div className={s.peopleHead}>
                  <p className={s.peopleTeamName} style={{ color: team.accent }}>
                    {team.rosterTitle}
                  </p>
                  <p className={s.peopleCount}>{roster.length} PROFESSIONALS</p>
                </div>
                <div className={s.stage}>
                  <div className={s.leadGroup}>
                    {leads.map((person) => (
                      <Portrait key={person.id} person={person} lead onOpen={openPerson} />
                    ))}
                  </div>
                  <div className={s.memberArea}>
                    {members.map((person, i) => {
                      const mi = smoothstep(
                        MEMBERS_IN[k][0] + i * 0.0035,
                        MEMBERS_IN[k][1] + i * 0.0035,
                        p,
                      )
                      return (
                        <Portrait
                          key={person.id}
                          person={person}
                          onOpen={openPerson}
                          style={{
                            opacity: Math.min(mi, membersBase > 0 ? 1 : 0),
                            transform: `translateY(${(1 - mi) * 26}px)`,
                            pointerEvents: mi > 0.5 ? undefined : 'none',
                          }}
                        />
                      )
                    })}
                  </div>
                </div>
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
      {leaders.map((leader) => (
        <div key={leader.id} className={s.fbBlock}>
          <LeadershipProfile data={leader} onOpen={onOpenLeader} />
        </div>
      ))}
      {TEAMS.map((team, k) => {
        const roster = peopleByTeam(TEAM_NAMES[k])
        const leads = roster.filter((x) => x.isLeadership)
        const members = roster.filter((x) => !x.isLeadership)
        return (
          <div key={team.id} className={`${s.fbBlock} ${[s.pcPM, s.pcPROC, s.pcBPT][k]}`}>
            <p className={s.teamMeta} style={{ color: team.accent }}>
              <span className={s.teamMetaNum}>{team.num}</span>
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
