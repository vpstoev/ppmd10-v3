/**
 * One place that decides how a person's photograph is framed by the UI.
 *
 * The source portraits are not standardised yet — they are small upright
 * shots with the face high in frame and no common crop. Rather than edit
 * the files, every component that shows a person reads its framing from
 * here, so when standardised sources do arrive the presentation changes
 * in one place instead of five.
 *
 * The framing system, by visual context:
 *
 *   spatial node     circle, 1:1, cover          — the PM field
 *   roster card      rounded square, 1:1, cover  — PROC / BPT rosters
 *   leadership scene rounded 4:5, cover          — SD / DH chapters
 *   profile dialog   rounded rectangle, cover    — the shared modal
 *
 * Shape is deliberately NOT unified across contexts: what is unified is
 * the object-fit, the focal point, and the fact that no component invents
 * its own crop. No filters are applied anywhere — grading is a separate
 * decision to be made on the real images.
 */

/**
 * Default focal point for `object-position`.
 *
 * Faces sit high in these sources, so a centred crop cuts foreheads in a
 * tall frame. Person records may override it per photo; this is the value
 * used whenever they do not, and it matches the convention peopleData
 * already writes into every record.
 */
export const PORTRAIT_FOCUS = '50% 22%'

/** Resolve a record's focal point, falling back to the house default. */
export function portraitFocus(position?: string): string {
  return position ?? PORTRAIT_FOCUS
}
