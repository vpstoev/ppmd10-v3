/**
 * PLACEHOLDER CONTENT — leadership profiles for the Teams & People section.
 * No real names. The structure supports adding name, exact title, photo,
 * quote, short biography, key contribution and personal fact later.
 * These profiles are NOT counted as team members (see peopleData).
 */
import type { LeadershipProfileData } from './teamTypes'

export const LEADERSHIP_PROFILES: LeadershipProfileData[] = [
  {
    id: 'senior-director',
    level: 'area',
    name: 'Senior Director', /* PLACEHOLDER name */
    title: 'Senior Director',
    organisationalUnit: 'Customer Experience Area',
    statement:
      'Shaping the vision, priorities and customer experience direction that guide the area.', /* PLACEHOLDER */
    sceneKicker: 'Area Vision',
    accent: '#e8c188', /* champagne — senior, calm */
    displayOrder: 1,
  },
  {
    id: 'department-head',
    level: 'department',
    name: 'Department Head', /* PLACEHOLDER name */
    title: 'Department Head',
    organisationalUnit: 'Project & Processes Management Department',
    statement:
      'Turning area priorities into one connected system of projects, processes and quality.', /* PLACEHOLDER */
    sceneKicker: 'Department Direction',
    accent: '#9d6bff', /* violet — department energy */
    displayOrder: 2,
  },
]
