import type { RoleSection, Team, TeamId } from './types'

export const teams: Team[] = [
  {
    id: 'pm',
    name: 'Project Management Team',
    short: 'Project Management',
    codename: 'PM.module',
    accentVar: '--team-pm',
    accentGlowVar: '--team-pm-glow',
    accentHex: '#ff3340',
    icon: 'compass',
    mission:
      'We turn ambition into delivery — owning projects from first idea to launch, and keeping people aligned the whole way.',
    story:
      'From a single idea to a launch the whole company can rely on — we carry the work, and the people, all the way through.',
    contributions: [
      'End-to-end project ownership',
      'Planning, scope & risk management',
      'Stakeholder alignment',
      'On-time, on-value delivery',
    ],
    facets: [
      {
        title: 'Delivery',
        desc: 'End-to-end ownership from kickoff to launch, with scope, time and value kept in balance.',
      },
      {
        title: 'Coordination',
        desc: 'The right people in the room at the right moment, across every function.',
      },
      {
        title: 'Governance',
        desc: 'Clean decisions and handovers, on a delivery framework the department trusts.',
      },
    ],
  },
  {
    id: 'pp',
    name: 'Process & Procedures Management Team',
    short: 'Process & Procedures',
    codename: 'PP.module',
    accentVar: '--team-pp',
    accentGlowVar: '--team-pp-glow',
    accentHex: '#d6248f',
    icon: 'governance',
    mission:
      'We give the organization a backbone — clear, trusted processes that make complex work feel simple.',
    story:
      'We turn how-we-work into something written down, trusted and shared — so good practice outlives any one project.',
    contributions: [
      'Process design & documentation',
      'Procedure governance',
      'Standardization & compliance',
      'Continuous process improvement',
    ],
    facets: [
      {
        title: 'Structure',
        desc: 'A backbone of clear, documented processes the whole company can rely on.',
      },
      {
        title: 'Standards',
        desc: 'Shared procedures and governance that keep complex work consistent.',
      },
      {
        title: 'Optimization',
        desc: 'Continuous improvement — every cycle a little simpler than the last.',
      },
    ],
  },
  {
    id: 'bpt',
    name: 'BPT and Testing Team',
    short: 'BPT & Testing',
    codename: 'BPT.module',
    accentVar: '--team-bpt',
    accentGlowVar: '--team-bpt-glow',
    accentHex: '#ff7a45',
    icon: 'testing',
    mission:
      'We rethink how work gets done and stand behind every release — because quality is a promise, not a final step.',
    story:
      'We rethink the work and stand behind every release — because the last check before a customer reaches it is ours to make.',
    contributions: [
      'Business process transformation',
      'Test strategy & execution',
      'Quality assurance',
      'Automation & validation',
    ],
    facets: [
      {
        title: 'Quality',
        desc: 'A promise, not a final step — quality is built into every release we stand behind.',
      },
      {
        title: 'Validation',
        desc: 'Test strategy and automation that catch issues before customers ever do.',
      },
      {
        title: 'Transformation',
        desc: 'Rethinking how work gets done — simplifying and modernizing core flows.',
      },
    ],
  },
]

/** Quick lookup by id — used across people, messages and flow data. */
export const teamsById = Object.fromEntries(teams.map((t) => [t.id, t])) as Record<
  Team['id'],
  Team
>

/**
 * How each team's roster is grouped and ranked on the team board. Ordered top
 * (most senior) to bottom; `variant` picks the visual tier. This is the only
 * place team hierarchy is described — the component renders from it, so the
 * exact org structure lives in data, not in JSX.
 */
export const teamSections: Record<TeamId, RoleSection[]> = {
  // PM: Team Lead (large) → Program Managers (medium) → all PM-type roles equal,
  // ordered Senior PM → Project Managers → Junior PMs.
  pm: [
    { roleGroups: ['teamLead'], label: 'Team Lead', variant: 'lead' },
    { roleGroups: ['programManager'], label: 'Program Managers', variant: 'highlight' },
    {
      roleGroups: ['seniorProjectManager', 'projectManager', 'juniorProjectManager'],
      label: 'Project Managers',
      variant: 'standard',
    },
  ],
  // PP: Team Lead (large) → everyone else equal, ordered KM Manager → Senior
  // Expert → Experts → Senior Specialists → Specialist.
  pp: [
    { roleGroups: ['teamLead'], label: 'Team Lead', variant: 'lead' },
    {
      roleGroups: [
        'knowledgeManagementManager',
        'seniorExpert',
        'expert',
        'seniorSpecialist',
        'specialist',
      ],
      label: 'Team Members',
      variant: 'standard',
    },
  ],
  // BPT: Team Lead (large) → everyone else equal, ordered Expert → Senior
  // Specialists → Specialist.
  bpt: [
    { roleGroups: ['teamLead'], label: 'Team Lead', variant: 'lead' },
    {
      roleGroups: ['expert', 'seniorSpecialist', 'specialist'],
      label: 'Team Members',
      variant: 'standard',
    },
  ],
}
