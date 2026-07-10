/**
 * PLACEHOLDER CONTENT — Voices section.
 * All quotes and attributions are temporary placeholders; no real names.
 */
import type { Voice } from './voiceTypes'

export const VOICES_VH = 380

export const VOICES: Voice[] = [
  {
    quote: 'PPMD brings structure to the moments when complexity is at its highest.', /* PLACEHOLDER */
    attribution: 'Internal Partner', /* PLACEHOLDER */
    role: 'Role placeholder', /* PLACEHOLDER */
    accent: '#ff6e79',
    window: [0.14, 0.19, 0.32, 0.38],
  },
  {
    quote:
      'The department connects people and priorities in a way that makes complex delivery possible.', /* PLACEHOLDER */
    attribution: 'Business Stakeholder', /* PLACEHOLDER */
    role: 'Role placeholder', /* PLACEHOLDER */
    accent: '#7cc4ff',
    window: [0.36, 0.41, 0.54, 0.6],
  },
  {
    quote:
      'The strongest result is not only what gets delivered, but how the teams work together to achieve it.', /* PLACEHOLDER */
    attribution: 'Team Member', /* PLACEHOLDER */
    role: 'Role placeholder', /* PLACEHOLDER */
    accent: '#e8c188',
    window: [0.58, 0.63, 0.78, 0.84],
  },
]

export const VOICES_TITLE_OUT: readonly [number, number] = [0.1, 0.15]
