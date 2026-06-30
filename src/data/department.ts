import type { Pillar } from './types'

export const department = {
  company: 'A1',
  name: 'Project & Processes Management Department',
  short: 'PPMD',
  anniversary: 10,
  tagline: 'Ten years of delivery, structure and quality — and the people behind all of it',
  intro:
    "For ten years, the people in this department have turned ambiguity into clarity — bringing structure to complex work, taking ownership when it counts, and trusting each other to deliver. We're proud to do it as part of A1.",
}

/** What the department does — shown as animated cards. */
export const pillars: Pillar[] = [
  {
    icon: 'delivery',
    title: 'Project Delivery',
    description:
      'We take initiatives from kickoff to launch and own the outcome — keeping scope, time and value in balance, and people in the loop.',
  },
  {
    icon: 'governance',
    title: 'Process & Procedure Governance',
    description:
      'We design and care for the processes the company runs on, so good practice is shared rather than reinvented.',
  },
  {
    icon: 'transform',
    title: 'Business Process Transformation',
    description:
      'We question how work is done today and reshape it — simplifying and modernizing alongside the people who use it.',
  },
  {
    icon: 'quality',
    title: 'Testing & Quality Assurance',
    description:
      'We stand behind what we ship. Careful testing protects our customers, our colleagues and our name.',
  },
  {
    icon: 'coordination',
    title: 'Cross-functional Coordination',
    description:
      'We bring the right people together at the right moment, so teams across A1 move as one.',
  },
]
