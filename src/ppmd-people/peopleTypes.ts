/** Types for the people rosters. */

export type PersonLevel = 'team-lead' | 'team-member'

export interface Person {
  id: string
  name: string
  role: string
  team: string
  /** Optional — when absent, a rectangular abstract identity marker is used. */
  photo?: string
  photoAlt?: string
  /** CSS object-position, e.g. "center", "top", "50% 25%". */
  photoPosition?: string
  shortBio: string
  keyContribution: string
  personalFact: string
  accent: string
  isLeadership: boolean
  leadershipLevel: PersonLevel
  /** Order among the team's leadership functions (leads only). */
  leadershipOrder?: number
  /** Deterministic layout order within the team. */
  displayOrder: number
}

/** Kind of profile shown in the shared detail dialog. */
export type ProfileType = 'senior-director' | 'department-head' | 'team-leadership' | 'team-member'

/**
 * Normalized shape consumed by the ONE shared profile-detail dialog —
 * leadership records and employee records both map into this.
 */
export interface ProfileDetailData {
  id: string
  /** Small label above the name (SENIOR DIRECTOR, TEAM LEAD, role, …). */
  label: string
  name: string
  /** Exact role / position. */
  role: string
  /** Team or organisational unit. */
  unit: string
  profileType: ProfileType
  photo?: string
  photoAlt?: string
  photoPosition?: string
  shortBio?: string
  quote?: string
  keyContribution?: string
  personalFact?: string
  accent: string
}
