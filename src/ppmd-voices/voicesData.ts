/**
 * Voices from the Journey — twenty-one approved testimonials, in workbook
 * order.
 *
 * Every quote here is somebody's own words with their consent recorded in
 * the workbook, and nothing rewrites them: the full text travels into the
 * data and the full text is what the page renders. No shortened copy of a
 * quote is stored or computed anywhere, so a trimmed version can never
 * quietly become the version.
 *
 * This module is the roster. How the twenty-one are read — which themes
 * their words carry — is in `voiceThemes`; the fragments and positions
 * the opening chorus is built from are in `chorusData`.
 */
import { WB_VOICES } from '../ppmd-content/workbookContent'
import type { Voice } from './voiceTypes'

/**
 * A quote split into the paragraphs its author wrote.
 *
 * Line endings are normalised — the workbook arrives with CRLF — and
 * blank lines separate paragraphs. Nothing else is touched: no word is
 * added, removed or reordered, and the single line breaks that several
 * of these use inside a paragraph are kept by the `pre-line` rendering
 * rather than flattened into spaces.
 */
export function quoteParagraphs(quote: string): string[] {
  return quote
    .replace(/\r\n?/g, '\n')
    .split(/\n[ \t]*\n+/)
    .map((p) => p.replace(/^[ \t\n]+|[ \t\n]+$/g, ''))
    .filter(Boolean)
}

/* VOICE-17 is Final in the workbook but its consent cell was left blank,
   so the protective importer correctly withheld it. The site owner
   explicitly approved including it during the final Voices review. Keep
   that one reviewed override here instead of weakening the importer for
   any future blank-consent rows. */
const WEBSITE_APPROVED_ADDITIONS = [
  {
    id: 'VOICE-17',
    displayOrder: 17,
    quote: 'Working with the A1 Project Management Team is what great collaboration should feel like. They combine professionalism, responsiveness and genuine commitment with a rare ability to make even the most complex work feel clear, smooth and enjoyable. They keep people aligned, maintain momentum and bring positive energy to every challenge. Working with them is not only productive—it is a genuine pleasure.',
    name: 'Margarita Tsekova',
    role: 'Strategic And Marketing Projects Manager',
    unit: 'Strategy & Business development',
    isHighlight: false,
    emphasis: [],
  },
]

export const VOICES: Voice[] = [...WB_VOICES, ...WEBSITE_APPROVED_ADDITIONS.filter(
  (addition) => !WB_VOICES.some((voice) => voice.id === addition.id),
)]
  .sort((a, b) => a.displayOrder - b.displayOrder)
  .map((w) => ({
  id: w.id,
  quote: w.quote,
  paragraphs: quoteParagraphs(w.quote),
  emphasis: w.emphasis ?? [],
  name: w.name ?? '',
  role: w.role,
  unit: w.unit,
  isHighlight: w.isHighlight,
  }))

export const VOICE_BY_ID: Record<string, Voice> = Object.fromEntries(VOICES.map((v) => [v.id, v]))
