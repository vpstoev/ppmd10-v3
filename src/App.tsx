import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { ScrollProgress } from './components/layout/ScrollProgress'
import { GrainOverlay } from './components/layout/GrainOverlay'
import { SceneProvider, SceneBackground } from './components/layout/SceneBackground'
import { AnniversaryHero } from './components/sections/AnniversaryHero'
import { DepartmentPillars } from './components/sections/DepartmentPillars'
import { PPMDEcosystem } from './components/sections/PPMDEcosystem'
import { Teams } from './components/sections/Teams'
import { PeopleDirectory } from './components/sections/PeopleDirectory'
import { JourneyTimeline } from './components/sections/JourneyTimeline'
import { RequestToImpactFlow } from './components/sections/RequestToImpactFlow'
import { CelebrationWall } from './components/sections/CelebrationWall'

function App() {
  return (
    <SceneProvider>
      <ScrollProgress />
      <Navbar />
      <SceneBackground />
      <main>
        {/* PPMD anniversary — presentation scenes that morph one into the next */}
        <AnniversaryHero />
        <DepartmentPillars />
        <PPMDEcosystem />
        <Teams />
        <PeopleDirectory />
        <JourneyTimeline />
        <RequestToImpactFlow />
        <CelebrationWall />
      </main>
      <Footer />
      <GrainOverlay />
    </SceneProvider>
  )
}

export default App
