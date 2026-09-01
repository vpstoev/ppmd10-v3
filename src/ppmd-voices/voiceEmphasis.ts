/**
 * WHAT TO SET IN THE LARGER FACE.
 *
 * One or two phrases from each testimonial, lifted typographically so a
 * reader arriving at a wall of prose has somewhere to land. Every entry
 * is an EXACT substring of the approved text — not a summary, not a
 * paraphrase, not a shortened version. The rendering splits the
 * paragraph around the phrase and sets it larger; no word is added,
 * removed or reordered, and a quote with its emphasis stripped out is
 * character-for-character the quote as given.
 *
 * `scripts`-free by design: these are editorial choices, so they are
 * written down and reviewable rather than found by an algorithm looking
 * for long noun phrases. `emphasisReport()` proves each one still
 * matches its source, and the layout check runs it on every build.
 */

export const EMPHASIS: Record<string, string[]> = {
  'VOICE-01': [
    'proven professionalism and expertise',
    'an in-depth understanding of A1’s business needs',
  ],
  'VOICE-02': [
    'a key driver of business transformation',
    'turns complex change into sustainable business value',
  ],
  'VOICE-03': [
    'deep expertise, professionalism and structured approach',
    'a trusted partner',
  ],
  'VOICE-04': [
    'a constructive and solution-oriented dialogue',
    'highly dependable partners',
  ],
  'VOICE-05': [
    'consistently smooth and straightforward',
    'clear and specific guidance',
  ],
  'VOICE-06': ['exceptional responsiveness, positive attitude and strong team spirit'],
  'VOICE-07': [
    'a strong ability to coordinate multiple workstreams',
    'curiosity and openness towards adopting new technologies',
  ],
  'VOICE-08': [
    'the care, dedication and effort you bring to everything you do',
    'Hustle together, win together!',
  ],
  'VOICE-09': [
    'the true Champions behind our projects',
    'even the greatest chaos into a clear, well-structured plan',
  ],
  'VOICE-10': [
    'an immediate sense of confidence',
    'genuine partnership and mutual respect',
  ],
  'VOICE-11': [
    'dedicated, accountable, and always willing to go above and beyond',
    'a leader who leads by example',
  ],
  'VOICE-12': [
    'consistently been highly productive',
    'the clear allocation of specialized expertise',
  ],
  'VOICE-13': [
    'a consistently constructive mindset and a genuine culture of collaboration',
    'composed, pragmatic and firmly focused',
  ],
  'VOICE-14': [
    'always finds a way forward',
    'turns complex challenges into achievable outcomes',
  ],
  'VOICE-15': [
    'energy, flexibility and a consistently positive attitude',
    'quickly, smoothly and without unnecessary complexity',
  ],
  'VOICE-16': ['their strong organization', 'their collaborative approach'],
  'VOICE-17': [
    'what great collaboration should feel like',
    'make even the most complex work feel clear, smooth and enjoyable',
  ],
  'VOICE-18': ['still going strong', 'If that isn’t teamwork, I don’t know what is!'],
  'VOICE-19': [
    'an exceptional group of highly capable professionals',
    'open, constructive and straightforward',
  ],
  'VOICE-20': [
    'a resounding BRAVO',
    'a genuine understanding of the business',
  ],
  'VOICE-21': [
    'consistently delves into the details of every project',
    'a flexible, solution-oriented approach',
  ],
}

export interface Segment {
  text: string
  lift: boolean
}

/**
 * Split one paragraph around whichever phrases fall inside it.
 *
 * Returns the paragraph in order as plain and lifted runs. Overlapping
 * matches are impossible by construction — a later phrase that would
 * start inside an earlier one is skipped rather than nested — and the
 * concatenation of every returned segment is the paragraph exactly.
 */
export function liftPhrases(paragraph: string, phrases: string[]): Segment[] {
  const found: { at: number; len: number }[] = []
  for (const p of phrases) {
    const at = paragraph.indexOf(p)
    if (at < 0) continue
    if (found.some((f) => at < f.at + f.len && f.at < at + p.length)) continue
    found.push({ at, len: p.length })
  }
  if (!found.length) return [{ text: paragraph, lift: false }]
  found.sort((a, b) => a.at - b.at)

  const out: Segment[] = []
  let i = 0
  for (const f of found) {
    if (f.at > i) out.push({ text: paragraph.slice(i, f.at), lift: false })
    out.push({ text: paragraph.slice(f.at, f.at + f.len), lift: true })
    i = f.at + f.len
  }
  if (i < paragraph.length) out.push({ text: paragraph.slice(i), lift: false })
  return out
}

/** Every phrase, checked against the text it claims to come from. */
export function emphasisReport(
  voices: { id: string; quote: string; paragraphs: string[] }[],
): { missing: string[]; unplaced: string[]; lossy: string[]; lifted: number } {
  const missing: string[] = []
  const unplaced: string[] = []
  const lossy: string[] = []
  let lifted = 0

  for (const v of voices) {
    const phrases = EMPHASIS[v.id] ?? []
    if (!phrases.length) missing.push(v.id)
    for (const p of phrases) {
      if (!v.quote.includes(p)) missing.push(`${v.id}: ${p}`)
    }
    /* Every phrase must land inside a single paragraph — one that spans
       a paragraph break exists in the quote but can never be rendered. */
    for (const p of phrases) {
      if (v.quote.includes(p) && !v.paragraphs.some((para) => para.includes(p))) {
        unplaced.push(`${v.id}: ${p}`)
      }
    }
    for (const para of v.paragraphs) {
      const segs = liftPhrases(para, phrases)
      if (segs.map((s) => s.text).join('') !== para) lossy.push(`${v.id}`)
      lifted += segs.filter((s) => s.lift).length
    }
  }
  return { missing, unplaced, lossy, lifted }
}
