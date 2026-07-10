import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// TEMPORARY (branch alternative-concept-v3): rendering the Hg-inspired
// scroll-driven anniversary hero proof of concept.
//
// To restore the APPROVED Concept A prototype, swap the render back to
// <AppPrototype />:
//   import AppPrototype from './AppPrototype.tsx'
//   ...render(<StrictMode><AppPrototype /></StrictMode>)
//
// The original site shell also remains available:
//   import App from './App.tsx'
import ExperiencePage from './ExperiencePage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ExperiencePage />
  </StrictMode>,
)
