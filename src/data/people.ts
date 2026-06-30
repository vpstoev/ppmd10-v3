import type { Person, RoleGroup, TeamId } from './types'

/**
 * Roster generated from each team's REAL role structure (counts + role groups
 * below). Names are placeholders ("Team Member N") — only swap the `name`
 * (and add `photo`/`status`) when the real people are known. The role groups,
 * counts and ordering already match the org structure, so the team board
 * renders the correct hierarchy today.
 */

const superpowers = [
  'Seeing the whole board ten moves ahead',
  'Turning chaos into a clear roadmap',
  'Keeping calm when timelines get loud',
  'Finding the simplest version of any process',
  'Spotting the bottleneck before it forms',
  'Breaking things on purpose, gracefully',
  'Noticing the pixel everyone else missed',
  'Asking the one question everyone forgot',
  'Redesigning the wheel so it actually rolls',
  'Infinite patience for edge cases',
  'Making hard decisions feel obvious',
  'Reading between the lines of every request',
]

const funFacts = [
  'Has a color-coded plan for absolutely everything.',
  'Can estimate any task to the nearest coffee break.',
  'Believes every problem fits on a single sticky note.',
  'Owns more flowchart templates than anyone alive.',
  'Once mapped a 40-step process onto a napkin.',
  'Keeps a “hall of fame” of the best bugs ever found.',
  'Names every test environment after a planet.',
  'Joined as an intern and never left.',
  'Automated three of their own daily routines.',
  'Refuses to let any document go un-versioned.',
  'Dreams in test cases.',
  'Still has notes from the very first project.',
]

const contributions = [
  'Set up the delivery framework the whole department still runs on.',
  'Led some of the largest cross-company initiatives end to end.',
  'Brought structure to fast-moving, high-pressure launches.',
  'Built the governance model that keeps the company consistent.',
  'Standardized procedures across multiple business units.',
  'Established the test strategy that protects every release.',
  'Built the automation suite that runs before every launch.',
  'Modernized how we track progress across active projects.',
  'Drove continuous-improvement reviews company-wide.',
  'Led transformation projects that reshaped core operations.',
  'Expanded coverage into areas no one used to test.',
  'Mentored half the people who joined after them.',
]

const quotes = [
  'Ten years, countless projects — and the best is still ahead of us.',
  'Great delivery is invisible — you only notice when it’s missing.',
  'The team makes the deadline — the plan just shows the way.',
  'Good process gives people freedom, not friction.',
  'Clarity is a gift you give the next person in the chain.',
  'Quality isn’t a phase — it’s a habit we built together.',
  'If it can break, we’ll find it before our customers do.',
  'Proud to have grown up inside this department.',
  'Change is easier when you bring everyone with you.',
  'Every process we fix saves someone an hour, every day.',
  'Best team I’ve ever worked with — we have each other’s backs.',
  'Ten years in, still excited by a green test run.',
]

/** One row of a team's real structure: a role group, its title and how many. */
interface RoleSpec {
  roleGroup: RoleGroup
  role: string
  count: number
  /** 1 = Team Lead, rising number = less senior. */
  level: number
}

/** Exact team structures (counts + groups), ordered most senior first. */
const teamSpecs: Record<TeamId, RoleSpec[]> = {
  pm: [
    { roleGroup: 'teamLead', role: 'Team Lead', count: 1, level: 1 },
    { roleGroup: 'programManager', role: 'Program Manager', count: 2, level: 2 },
    { roleGroup: 'seniorProjectManager', role: 'Senior Project Manager', count: 1, level: 3 },
    { roleGroup: 'projectManager', role: 'Project Manager', count: 10, level: 4 },
    { roleGroup: 'juniorProjectManager', role: 'Junior Project Manager', count: 2, level: 4 },
  ],
  pp: [
    { roleGroup: 'teamLead', role: 'Team Lead', count: 1, level: 1 },
    { roleGroup: 'knowledgeManagementManager', role: 'Knowledge Management Manager', count: 1, level: 2 },
    { roleGroup: 'seniorExpert', role: 'Senior Expert', count: 1, level: 2 },
    { roleGroup: 'expert', role: 'Expert', count: 4, level: 3 },
    { roleGroup: 'seniorSpecialist', role: 'Senior Specialist', count: 3, level: 3 },
    { roleGroup: 'specialist', role: 'Specialist', count: 1, level: 4 },
  ],
  bpt: [
    { roleGroup: 'teamLead', role: 'Team Lead', count: 1, level: 1 },
    { roleGroup: 'expert', role: 'Expert', count: 1, level: 2 },
    { roleGroup: 'seniorSpecialist', role: 'Senior Specialist', count: 4, level: 3 },
    { roleGroup: 'specialist', role: 'Specialist', count: 1, level: 4 },
  ],
}

let seq = 0
function buildTeam(team: TeamId): Person[] {
  const out: Person[] = []
  let withinTeam = 0
  for (const spec of teamSpecs[team]) {
    for (let i = 0; i < spec.count; i += 1) {
      seq += 1
      withinTeam += 1
      const n = seq
      out.push({
        id: `${team}-${withinTeam}`,
        name: `Team Member ${n}`,
        team,
        role: spec.role,
        roleGroup: spec.roleGroup,
        hierarchyLevel: spec.level,
        sortOrder: withinTeam,
        superpower: superpowers[n % superpowers.length],
        funFact: funFacts[n % funFacts.length],
        contribution: contributions[n % contributions.length],
        quote: quotes[n % quotes.length],
      })
    }
  }
  return out
}

export const people: Person[] = [
  ...buildTeam('pm'),
  ...buildTeam('pp'),
  ...buildTeam('bpt'),
]

/**
 * Head of Department — sits ABOVE the three teams and is intentionally NOT part
 * of the `people` roster, so it is never counted inside a team or rendered as a
 * member card. Shown only as the dedicated spotlight. Placeholder; replace name.
 */
export const head: Person = {
  id: 'head',
  name: 'Department Head',
  team: 'pm',
  role: 'Head of PPMD',
  roleGroup: 'headOfDepartment',
  hierarchyLevel: 0,
  superpower: 'Connecting three teams into one department',
  funFact: 'Has helped shape PPMD since its earliest days.',
  contribution:
    'Leads PPMD across project delivery, process excellence, business transformation and quality.',
  quote: 'Ten years of building a department that delivers — together. The best is still ahead.',
}
