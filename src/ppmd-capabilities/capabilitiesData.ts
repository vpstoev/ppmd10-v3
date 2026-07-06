/**
 * Content, palette and scroll choreography for the
 * "What PPMD makes possible" section. Shared by the WebGL stream visual
 * and the HTML text layer so both stay in sync.
 */
import { fadeWindow, smoothstep } from '../hg-hero/heroTheme'

export const SECTION_VH = 560

/** Same adapted premium palette as the Hero. */
export const SECTION_BG_LIGHT = '#f7f2e9' /* warm ivory */
export const SECTION_BG_DARK = '#07070c' /* deep ink */
export const STREAM_DARK = ['#ff6e79', '#9d6bff', '#7cc4ff', '#e8c188']
export const STREAM_LIGHT = ['#e0525e', '#7c4fe0', '#3f7fc4', '#b98a3a']

export interface Capability {
  num: string
  name: string
  headline: string
  support: string
  line: string
  accent: string
}

export const CAPABILITIES: Capability[] = [
  {
    num: '01',
    name: 'Project Delivery',
    headline: 'FROM STRATEGY TO EXECUTION',
    support:
      'We align people, priorities and decisions to deliver complex initiatives with clarity and control.',
    line: 'Turning strategic priorities into coordinated execution.',
    accent: '#ff6e79',
  },
  {
    num: '02',
    name: 'Process Excellence',
    headline: 'CLARITY IN HOW WE WORK',
    support:
      'We design and improve processes that create consistency, efficiency and scalable ways of working.',
    line: 'Creating clearer, smarter and more reliable ways of working.',
    accent: '#9d6bff',
  },
  {
    num: '03',
    name: 'Business Transformation',
    headline: 'CHANGE THAT WORKS',
    support:
      'We connect business needs, processes and technology to turn transformation into practical outcomes.',
    line: 'Connecting business needs, technology and organisational change.',
    accent: '#7cc4ff',
  },
  {
    num: '04',
    name: 'Testing & Quality',
    headline: 'CONFIDENCE BEFORE DELIVERY',
    support:
      'We validate solutions, reduce risk and help protect the customer experience before every release.',
    line: 'Protecting quality and customer experience through structured validation.',
    accent: '#e8c188',
  },
]

/**
 * Stream behaviour per phase: intro braid, one phase per capability
 * (each with a dominant stream), and the closing "one system" braid.
 */
export interface StreamPhase {
  rot: number
  len: number
  ySep: number
  yBias: number
  amp: number
  f1: number
  chaos: number
  spread: number
  align: number
  conv: number
  flow: number
  zAmp: number
  op: [number, number, number, number]
  size: [number, number, number, number]
  pull: [number, number, number, number]
}

export const PHASES: StreamPhase[] = [
  /* intro — one iridescent braid crossing the viewport, then separating */
  {
    rot: -0.16, len: 20, ySep: 0.6, yBias: 0.4, amp: 1.15, f1: 1.1, chaos: 0.5,
    spread: 0.34, align: 0, conv: 0.3, flow: 0.5, zAmp: 1.1,
    op: [0.9, 0.9, 0.9, 0.9], size: [0.055, 0.055, 0.055, 0.055], pull: [0, 0, 0, 0],
  },
  /* 01 Project Delivery — coral focused, fast, directional */
  {
    rot: -0.05, len: 22, ySep: 1.8, yBias: 0, amp: 0.5, f1: 0.8, chaos: 0.12,
    spread: 0.15, align: 0, conv: 0, flow: 1.7, zAmp: 0.6,
    op: [1, 0.16, 0.16, 0.16], size: [0.062, 0.04, 0.04, 0.04], pull: [0.85, 0, 0, 0],
  },
  /* 02 Process Excellence — violet, rhythmic, patterns align */
  {
    rot: 0.04, len: 22, ySep: 1.8, yBias: 0, amp: 0.75, f1: 2.3, chaos: 0.03,
    spread: 0.13, align: 0.9, conv: 0, flow: 0.9, zAmp: 0.45,
    op: [0.16, 1, 0.16, 0.16], size: [0.04, 0.06, 0.04, 0.04], pull: [0, 0.85, 0, 0],
  },
  /* 03 Business Transformation — ice blue leads a weave of all streams */
  {
    rot: -0.03, len: 21, ySep: 1.25, yBias: 0, amp: 0.9, f1: 1.3, chaos: 0.2,
    spread: 0.2, align: 0, conv: 0.85, flow: 0.8, zAmp: 1.4,
    op: [0.5, 0.5, 1, 0.5], size: [0.045, 0.045, 0.06, 0.045], pull: [0.3, 0.3, 0.55, 0.3],
  },
  /* 04 Testing & Quality — champagne, clean, precise, corrected */
  {
    rot: 0, len: 22, ySep: 1.8, yBias: 0, amp: 0.32, f1: 1.5, chaos: 0.05,
    spread: 0.07, align: 0.45, conv: 0, flow: 0.7, zAmp: 0.32,
    op: [0.14, 0.14, 0.14, 1], size: [0.04, 0.04, 0.04, 0.058], pull: [0, 0, 0, 0.85],
  },
  /* closing — all four braided into one delivery system */
  {
    rot: -0.08, len: 20, ySep: 0.55, yBias: 0, amp: 0.85, f1: 1.0, chaos: 0.12,
    spread: 0.16, align: 0.3, conv: 0.55, flow: 0.6, zAmp: 1.0,
    op: [0.95, 0.95, 0.95, 0.95], size: [0.052, 0.052, 0.052, 0.052], pull: [0, 0, 0, 0],
  },
]

/**
 * Normalized phase weights for a given section progress.
 * Windows overlap slightly so transitions stay smooth and reversible.
 */
export function phaseWeights(p: number): number[] {
  const w = [
    1 - smoothstep(0.09, 0.155, p),
    fadeWindow(p, 0.12, 0.19, 0.28, 0.34),
    fadeWindow(p, 0.28, 0.35, 0.44, 0.5),
    fadeWindow(p, 0.44, 0.51, 0.6, 0.66),
    fadeWindow(p, 0.6, 0.67, 0.76, 0.82),
    smoothstep(0.76, 0.85, p),
  ]
  const sum = w.reduce((a, b) => a + b, 0) || 1
  return w.map((x) => x / sum)
}

/** Ivory → deep ink after the intro; the section stays on ink. */
export function sectionDarkW(p: number): number {
  return smoothstep(0.12, 0.24, p)
}
