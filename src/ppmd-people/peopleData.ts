/**
 * AUTHORITATIVE TEAM ROSTER — exact team sizes and role structure.
 * Names are placeholders (no real personal names); bios/contributions/
 * facts are PLACEHOLDER text. The counts and roles are NOT placeholders:
 *
 *   Project Management  — 16 people (3 leadership functions)
 *   Process & Procedures — 11 people (1 leadership function)
 *   BPT & Testing        —  7 people (1 leadership function)
 *   TOTAL                — 34 people
 *
 * The Senior Director and Department Head live in leadershipData.ts and
 * are NOT part of this roster. Rendered profiles and displayed counts
 * always derive from these records — nothing decorative.
 */
import type { Person, PersonLevel } from './peopleTypes'

const TEAM_ACCENTS: Record<string, string> = {
  'Project Management': '#ff6e79',
  'Process & Procedures': '#e8c188',
  'BPT & Testing': '#7cc4ff',
}

/** Authoritative leadership functions per team. */
export const TEAM_LEADERSHIP_EXPECTED: Record<string, number> = {
  'Project Management': 3,
  'Process & Procedures': 1,
  'BPT & Testing': 1,
}

/** Authoritative team sizes. */
export const TEAM_SIZE_EXPECTED: Record<string, number> = {
  'Project Management': 16,
  'Process & Procedures': 11,
  'BPT & Testing': 7,
}
export const TOTAL_EXPECTED = 34

function person(
  id: string,
  name: string,
  role: string,
  team: string,
  level: PersonLevel,
  displayOrder: number,
  leadershipOrder?: number,
): Person {
  return {
    id,
    name, /* PLACEHOLDER name — replace with the real colleague */
    role,
    team,
    shortBio: 'Short biography placeholder describing experience and focus within the department.', /* PLACEHOLDER */
    keyContribution: 'Key contribution placeholder.', /* PLACEHOLDER */
    personalFact: 'Personal fact placeholder.', /* PLACEHOLDER */
    accent: TEAM_ACCENTS[team],
    isLeadership: level === 'team-lead',
    leadershipLevel: level,
    leadershipOrder,
    displayOrder,
  }
}

const PM = 'Project Management'
const PROC = 'Process & Procedures'
const BPT = 'BPT & Testing'

