import { useState } from 'react'
import type { CSSProperties } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { SearchIcon } from 'lucide-react'
import { Container } from '../ui/Container'
import { Section } from '../ui/Section'
import { SectionHeading } from '../ui/SectionHeading'
import { Avatar } from '../ui/Avatar'
import { ArrowRightIcon } from '../ui/icons'
import { teamIcons } from '../ui/iconMap'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { PersonModal } from './PersonModal'
import { PeopleSearch } from './PeopleSearch'
import { head, people } from '../../data/people'
import { teams, teamSections } from '../../data/teams'
import type { Person, RoleVariant, Team, TeamId } from '../../data/types'
import { easeOut, plainUp, staggerContainer, staggerItem } from '../../lib/motion'
import styles from './PeopleDirectory.module.css'
import '../ui/shadcn-overrides.css'

const membersOf = (id: TeamId) => people.filter((p) => p.team === id)

/**
 * Premium department directory. Default = a Head-of-Department spotlight, a
 * department-wide search, and three team entry points (never 36 cards at once).
 * Opening a team reveals a tabbed detail — switch teams in place — with a team
 * header, capability facets, a featured lead and a compact people directory.
 * Any person opens the full PersonModal.
 */
export function PeopleDirectory() {
  const [openTeam, setOpenTeam] = useState<TeamId | null>(null)
  const [selected, setSelected] = useState<Person | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <Section id="people" className={styles.section}>
      <Container>
        <SectionHeading
          index="03"
          eyebrow="The People"
          title="One department,"
          highlight="around thirty-six people"
          description="Led as one, delivered by three teams. Search for anyone, or open a team to meet everyone in it."
        />

        <AnimatePresence mode="wait">
          {!openTeam ? (
            <motion.div
              key="overview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -12, transition: { duration: 0.25 } }}
            >
              <HeadSpotlight onOpen={() => setSelected(head)} />

              <button
                type="button"
                className={styles.searchTrigger}
                onClick={() => setSearchOpen(true)}
              >
                <SearchIcon width={18} height={18} />
                <span className={styles.searchLabel}>
                  Search the department — {people.length} people
                </span>
                <kbd className={styles.kbd}>Ctrl K</kbd>
              </button>

              <motion.div
                className={styles.teams}
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {teams.map((t) => (
                  <TeamBlock key={t.id} team={t} onOpen={() => setOpenTeam(t.id)} />
                ))}
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="detail"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12, transition: { duration: 0.25 } }}
              transition={{ duration: 0.4, ease: easeOut }}
            >
              <div className={styles.detailBar}>
                <button type="button" className={styles.back} onClick={() => setOpenTeam(null)}>
                  ← All teams
                </button>
                <button
                  type="button"
                  className={styles.searchInline}
                  onClick={() => setSearchOpen(true)}
                >
                  <SearchIcon width={15} height={15} /> Search
                </button>
              </div>

              <Tabs
                value={openTeam}
                onValueChange={(v) => setOpenTeam(v as TeamId)}
                className={styles.tabs}
              >
                <TabsList>
                  {teams.map((t) => (
                    <TabsTrigger key={t.id} value={t.id}>
                      {t.short}
                      <span className={styles.tabCount}>{membersOf(t.id).length}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {teams.map((t) => (
                  <TabsContent key={t.id} value={t.id}>
                    <TeamPanel team={t} onSelect={setSelected} />
                  </TabsContent>
                ))}
              </Tabs>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>

      <PeopleSearch open={searchOpen} onOpenChange={setSearchOpen} onSelect={setSelected} />
      <PersonModal person={selected} onClose={() => setSelected(null)} />
    </Section>
  )
}

/** Head of Department — a wide, distinct spotlight, not another team card. */
function HeadSpotlight({ onOpen }: { onOpen: () => void }) {
  return (
    <motion.div
      className={styles.spotlight}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: easeOut }}
    >
      <div className={styles.spotAvatar}>
        <span className={styles.spotRing} aria-hidden />
        <Avatar person={head} size={104} />
      </div>
      <div className={styles.spotBody}>
        <span className={styles.spotKicker}>Head of Department · connects all three teams</span>
        <h3 className={styles.spotName}>{head.name}</h3>
        <p className={styles.spotRole}>{head.role}</p>
        <p className={styles.spotText}>{head.contribution}</p>
        <button type="button" className={styles.spotCta} onClick={onOpen}>
          Read profile <ArrowRightIcon width={16} height={16} />
        </button>
      </div>
      <div className={styles.spotStats} aria-hidden>
        <span>
          <strong>3</strong>teams
        </span>
        <span>
          <strong>~36</strong>people
        </span>
        <span>
          <strong>10</strong>years
        </span>
      </div>
    </motion.div>
  )
}

