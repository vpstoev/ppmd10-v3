/** Types for the Teams & People section. */

export interface TeamFact {
  /** PLACEHOLDER values like "XX" until real numbers are supplied. */
  value: string
  label?: string
}

export interface Team {
  id: string
  num: string
  name: string
  /** Header title for the team people chapter (no numbering). */
  rosterTitle: string
  /** One supporting line under the roster header — what this field is. */
  rosterLede: string
  headline: string
  description: string
  accent: string
  /** Editorial evidence: first fact renders larger than the rest. */
  facts: TeamFact[]
  distinctiveFact: string
  /** Expected number of leadership functions (validated against peopleData). */
  leadershipCount: number
  /** fadeWindow(p, a, b, c, d) for the team capability chapter. */
  window: readonly [number, number, number, number]
}

/** Organisational level of a leadership profile scene. */
export type LeadershipLevel = 'area' | 'department'

export interface LeadershipProfileData {
  id: string
  level: LeadershipLevel
  name: string
  title: string
  organisationalUnit: string
  statement: string
  statementEmphasis?: string[]
  /** What the scene communicates, e.g. "Area Vision". */
  sceneKicker: string
  photo?: string
  photoAlt?: string
  /** CSS object-position, e.g. "center", "top", "50% 25%". */
  photoPosition?: string
  quote?: string
  shortBio?: string
  shortBioEmphasis?: string[]
  keyContribution?: string
  keyContributionEmphasis?: string[]
  personalFact?: string
  personalFactEmphasis?: string[]
  accent: string
  displayOrder: number
}
