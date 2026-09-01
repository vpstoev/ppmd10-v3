/**
 * THE SIX THINGS TWENTY-ONE PEOPLE SAID.
 *
 * Read across the twenty-one approved testimonials, the same six qualities
 * come back: that the department is trusted, that it knows its work,
 * that it delivers in an ordered way, that it solves the awkward
 * problems, that it can be relied on, and that it is good to work with.
 * Those are the themes, and each voice is connected to the ones their
 * own words carry.
 *
 * The mapping is FIXED, reviewed and written out in full below rather
 * than inferred at runtime by matching words. A keyword search over
 * somebody's testimonial would be a guess presented as a fact, and it
 * would quietly change whenever the text or the list of keywords moved.
 * This is the reviewed reading, and it stays the reviewed reading.
 *
 * The order of a voice's themes is meaningful: the FIRST is that
 * person's primary theme, and it is what gives them their colour
 * everywhere in the section — their node, their connections, their
 * quote's marker and the ambient light while their quote is being read.
 */

export type ThemeId = 'trust' | 'expertise' | 'delivery' | 'problem' | 'support' | 'energy'

export interface VoiceTheme {
  id: ThemeId
  label: string
  /** The one-line reading of what this theme means, shown on focus. */
  gloss: string
  color: string
}

/**
 * Four of the six colours are the tokens the rest of the site already
 * runs on. Six themes need six, so mint and amber join them — chosen to
 * sit in the same register, saturated enough to hold their own against
 * near-black and far enough apart in hue that two connected themes are
 * never mistaken for one.
 */
export const THEMES: VoiceTheme[] = [
  {
    id: 'trust',
    label: 'Trusted partnership',
    gloss: 'A partner, not a supplier',
    color: '#ff6e79',
  },
  {
    id: 'expertise',
    label: 'Professional expertise',
    gloss: 'They know the work and the business',
    color: '#7cc4ff',
  },
  {
    id: 'problem',
    label: 'Practical problem-solving',
    gloss: 'A way forward, not a reason why not',
    color: '#e8c188',
  },
  {
    id: 'energy',
    label: 'Positive energy',
    gloss: 'Good to work with',
    color: '#ff9a5c',
  },
  {
    id: 'support',
    label: 'Reliable support',
    gloss: 'There when it is needed',
    color: '#5ad1b0',
  },
  {
    id: 'delivery',
    label: 'Structured delivery',
    gloss: 'Complexity turned into a plan',
    color: '#9d6bff',
  },
]

export const THEME_BY_ID: Record<ThemeId, VoiceTheme> = Object.fromEntries(
  THEMES.map((t) => [t.id, t]),
) as Record<ThemeId, VoiceTheme>

/** The reviewed reading. First entry is the voice's primary theme. */
export const VOICE_THEMES: Record<string, ThemeId[]> = {
  'VOICE-01': ['expertise', 'delivery'],
  'VOICE-02': ['delivery', 'problem', 'trust'],
  'VOICE-03': ['expertise', 'trust', 'problem'],
  'VOICE-04': ['trust', 'problem', 'support'],
  'VOICE-05': ['support', 'delivery', 'problem'],
  'VOICE-06': ['support', 'energy'],
  'VOICE-07': ['trust', 'delivery', 'expertise', 'problem'],
  'VOICE-08': ['energy', 'support', 'trust'],
  'VOICE-09': ['delivery', 'problem', 'energy'],
  'VOICE-10': ['trust', 'expertise', 'energy'],
  'VOICE-11': ['expertise', 'support', 'energy'],
  'VOICE-12': ['expertise', 'delivery', 'trust'],
  'VOICE-13': ['trust', 'problem', 'expertise'],
  'VOICE-14': ['problem', 'energy', 'expertise'],
  'VOICE-15': ['trust', 'problem', 'support', 'energy'],
  'VOICE-16': ['delivery', 'trust', 'energy', 'support'],
  'VOICE-17': ['energy', 'delivery', 'trust'],
  'VOICE-18': ['energy', 'delivery', 'trust'],
  'VOICE-19': ['expertise', 'support', 'energy'],
  'VOICE-20': ['trust', 'problem', 'expertise', 'energy'],
  'VOICE-21': ['expertise', 'problem'],
}

export function themesOf(voiceId: string): ThemeId[] {
  return VOICE_THEMES[voiceId] ?? []
}

/** The theme a voice is coloured by — the first one they were read as. */
export function primaryTheme(voiceId: string): VoiceTheme {
  const first = themesOf(voiceId)[0]
  /* Every approved voice is in the mapping above; falling back to the
     first theme keeps the type honest without inventing a reading. */
  return first ? THEME_BY_ID[first] : THEMES[0]
}

/** The centre statement of the section, and the six-way reading behind it. */
export const COLLECTIVE_HEADLINE = '21 voices. One shared view.'
export const COLLECTIVE_SUMMARY =
  'PPMD is seen as a trusted partner that turns complexity into progress — combining expertise, structured delivery, practical problem-solving, reliable support and positive human collaboration.'
