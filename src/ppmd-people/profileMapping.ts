/**
 * Maps both data sources into the one normalized ProfileDetailData shape
 * used by the shared profile dialog. Leadership stays in leadershipData,
 * employees stay in peopleData — no duplication.
 */
import type { LeadershipProfileData } from '../ppmd-teams/teamTypes'
import { displayRole } from './peopleData'
import type { Person, ProfileDetailData } from './peopleTypes'

export function personToProfile(p: Person): ProfileDetailData {
  /* An unconfirmed title is missing data, not a job description: the
     profile shows the portrait, the name and the team, and simply has no
     role line until there is a real one to print. */
  const role = displayRole(p)
  return {
    id: p.id,
    label: role === 'Team Leader' ? 'Team Lead' : role,
    name: p.name,
    role,
    unit: p.team,
    profileType: p.isLeadership ? 'team-leadership' : 'team-member',
    photo: p.photo,
    photoAlt: p.photoAlt,
    photoPosition: p.photoPosition,
    shortBio: p.shortBio,
    shortBioEmphasis: p.shortBioEmphasis,
    quote: p.quote,
    keyContribution: p.keyContribution,
    keyContributionEmphasis: p.keyContributionEmphasis,
    personalFact: p.personalFact,
    personalFactEmphasis: p.personalFactEmphasis,
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
    shortBioEmphasis: l.shortBio ? l.shortBioEmphasis : l.statementEmphasis,
    quote: l.quote,
    keyContribution: l.keyContribution,
    keyContributionEmphasis: l.keyContributionEmphasis,
    personalFact: l.personalFact,
    personalFactEmphasis: l.personalFactEmphasis,
    accent: l.accent,
  }
}
