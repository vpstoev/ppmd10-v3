/**
 * Central site configuration for the experimental anniversary experience.
 * The Projects section is preserved but optional — toggle it here.
 */
export const siteConfig = {
  /** When false: Timeline → Teams & People (Projects skipped everywhere). */
  showProjectsSection: true,
}

export interface SectionDef {
  /** DOM id suffix — wrappers use `ppmd-${id}`. */
  id: string
  label: string
}

/** Ordered section registry; navigation derives from this. */
export function getSections(): SectionDef[] {
  const sections: SectionDef[] = [
    { id: 'hero', label: 'Hero' },
    { id: 'capabilities', label: 'Capabilities' },
    { id: 'timeline', label: 'Timeline' },
  ]
  if (siteConfig.showProjectsSection) sections.push({ id: 'projects', label: 'Projects' })
  sections.push(
    { id: 'teams', label: 'Teams' },
    { id: 'focus', label: 'Focus' },
    { id: 'voices', label: 'Voices' },
    { id: 'closing', label: 'Closing' },
  )
  return sections
}
