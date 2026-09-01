/**
 * The two leadership profiles that open the Teams & People section.
 *
 * Names, titles, units, statements and biographies come from the content
 * workbook by way of `ppmd-content/workbookContent`. These profiles are
 * NOT counted as team members (see peopleData).
 *
 * Three things are deliberately NOT taken from the workbook:
 *
 *   portraits   its `photo_filename` column is empty, and the real files
 *               are already in `public/people/`, framed for these scenes.
 *   accents     the workbook offers a colour per profile, but these two
 *               chapters are lit as part of the section's sequence — the
 *               department scene shares a hue with the Project Management
 *               team if it takes the workbook's, which reads as the two
 *               being the same thing.
 *   kickers     "Area Vision" / "Department Direction" describe what each
 *               scene is for. They are the site's own editorial furniture
 *               and have no column in the workbook.
 *
 * Portraits resolve through BASE_URL so they also load from the project
 * sub-path the production build is served from.
 */
import { WB_LEADERSHIP } from '../ppmd-content/workbookContent'
import type { LeadershipLevel, LeadershipProfileData } from './teamTypes'

const PORTRAITS = `${import.meta.env.BASE_URL}people/`

/** Everything about a profile that the workbook does not carry. */
const SCENES: Record<
  string,
  {
    level: LeadershipLevel
    sceneKicker: string
    photo: string
    /** Square sources in a tall column — framed per image. */
    photoPosition: string
    accent: string
  }
> = {
  'senior-director': {
    level: 'area',
    sceneKicker: 'Area Vision',
    photo: 'elitsa-shopova-final.png',
    photoPosition: '52% 28%',
    accent: '#e8c188' /* champagne — senior, calm */,
  },
  'department-head': {
    level: 'department',
    sceneKicker: 'Department Direction',
    photo: 'department-head.webp',
    photoPosition: '48% 26%',
    accent: '#66bfff' /* blue — department clarity */,
  },
}

export const LEADERSHIP_PROFILES: LeadershipProfileData[] = WB_LEADERSHIP.flatMap((w) => {
  const scene = SCENES[w.id]
  if (!scene) return []
  const name = w.name ?? ''
  return [
    {
      id: w.id,
      level: scene.level,
      name,
      title: w.title ?? w.profileType ?? '',
      organisationalUnit: w.unit ?? '',
      /* The statement is the line the scene itself carries. The dialog
         falls back to it when there is no separate biography. */
      statement: w.statement ?? '',
      statementEmphasis: w.statementEmphasis,
      sceneKicker: scene.sceneKicker,
      photo: `${PORTRAITS}${scene.photo}`,
      photoAlt: w.photoAlt ?? `Portrait of ${name}`,
      photoPosition: w.photoPosition && w.photoPosition !== 'center' ? w.photoPosition : scene.photoPosition,
      quote: w.quote,
      shortBio: w.shortBio,
      shortBioEmphasis: w.shortBioEmphasis,
      keyContribution: w.keyContribution,
      keyContributionEmphasis: w.keyContributionEmphasis,
      personalFact: w.personalFact,
      personalFactEmphasis: w.personalFactEmphasis,
      accent: scene.accent,
      displayOrder: w.displayOrder,
    },
  ]
}).sort((a, b) => a.displayOrder - b.displayOrder)
