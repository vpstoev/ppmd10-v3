/**
 * Content and scroll choreography for "Projects that Shaped the Decade".
 * ALL project copy lives here (placeholder wording) so it can be replaced
 * later without touching component structure.
 */
import type { MorphSpan, Project } from './projectTypes'

export const PROJECTS_VH = 760

/** Palette continuity with the rest of the experience. */
export const INK = '#07070c'
export const IVORY = '#f5efe4'
export const P_CORAL = '#ff6e79'
export const P_VIOLET = '#9d6bff'
export const P_ICE = '#7cc4ff'
export const P_CHAMPAGNE = '#e8c188'
export const P_WHITE = '#fff1e0'

export const TITLE_OUT: readonly [number, number] = [0.075, 0.115]
export const CLOSING_LINE1_IN: readonly [number, number] = [0.92, 0.95]
export const CLOSING_LINE2_IN: readonly [number, number] = [0.945, 0.98]

export const PROJECTS: Project[] = [
  {
    num: '01 / 06',
    bigNum: '01',
    name: '3G SUNSET',
    category: 'Network Transformation',
    description:
      'Coordinating a complex transition across technology, business, operations and customer-facing teams.',
    impact: 'Transforming critical infrastructure while protecting continuity and customer experience.',
    accent: '#f2b183', /* champagne warmed by coral */
    reveal: 'mask',
    side: 'left',
    window: [0.1, 0.15, 0.21, 0.26],
  },
  {
    num: '02 / 06',
    bigNum: '02',
    name: '5G IMPLEMENTATION',
    category: 'Strategic Technology Delivery',
    description:
      'Supporting the coordinated introduction of a new generation of connectivity across multiple delivery areas.',
    impact: 'Turning a strategic technology ambition into coordinated execution.',
    accent: '#8f9df5', /* ice meeting violet */
    reveal: 'clip',
    side: 'right',
    window: [0.24, 0.29, 0.35, 0.4],
  },
  {
    num: '03 / 06',
    bigNum: '03',
    name: 'VOICE OVER WI-FI',
    category: 'Customer Experience',
    description:
      'Connecting technical implementation, business readiness and customer-facing processes around a new service.',
    impact: 'Bringing technology and customer value together.',
    accent: P_ICE,
    reveal: 'depth',
    side: 'left',
    window: [0.38, 0.43, 0.49, 0.54],
  },
  {
    num: '04 / 06',
    bigNum: '04',
    name: 'SAP S/4HANA — MONBAT',
    category: 'Enterprise Transformation',
    description:
      'Managing complex delivery dependencies across business processes, technology and organisational stakeholders.',
    impact: 'Creating structure around large-scale enterprise change.',
    accent: '#d76ea8', /* violet–coral blend */
    reveal: 'mask',
    side: 'right',
    window: [0.52, 0.57, 0.63, 0.68],
  },
  {
    num: '05 / 06',
    bigNum: '05',
    name: 'BULGARIAN CUSTOMS AGENCY',
    category: 'Public Sector Delivery',
    description:
      'Supporting the delivery of complex solutions in a regulated environment with multiple stakeholders and dependencies.',
    impact: 'Structured delivery where precision and accountability matter most.',
    accent: P_CHAMPAGNE,
    reveal: 'clip',
    side: 'left',
    window: [0.66, 0.71, 0.77, 0.82],
  },
  {
    num: '06 / 06',
    bigNum: '06',
    name: 'ENTITLEMENT SERVER PROGRAM',
    category: 'Multi-Country Programme',
    description:
      'Coordinating countries, vendors, governance and interconnected workstreams within a shared programme environment.',
    impact: 'Creating alignment across borders, systems and delivery teams.',
    accent: '#c490d9', /* partial iridescent */
    iridescent: true,
    reveal: 'depth',
    side: 'right',
    window: [0.8, 0.85, 0.9, 0.945],
  },
]

/**
 * Particle-shape morph schedule: 8 shapes (intro constellations, six
 * project structures, closing convergence) morphing sequentially.
 */
export const MORPHS: MorphSpan[] = [
  { a: 0.08, b: 0.145 }, /* constellations → 3G ring */
  { a: 0.22, b: 0.285 }, /* ring → 5G waves */
  { a: 0.36, b: 0.425 }, /* waves → coverage arcs */
  { a: 0.5, b: 0.565 }, /* arcs → enterprise lattice */
  { a: 0.64, b: 0.705 }, /* lattice → precision paths */
  { a: 0.78, b: 0.845 }, /* paths → connected clusters */
  { a: 0.9, b: 0.95 }, /* clusters → one convergence */
]

/** Ambient wobble amplitude per shape (indexed like the shapes). */
export const SHAPE_AMPS = [0.1, 0.03, 0.07, 0.06, 0.022, 0.02, 0.045, 0.06]