export const PEOPLE: Person[] = [
  /* ── Project Management — 16 people, 3 leadership functions ── */
  person('PM-001', 'Project Team Lead', 'Team Leader', PM, 'team-lead', 1, 1),
  person('PM-002', 'Program Manager 01', 'Program Manager', PM, 'team-lead', 2, 2),
  person('PM-003', 'Program Manager 02', 'Program Manager', PM, 'team-lead', 3, 3),
  person('PM-004', 'Senior Project Manager', 'Senior Project Manager', PM, 'team-member', 4),
  person('PM-005', 'Project Manager 01', 'Project Manager', PM, 'team-member', 5),
  person('PM-006', 'Project Manager 02', 'Project Manager', PM, 'team-member', 6),
  person('PM-007', 'Project Manager 03', 'Project Manager', PM, 'team-member', 7),
  person('PM-008', 'Project Manager 04', 'Project Manager', PM, 'team-member', 8),
  person('PM-009', 'Project Manager 05', 'Project Manager', PM, 'team-member', 9),
  person('PM-010', 'Project Manager 06', 'Project Manager', PM, 'team-member', 10),
  person('PM-011', 'Project Manager 07', 'Project Manager', PM, 'team-member', 11),
  person('PM-012', 'Project Manager 08', 'Project Manager', PM, 'team-member', 12),
  person('PM-013', 'Project Manager 09', 'Project Manager', PM, 'team-member', 13),
  person('PM-014', 'Project Manager 10', 'Project Manager', PM, 'team-member', 14),
  person('PM-015', 'Junior Project Manager 01', 'Junior Project Manager', PM, 'team-member', 15),
  person('PM-016', 'Junior Project Manager 02', 'Junior Project Manager', PM, 'team-member', 16),

  /* ── Process & Procedures — 11 people, 1 leadership function ── */
  person('PROC-001', 'Process Team Lead', 'Team Leader', PROC, 'team-lead', 1, 1),
  person('PROC-002', 'Knowledge Management Manager', 'Knowledge Management Manager', PROC, 'team-member', 2),
  person('PROC-003', 'Senior Expert', 'Senior Expert', PROC, 'team-member', 3),
  person('PROC-004', 'Expert 01', 'Expert', PROC, 'team-member', 4),
  person('PROC-005', 'Expert 02', 'Expert', PROC, 'team-member', 5),
  person('PROC-006', 'Expert 03', 'Expert', PROC, 'team-member', 6),
  person('PROC-007', 'Expert 04', 'Expert', PROC, 'team-member', 7),
  person('PROC-008', 'Senior Specialist 01', 'Senior Specialist', PROC, 'team-member', 8),
  person('PROC-009', 'Senior Specialist 02', 'Senior Specialist', PROC, 'team-member', 9),
  person('PROC-010', 'Senior Specialist 03', 'Senior Specialist', PROC, 'team-member', 10),
  person('PROC-011', 'Specialist', 'Specialist', PROC, 'team-member', 11),

  /* ── BPT & Testing — 7 people, 1 leadership function ── */
  person('BPT-001', 'BPT Team Lead', 'Team Leader', BPT, 'team-lead', 1, 1),
  person('BPT-002', 'Expert', 'Expert', BPT, 'team-member', 2),
  person('BPT-003', 'Senior Specialist 01', 'Senior Specialist', BPT, 'team-member', 3),
  person('BPT-004', 'Senior Specialist 02', 'Senior Specialist', BPT, 'team-member', 4),
  person('BPT-005', 'Senior Specialist 03', 'Senior Specialist', BPT, 'team-member', 5),
  person('BPT-006', 'Senior Specialist 04', 'Senior Specialist', BPT, 'team-member', 6),
  person('BPT-007', 'Specialist', 'Specialist', BPT, 'team-member', 7),
]

/** Team roster, leadership first, then exact display order. */
export function peopleByTeam(team: string): Person[] {
  return PEOPLE.filter((p) => p.team === team).sort((a, b) => {
    if (a.isLeadership !== b.isLeadership) return a.isLeadership ? -1 : 1
    if (a.isLeadership && b.isLeadership) {
      return (a.leadershipOrder ?? 99) - (b.leadershipOrder ?? 99)
    }
    return a.displayOrder - b.displayOrder
  })
}

export function teamCount(team: string): number {
  return PEOPLE.filter((p) => p.team === team).length
}

/**
 * Development-time sanity check: warns (never throws) when the roster
 * disagrees with the authoritative structure. Safe in production.
 */
export function validatePeopleData(): void {
  const ids = new Set<string>()
  for (const p of PEOPLE) {
    if (ids.has(p.id)) console.warn(`[peopleData] Duplicate person id: ${p.id}`)
    ids.add(p.id)
  }
  if (PEOPLE.length !== TOTAL_EXPECTED) {
    console.warn(`[peopleData] Total roster is ${PEOPLE.length}, expected ${TOTAL_EXPECTED}.`)
  }
  for (const [team, expected] of Object.entries(TEAM_SIZE_EXPECTED)) {
    const actual = teamCount(team)
    if (actual !== expected) {
      console.warn(`[peopleData] ${team}: ${actual} people, expected ${expected}.`)
    }
  }
  for (const [team, expected] of Object.entries(TEAM_LEADERSHIP_EXPECTED)) {
    const actual = PEOPLE.filter((p) => p.team === team && p.isLeadership).length
    if (actual !== expected) {
      console.warn(
        `[peopleData] ${team}: ${actual} leadership function(s), expected ${expected}.`,
      )
    }
  }
}
