/**
 * The four PPMD capabilities. Rendering and motion live in
 * ppmd-experience; this module resolves the workbook's records into the
 * shape that section draws.
 *
 * The workbook also carries a fifth row, CAP-CLOSE — a closing statement
 * rather than a capability. It is imported and available in
 * `WB_CAPABILITIES`, and it is not turned into a fifth card here, because
 * this section has no closing slot and inventing one would be a redesign
 * rather than a content import.
 *
 * Accents stay with the section. The workbook offers a colour per
 * capability, but these four are lit in sequence as the chapter travels,
 * and the order they are lit in is a decision about the scene rather than
 * about the capability.
 */
import { WB_CAPABILITIES } from '../ppmd-content/workbookContent'

export interface Capability {
  /**
   * The workbook's display order, kept for sequencing and for React keys.
   * It is NOT rendered: the eyebrow shows the capability's name and its
   * accent, and nothing else.
   */
  num: string
  name: string
  headline: string
  support: string
  line: string
  accent: string
}

/** Scene accents, in the order the chapter lights them. */
const ACCENTS = ['#ff6e79', '#9d6bff', '#7cc4ff', '#e8c188']

export const CAPABILITIES: Capability[] = WB_CAPABILITIES.filter(
  (c) => /^CAP-\d+$/.test(c.id) && c.name && c.headline,
).map((c, i) => ({
  num: String(c.displayOrder).padStart(2, '0'),
  name: c.name!,
  headline: c.headline!,
  support: c.description ?? '',
  line: c.line ?? '',
  accent: ACCENTS[i % ACCENTS.length],
}))
