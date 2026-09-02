import ExperienceSection from './ppmd-experience/ExperienceSection.tsx'
import TenYearsInMotion from './TenYearsInMotion.tsx'
import ProjectsThatShapedTheDecade from './ProjectsThatShapedTheDecade.tsx'
import TeamsAndPeople from './TeamsAndPeople.tsx'
import CurrentFocus from './CurrentFocus.tsx'
import VoicesFromTheJourney from './VoicesFromTheJourney.tsx'
import FinalClosing from './FinalClosing.tsx'
import SectionNavigation from './SectionNavigation.tsx'
import MusicToggle from './MusicToggle.tsx'
import { siteConfig } from './siteConfig.ts'

/**
 * The complete experimental anniversary experience. Hero and Capabilities
 * are ONE pinned scroll experience (ExperienceSection carries both the
 * `ppmd-hero` and `ppmd-capabilities` navigation anchors); the Projects
 * section renders only when enabled in siteConfig (both orders share the
 * same deep-ink handoff between Timeline and Teams & People, so no visual
 * gap appears either way).
 */
export default function ExperiencePage() {
  return (
    <>
      <MusicToggle />
      <ExperienceSection />
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
