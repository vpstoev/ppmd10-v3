/**
 * "Projects that Shaped the Decade" — the sixteen projects the workbook
 * marks for the site, and the choreography that carries them.
 *
 * Names, categories, descriptions and impact lines come from the workbook.
 * The importer removes only confirmed template filler, so each scene can
 * show the reviewed project story without carrying stale placeholder copy.
 *
 * Colour and figure are looked up by workbook id, in `projectAccents` and
 * in the placement table below. Both are authored and both are keyed, so
 * a project always draws the same way, and re-ordering the sheet moves a
 * project's scene without changing its identity.
 */
import { PROJECT_ACCENTS } from './projectAccents'
import type { ShapePlacement } from './ProjectShape'
import { WB_PROJECTS } from '../ppmd-content/workbookContent'
import type { MorphSpan, Project } from './projectTypes'

/* Sixteen scenes with room to be read, plus an opening and a close. */
export const PROJECTS_VH = 1800

/** Palette continuity with the rest of the experience. */
export const INK = '#07070c'
export const IVORY = '#f5efe4'
export const P_CORAL = '#ff6e79'
export const P_VIOLET = '#9d6bff'
export const P_ICE = '#7cc4ff'
export const P_CHAMPAGNE = '#e8c188'
export const P_WHITE = '#fff1e0'

export const TITLE_OUT: readonly [number, number] = [0.032, 0.062]
export const CLOSING_LINE1_IN: readonly [number, number] = [0.925, 0.952]
export const CLOSING_LINE2_IN: readonly [number, number] = [0.947, 0.978]

/**
 * The figure behind each scene, keyed by workbook id.
 *
 * Ten compositions across sixteen projects, so six repeat — and where one
 * repeats it is cropped, turned and scaled differently enough that the
 * two are not read as the same picture. No figure is ever adjacent to
 * itself, and neither is a dominant colour: the section is read in order,
 * and two neighbours that look alike read as one scene that failed to
 * change.
 */
const SHAPES: Record<string, ShapePlacement> = {
  'PRJ-01': { kind: 'orbitalRings', scale: 1.15, rotate: -12, x: -14, y: -6, strength: 0.9 },
  'PRJ-02': { kind: 'diagonalBeam', scale: 1.35, rotate: 0, x: 10, y: 4, strength: 0.85 },
  'PRJ-03': { kind: 'concentricContours', scale: 1.6, rotate: 8, x: 16, y: -12, strength: 0.8 },
  'PRJ-04': { kind: 'archFrame', scale: 1.1, rotate: -4, x: -8, y: 8, strength: 0.95 },
  'PRJ-05': { kind: 'clippedPolygon', scale: 1.25, rotate: 16, x: 12, y: -8, strength: 0.85 },
  'PRJ-06': { kind: 'splitArcs', scale: 1.45, rotate: -8, x: -18, y: 2, strength: 0.8 },
  'PRJ-07': { kind: 'meshWave', scale: 1.2, rotate: -14, x: 8, y: 10, strength: 0.9 },
  'PRJ-08': { kind: 'capsuleStack', scale: 1.3, rotate: 6, x: -12, y: -10, strength: 0.85 },
  'PRJ-09': { kind: 'radialFlare', scale: 1.05, rotate: 22, x: 14, y: 6, strength: 0.9 },
  'PRJ-10': { kind: 'isoGrid', scale: 1.5, rotate: 0, x: -10, y: -4, strength: 0.75 },
  /* From here the ten begin to repeat — each at a different crop. */
  'PRJ-11': { kind: 'diagonalBeam', scale: 1.7, rotate: 180, x: -16, y: -8, strength: 0.8 },
  'PRJ-12': { kind: 'orbitalRings', scale: 1.75, rotate: 74, x: 18, y: 12, strength: 0.75 },
  'PRJ-13': { kind: 'splitArcs', scale: 1.1, rotate: 96, x: 6, y: -14, strength: 0.9 },
  'PRJ-14': { kind: 'concentricContours', scale: 1.05, rotate: -22, x: -20, y: 10, strength: 0.95 },
  /* RRF: quiet curved traces — no bars or grid behind the copy. */
  'PRJ-15': { kind: 'splitArcs', scale: 1.28, rotate: 18, x: -10, y: 4, strength: 0.5 },
  /* Entitlement Server: a low-contrast wave, leaving the long description clear. */
  'PRJ-16': { kind: 'meshWave', scale: 1.18, rotate: -12, x: 10, y: 0, strength: 0.38 },
}

/** A last-resort figure, so a new workbook row is never drawn bare. */
const FALLBACK_SHAPE: ShapePlacement = {
  kind: 'concentricContours',
  scale: 1.3,
  rotate: 0,
  x: 0,
  y: 0,
  strength: 0.8,
}

/** Reveal technique, cycled so no two neighbours arrive the same way. */
const REVEALS = ['mask', 'clip', 'depth'] as const

/**
 * Sixteen scenes between the title and the close.
 *
 * Each project holds the frame for about a twentieth of the section, and
 * the fades overlap by a hair so one scene is always handing over to the
 * next rather than the field going empty between them.
 */
const FIRST = 0.075
const SPAN = 0.052

export const PROJECTS: Project[] = WB_PROJECTS.flatMap((w, i) => {
  if (!w.name) return []
  const start = FIRST + i * SPAN
  return [
    {
      id: w.id,
      bigNum: String(w.displayOrder).padStart(2, '0'),
      name: w.name.toUpperCase(),
      category: w.category ?? '',
      description: w.description,
      impact: w.impact,
      accent: PROJECT_ACCENTS[w.id] ?? PROJECT_ACCENTS['PRJ-01'],
      shape: SHAPES[w.id] ?? FALLBACK_SHAPE,
      reveal: REVEALS[i % REVEALS.length],
      side: i % 2 === 0 ? 'left' : 'right',
      window: [start, start + 0.013, start + 0.04, start + 0.052],
    },
  ]
})

/**
 * Particle-shape morph schedule for the ambient field behind the scenes.
 *
 * The field is environment rather than illustration — it is one evolving
 * system across the whole section, not a figure per project — so these
 * spans are spread evenly across the chapter rather than pinned to
 * individual projects. Everything stays a pure function of scroll
 * progress, so reverse scrolling retraces the identical sequence.
 */
export const MORPHS: MorphSpan[] = [
  { a: 0.06, b: 0.115 },
  { a: 0.155, b: 0.21 },
  { a: 0.25, b: 0.305 },
  { a: 0.345, b: 0.4 },
  { a: 0.44, b: 0.495 },
  { a: 0.535, b: 0.59 },
  { a: 0.63, b: 0.685 },
  { a: 0.725, b: 0.78 },
  { a: 0.85, b: 0.925 },
]

/** Ambient wobble amplitude per shape (indexed like the shapes). */
export const SHAPE_AMPS = [0.1, 0.03, 0.03, 0.07, 0.05, 0.042, 0.022, 0.016, 0.045, 0.06]
