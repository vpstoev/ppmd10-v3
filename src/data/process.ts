import type { TeamId } from './types'

/**
 * "From Request to Impact" — the six stages every initiative travels through.
 * `lead` is the team that owns the stage; `support` are the teams that assist;
 * `value` is the concrete result the stage produces. Edit freely.
 */
export interface ProcessStep {
  title: string
  what: string
  lead: TeamId | 'all'
  support: (TeamId | 'all')[]
  value: string
}

export const processSteps: ProcessStep[] = [
  {
    title: 'Request / Business Need',
    what: 'A need, idea or request from the business arrives and is captured, framed and understood.',
    lead: 'pm',
    support: ['pp'],
    value: 'Nothing slips through — every request has an owner from day one.',
  },
  {
    title: 'Analysis & Planning',
    what: 'We size the work, surface risks, and shape scope, timeline and ownership into a realistic plan.',
    lead: 'pm',
    support: ['pp', 'bpt'],
    value: 'A clear, agreed plan the whole team can commit to.',
  },
  {
    title: 'Process Alignment',
    what: 'The work is aligned with company processes, standards and governance before it scales.',
    lead: 'pp',
    support: ['pm'],
    value: 'Consistency and compliance — without reinventing the wheel.',
  },
  {
    title: 'Delivery Coordination',
    what: 'Cross-functional delivery is orchestrated across all three teams and the wider business.',
    lead: 'all',
    support: ['pm'],
    value: 'Many moving parts, moving as one.',
  },
  {
    title: 'Testing & Validation',
    what: 'Quality is validated and issues are caught and resolved before anything reaches a customer.',
    lead: 'bpt',
    support: ['pm'],
    value: 'What ships is what we are proud to stand behind.',
  },
  {
    title: 'Launch & Continuous Improvement',
    what: 'We go live in a controlled way, then measure, learn and feed every lesson back in.',
    lead: 'all',
    support: ['pp'],
    value: 'Live results today — a stronger next cycle tomorrow.',
  },
]
