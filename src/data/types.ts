/** Shared identifiers and shapes for the anniversary site data. */

export type TeamId = 'pm' | 'pp' | 'bpt'

export interface Team {
  id: TeamId
  name: string
  short: string
  /** Short codename shown in the OS / universe UI (e.g. "PM.module"). */
  codename: string
  /** CSS custom-property names driving the team's accent color. */
  accentVar: string
  accentGlowVar: string
  /** Plain hex, handy for inline SVG / canvas use. */
  accentHex: string
  icon: 'compass' | 'governance' | 'testing'
  mission: string
  /** One evocative line shown in the team's scroll chapter. */
  story: string
  contributions: string[]
  /** Three headline capabilities, used by the distinct team-module layouts. */
  facets: { title: string; desc: string }[]
}

export interface Pillar {
  icon: 'delivery' | 'governance' | 'transform' | 'quality' | 'coordination'
  title: string
  description: string
}

/** Org role group — the single source of truth for the team board's hierarchy. */
export type RoleGroup =
  | 'headOfDepartment'
  | 'teamLead'
  | 'programManager'
  | 'seniorProjectManager'
  | 'projectManager'
  | 'juniorProjectManager'
  | 'knowledgeManagementManager'
  | 'seniorExpert'
  | 'expert'
  | 'seniorSpecialist'
  | 'specialist'

export interface Person {
  id: string
  name: string
  team: TeamId
  role: string
  /** Drives grouping + visual tier on the team board (never the name). */
  roleGroup: RoleGroup
  /** 0 = Head of Department, 1 = Team Lead, rising number = less senior. */
  hierarchyLevel: number
  /** Stable order within a team, as listed in the structure. */
  sortOrder?: number
  /** Subtle, optional status (e.g. 'On leave'). Never hides or downgrades. */
  status?: string
  superpower: string
  funFact: string
  contribution: string
  /** Short 10-year message / quote placeholder. */
  quote: string
  /** Optional image path; falls back to initials avatar when absent. */
  photo?: string
}

/** Visual tier a section renders at. Only three sizes — large / medium / equal. */
export type RoleVariant = 'lead' | 'highlight' | 'standard'

/** One labeled section on a team board. May span several role groups, which
 *  are rendered as equal-size cards in the listed order (then by sortOrder). */
export interface RoleSection {
  roleGroups: RoleGroup[]
  label: string
  variant: RoleVariant
}

export interface Milestone {
  year: string
  title: string
  description: string
  /** Headline moments get a larger node + card in the journey timeline. */
  major?: boolean
}

export interface FlowStep {
  /** Short node label shown on the flow rail, e.g. "Request". */
  label: string
  title: string
  description: string
  team: TeamId | 'all'
}

/** Theme of an external testimonial, used for the card's color-coded tag. */
export type FeedbackCategory =
  | 'delivery'
  | 'collaboration'
  | 'support'
  | 'quality'
  | 'partnership'

/**
 * A message of appreciation from a colleague OUTSIDE PPMD — someone across the
 * wider organization who has worked with the department.
 */
export interface WallMessage {
  text: string
  author: string
  /** Author's job title, e.g. "Head of Marketing". */
  role: string
  /** The author's own department/unit — i.e. NOT PPMD. */
  department: string
  /** How they worked with PPMD, e.g. "Partnered on the billing migration". */
  relationship: string
  category: FeedbackCategory
}
