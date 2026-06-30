import type { WallMessage } from './types'

/**
 * "Voices from the Organization" — PLACEHOLDER testimonials.
 *
 * These must come from colleagues OUTSIDE PPMD (other departments / the wider
 * company), not from the team itself. The point is external recognition: how
 * the rest of A1 experiences working with the department. Replace the text,
 * names, roles and departments below with real quotes collected from across the
 * organization. `category` drives the color-coded tag on each card.
 */
export const messages: WallMessage[] = [
  {
    text: 'Placeholder — a colleague from another department on what it’s like to have PPMD run a project for them. Replace with a real quote about delivery.',
    author: 'Colleague Name',
    role: 'Head of Marketing',
    department: 'Marketing',
    relationship: 'Worked with PPMD on a major campaign launch',
    category: 'delivery',
  },
  {
    text: 'Placeholder — a stakeholder describing how PPMD brought structure and calm to a complex, cross-team effort. Replace with a real quote.',
    author: 'Colleague Name',
    role: 'Head of Network Engineering',
    department: 'Technology',
    relationship: 'Partnered with PPMD on an infrastructure rollout',
    category: 'collaboration',
  },
  {
    text: 'Placeholder — a partner team on how dependable PPMD’s processes and documentation made their own work. Replace with a real quote.',
    author: 'Colleague Name',
    role: 'Operations Lead',
    department: 'Customer Operations',
    relationship: 'Relied on PPMD process governance day to day',
    category: 'support',
  },
  {
    text: 'Placeholder — a colleague on the quality bar PPMD held and the issues caught before they reached customers. Replace with a real quote.',
    author: 'Colleague Name',
    role: 'Product Owner',
    department: 'Digital Products',
    relationship: 'Shipped releases validated by PPMD testing',
    category: 'quality',
  },
  {
    text: 'Placeholder — a long-standing partner reflecting on ten years of working alongside the department. Replace with a real quote.',
    author: 'Colleague Name',
    role: 'Head of Finance',
    department: 'Finance',
    relationship: 'A decade of cross-department initiatives with PPMD',
    category: 'partnership',
  },
  {
    text: 'Placeholder — a colleague on how PPMD coordinated many moving parts and kept everyone aligned. Replace with a real quote.',
    author: 'Colleague Name',
    role: 'Head of IT Service Management',
    department: 'IT',
    relationship: 'Co-delivered a company-wide systems change',
    category: 'collaboration',
  },
  {
    text: 'Placeholder — a stakeholder on PPMD’s reliability and ownership when things got difficult. Replace with a real quote about support.',
    author: 'Colleague Name',
    role: 'Head of Customer Care',
    department: 'Customer Care',
    relationship: 'Supported by PPMD through a critical migration',
    category: 'support',
  },
  {
    text: 'Placeholder — a colleague on a project PPMD took from idea to launch on time and on value. Replace with a real quote about delivery.',
    author: 'Colleague Name',
    role: 'Head of Sales Operations',
    department: 'Sales',
    relationship: 'Had a key initiative delivered by PPMD',
    category: 'delivery',
  },
]
