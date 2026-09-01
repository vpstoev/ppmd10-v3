/** Types for the Voices section. */

export interface Voice {
  id: string
  /** The approved quote in full, exactly as it was given. */
  quote: string
  /** The same text, split at the author's own blank lines. */
  paragraphs: string[]
  /** Exact phrases marked bold by the editor in the content workbook. */
  emphasis: string[]
  name: string
  role?: string
  unit?: string
  /**
   * Recorded in the workbook and carried through, but it decides nothing
   * on the page. Every testimonial is shown whole, at the same size and
   * at the same contrast — dimming one colleague's words so another's
   * read louder is an editorial judgement this section does not make.
   * What varies between voices is colour, and colour here means identity
   * rather than rank.
   */
  isHighlight: boolean
}
