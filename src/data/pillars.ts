import type { Pillar } from './types'

/**
 * The four things PPMD does — shown as department pillars under the hero.
 * `short` is the at-a-glance label; `title`/`description` carry the meaning.
 */
export interface DeptPillar extends Pillar {
  short: string
}

export const departmentPillars: DeptPillar[] = [
  {
    icon: 'delivery',
    short: 'Delivery',
    title: 'Project Delivery',
    description:
      'Structured coordination of initiatives, dependencies, stakeholders and execution.',
  },
  {
    icon: 'governance',
    short: 'Processes',
    title: 'Process Excellence',
    description:
      'Clear procedures, operating models and continuous improvement across the organization.',
  },
  {
    icon: 'transform',
    short: 'Transformation',
    title: 'Business Transformation',
    description:
      'Connecting business needs, systems, teams and change into a structured way of working.',
  },
  {
    icon: 'quality',
    short: 'Quality',
    title: 'Testing & Quality',
    description:
      'Validation, readiness and quality focus before changes reach real users and operations.',
  },
]
