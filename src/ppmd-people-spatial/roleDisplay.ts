/**
 * A shorter way of writing a job title, for the one place where a title
 * is a layout box rather than a line of prose.
 *
 * In the spatial field fifteen titles are on screen at once, permanently,
 * each competing with fourteen neighbours for room. Two of the
 * department's titles are long enough that on a 1366 laptop the only way
 * to fit them was to shrink the type until it stopped being readable —
 * which is the outcome this exists to avoid. Writing the title shorter
 * costs far less than writing it smaller.
 *
 * It is a rule, not a list of people. Any title over `LONG` characters is
 * rewritten through the same vocabulary, so a new long title anywhere in
 * the department is handled by the same pass with nothing to add here,
 * and no person is special-cased.
 *
 * The full title is untouched everywhere a title is read rather than
 * scanned: the profile dialog, the roster cards, and the accessible name
 * of every node in the field itself.
 */

/** Titles at or under this length are always shown in full. */
const LONG = 24

/**
 * Department vocabulary. Applied in order and stopped as soon as the
 * title is short enough, so a title loses the fewest words it can.
 */
const SHORT_FORMS: ReadonlyArray<readonly [RegExp, string]> = [
  [/\bManagement\b/g, 'Mgmt'],
  [/\bAdministration\b/g, 'Admin'],
  [/\bCoordination\b/g, 'Coord'],
  [/\bDevelopment\b/g, 'Dev'],
  [/\bTechnology\b/g, 'Tech'],
  [/\bOperations\b/g, 'Ops'],
]

/** The title as the field should show it. Unchanged if it already fits. */
export function compactRole(role: string): string {
  if (role.length <= LONG) return role
  let out = role
  for (const [pattern, short] of SHORT_FORMS) {
    if (out.length <= LONG) break
    out = out.replace(pattern, short)
  }
  return out
}
