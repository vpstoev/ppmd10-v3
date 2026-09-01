/** Types for the people rosters. */

/**
 * `program-manager` sits between the two original levels: those people are
 * part of the team's leadership group (and render with the existing
 * leadership treatment) but are not the Team Leader.
 */
export type PersonLevel = 'team-lead' | 'program-manager' | 'team-member'

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
  /**
   * Descriptive copy is optional throughout, and that is deliberate: a
   * profile shows what is actually known about a person. A field with no
   * signed-off content is absent, never filled with a stand-in.
   */
  shortBio?: string
  shortBioEmphasis?: string[]
  /** One compact line for the roster card — shorter than `shortBio`. */
  cardBio?: string
  /** Optional pull quote; the shared dialog already renders one when set. */
  quote?: string
  keyContribution?: string
  keyContributionEmphasis?: string[]
  personalFact?: string
  personalFactEmphasis?: string[]
  accent: string
  isLeadership: boolean
  leadershipLevel: PersonLevel
  /** Order among the team's leadership functions (leads only). */
  leadershipOrder?: number
  /** Deterministic layout order within the team. */
  displayOrder: number
}

/**
 * Kind of profile shown in the shared detail dialog.
 *
 * `voice` is a testimonial rather than a colleague of the department:
 * same panel, same behaviour, and no portrait — the dialog already falls
 * back to a typographic monogram when a record has no photograph, which
 * is what these have.
 */
export type ProfileType =
  | 'senior-director'
  | 'department-head'
  | 'team-leadership'
  | 'team-member'
  | 'voice'

/**
 * Normalized shape consumed by the ONE shared profile-detail dialog —
 * leadership records and employee records both map into this.
 */
export interface ProfileDetailData {
  id: string
  /** Small label above the name (SENIOR DIRECTOR, TEAM LEAD, role, …). */
  label?: string
  name: string
  /** Exact role / position — absent while a title is unconfirmed. */
  role?: string
  /** Team or organisational unit. */
  unit: string
  profileType: ProfileType
  photo?: string
  photoAlt?: string
  photoPosition?: string
  shortBio?: string
  shortBioEmphasis?: string[]
  quote?: string
  keyContribution?: string
  keyContributionEmphasis?: string[]
  personalFact?: string
  personalFactEmphasis?: string[]
  accent: string
}
