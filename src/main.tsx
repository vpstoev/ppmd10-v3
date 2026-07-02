import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// TEMPORARY: previewing the experimental redesign prototype.
// To revert, swap AppPrototype back to './App.tsx' (App below).
// import App from './App.tsx'
import AppPrototype from './AppPrototype.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppPrototype />
  </StrictMode>,
)
