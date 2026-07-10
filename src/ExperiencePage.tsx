import HgInspiredHero from './HgInspiredHero.tsx'
import WhatPpmdMakesPossible from './WhatPpmdMakesPossible.tsx'
import TenYearsInMotion from './TenYearsInMotion.tsx'
import ProjectsThatShapedTheDecade from './ProjectsThatShapedTheDecade.tsx'
import TeamsAndPeople from './TeamsAndPeople.tsx'
import CurrentFocus from './CurrentFocus.tsx'
import VoicesFromTheJourney from './VoicesFromTheJourney.tsx'
import FinalClosing from './FinalClosing.tsx'
import SectionNavigation from './SectionNavigation.tsx'
import { siteConfig } from './siteConfig.ts'

/**
 * The complete experimental anniversary experience. Section wrappers
 * carry the `ppmd-*` ids the navigation targets; the Projects section
 * renders only when enabled in siteConfig (both orders share the same
 * deep-ink handoff between Timeline and Teams & People, so no visual
 * gap appears either way).
 */
export default function ExperiencePage() {
  return (
    <>
      <div id="ppmd-hero">
        <HgInspiredHero />
      </div>
      <div id="ppmd-capabilities">
        <WhatPpmdMakesPossible />
      </div>
      <div id="ppmd-timeline">
        <TenYearsInMotion />
      </div>
      {siteConfig.showProjectsSection && (
        <div id="ppmd-projects">
          <ProjectsThatShapedTheDecade />
        </div>
      )}
      <div id="ppmd-teams">
        <TeamsAndPeople />
      </div>
      <div id="ppmd-focus">
        <CurrentFocus />
      </div>
      <div id="ppmd-voices">
        <VoicesFromTheJourney />
      </div>
      <div id="ppmd-closing">
        <FinalClosing />
      </div>
      <SectionNavigation />
    </>
  )
}