function TeamBlock({ team, onOpen }: { team: Team; onOpen: () => void }) {
  const Icon = teamIcons[team.icon]
  const members = membersOf(team.id)
  const preview = members.slice(0, 5)
  const extra = members.length - preview.length
  const style = {
    '--accent': `var(${team.accentVar})`,
    '--accent-glow': `var(${team.accentGlowVar})`,
  } as CSSProperties

  return (
    <motion.button
      type="button"
      className={styles.block}
      style={style}
      variants={staggerItem}
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      onClick={onOpen}
      aria-label={`View ${team.name}, ${members.length} people`}
    >
      <span className={styles.blockTop}>
        <span className={styles.blockIcon} aria-hidden>
          <Icon width={22} height={22} />
        </span>
        <span className={styles.blockCount}>
          <strong>{members.length}</strong> people
        </span>
      </span>

      <h3 className={styles.blockName}>{team.short}</h3>
      <p className={styles.blockRole}>{team.mission}</p>

      <span className={styles.previewRow}>
        {preview.map((p) => (
          <span key={p.id} className={styles.previewAvatar}>
            <Avatar person={p} size={38} />
          </span>
        ))}
        {extra > 0 && <span className={styles.previewMore}>+{extra}</span>}
      </span>

      <span className={styles.blockCta}>
        View team <ArrowRightIcon width={16} height={16} />
      </span>
    </motion.button>
  )
}

/** Avatar size + style class per visual tier — three sizes only. */
const avatarSize: Record<RoleVariant, number> = {
  lead: 64,
  highlight: 52,
  standard: 42,
}
const gridClass: Record<RoleVariant, string> = {
  lead: styles.gridLead,
  highlight: styles.gridHighlight,
  standard: styles.gridStandard,
}
const cardClass: Record<RoleVariant, string> = {
  lead: styles.cardLead,
  highlight: styles.cardHighlight,
  standard: styles.cardStandard,
}

/**
 * Team board: renders each section from `teamSections` at one of three tiers.
 * Lead → large premium card; highlight → medium cards (Program Managers only);
 * standard → equal-size cards for everyone else, ordered by the section's role
 * groups then sortOrder. Hierarchy comes entirely from the data — no team or
 * role is hardcoded by name here.
 */
function TeamPanel({ team, onSelect }: { team: Team; onSelect: (p: Person) => void }) {
  const reduce = useReducedMotion()
  const item = reduce ? plainUp : staggerItem
  const Icon = teamIcons[team.icon]
  const members = membersOf(team.id)
  const sections = teamSections[team.id]
  const style = {
    '--accent': `var(${team.accentVar})`,
    '--accent-glow': `var(${team.accentGlowVar})`,
  } as CSSProperties

  return (
    <motion.div
      className={styles.panel}
      style={style}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: easeOut }}
    >
      <header className={styles.detailHead}>
        <span className={styles.detailIcon} aria-hidden>
          <Icon width={28} height={28} />
        </span>
        <div className={styles.detailHeadText}>
          <span className={styles.detailCode}>
            {team.codename} · {members.length} people
          </span>
          <h3 className={styles.detailName}>{team.name}</h3>
          <p className={styles.detailMission}>{team.mission}</p>
        </div>
      </header>

      <div className={styles.facets}>
        {team.facets.map((f) => (
          <div key={f.title} className={styles.facet}>
            <span className={styles.facetTitle}>{f.title}</span>
            <span className={styles.facetDesc}>{f.desc}</span>
          </div>
        ))}
      </div>

      {sections.map((section) => {
        const orderIndex = new Map(section.roleGroups.map((g, i) => [g, i]))
        const group = members
          .filter((p) => orderIndex.has(p.roleGroup))
          .sort((a, b) => {
            const byRole =
              (orderIndex.get(a.roleGroup) ?? 0) - (orderIndex.get(b.roleGroup) ?? 0)
            return byRole !== 0 ? byRole : (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
          })
        if (group.length === 0) return null
        return (
          <section className={styles.group} key={section.label}>
            <div className={styles.groupLabel}>
              <span className={styles.groupName}>{section.label}</span>
              {group.length > 1 && <span className={styles.groupCount}>{group.length}</span>}
            </div>
            <motion.div
              className={`${styles.grid} ${gridClass[section.variant]}`}
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {group.map((p) => (
                <motion.div key={p.id} variants={item}>
                  <PersonCard person={p} variant={section.variant} onSelect={onSelect} />
                </motion.div>
              ))}
            </motion.div>
          </section>
        )
      })}
    </motion.div>
  )
}

function PersonCard({
  person,
  variant,
  onSelect,
}: {
  person: Person
  variant: RoleVariant
  onSelect: (p: Person) => void
}) {
  const showSuper = variant === 'lead' || variant === 'highlight'
  return (
    <button
      type="button"
      className={`${styles.card} ${cardClass[variant]}`}
      onClick={() => onSelect(person)}
      aria-label={`Open profile of ${person.name}, ${person.role}`}
    >
      <span className={styles.cardAvatar}>
        <Avatar person={person} size={avatarSize[variant]} />
      </span>
      <span className={styles.cardText}>
        <span className={styles.cardName}>{person.name}</span>
        <span className={styles.cardRole}>{person.role}</span>
        {showSuper && <span className={styles.cardSuper}>{person.superpower}</span>}
      </span>
      {variant === 'lead' && (
        <span className={styles.cardCta}>
          Read profile <ArrowRightIcon width={15} height={15} />
        </span>
      )}
      <span className={styles.rowArrow} aria-hidden>
        →
      </span>
    </button>
  )
}
