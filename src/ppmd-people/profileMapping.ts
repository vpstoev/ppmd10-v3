/**
 * Maps both data sources into the one normalized ProfileDetailData shape
 * used by the shared profile dialog. Leadership stays in leadershipData,
 * employees stay in peopleData — no duplication.
 */
import type { LeadershipProfileData } from '../ppmd-teams/teamTypes'
import type { Person, ProfileDetailData } from './peopleTypes'

export function personToProfile(p: Person): ProfileDetailData {
  return {
    id: p.id,
    label: p.role === 'Team Leader' ? 'Team Lead' : p.role,
    name: p.name,
    role: p.role,
    unit: p.team,
    profileType: p.isLeadership ? 'team-leadership' : 'team-member',
    photo: p.photo,
    photoAlt: p.photoAlt,
    photoPosition: p.photoPosition,
    shortBio: p.shortBio,
    keyContribution: p.keyContribution,
    personalFact: p.personalFact,
    accent: p.accent,
  }
}

export function leadershipToProfile(l: LeadershipProfileData): ProfileDetailData {
  return {
    id: l.id,
    label: l.title,
    name: l.name,
    role: l.title,
    unit: l.organisationalUnit,
    profileType: l.level === 'area' ? 'senior-director' : 'department-head',
    photo: l.photo,
    photoAlt: l.photoAlt,
    photoPosition: l.photoPosition,
    shortBio: l.shortBio ?? l.statement,
    quote: l.quote,
    keyContribution: l.keyContribution,
    personalFact: l.personalFact,
    accent: l.accent,
  }
}
