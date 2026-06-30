import type { FlowStep } from './types'

/**
 * How the three teams collaborate — one continuous cycle, rendered as a
 * connected flow that loops back into itself.
 * Edit freely: `label` is the short node caption, `team` colors the node
 * ('all' = whole department / shared red).
 */
export const flow: FlowStep[] = [
  {
    label: 'Request',
    title: 'Idea & request intake',
    description: 'A need, idea or request enters the department and is captured.',
    team: 'pm',
  },
  {
    label: 'Analysis',
    title: 'Analysis & framing',
    description: 'We size the work, surface risks and define what success means.',
    team: 'pm',
  },
  {
    label: 'Planning',
    title: 'Planning & ownership',
    description: 'Scope, timeline and ownership take shape into a realistic plan.',
    team: 'pm',
  },
  {
    label: 'Process alignment',
    title: 'Process alignment',
    description: 'We align the work with existing processes, standards and governance.',
    team: 'pp',
  },
  {
    label: 'Delivery',
    title: 'Delivery coordination',
    description: 'Cross-functional delivery is orchestrated across all three teams.',
    team: 'all',
  },
  {
    label: 'Testing',
    title: 'Testing & validation',
    description: 'We validate quality and catch issues before anything ships.',
    team: 'bpt',
  },
  {
    label: 'Launch',
    title: 'Launch & go-live',
    description: 'We go live — measured, controlled and ready for customers.',
    team: 'all',
  },
  {
    label: 'Improvement',
    title: 'Continuous improvement',
    description: 'We measure, learn and feed every lesson back into the next cycle.',
    team: 'pp',
  },
]
