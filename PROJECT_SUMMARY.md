# PROJECT SUMMARY — A1 P&PM 10-Year Anniversary Site

_Last updated: 2026-06-29_

---

## Current Project State

A fully structured, near-complete internal anniversary microsite for A1's Project & Processes Management Department (P&PM). All eight page sections exist and are wired into `App.tsx`. The cinematic scene system, design tokens, motion library, and layout infrastructure are all in place. The project is in a **refine-and-polish** phase — content, structure, and architecture are locked; remaining work is visual execution and content population.

Stack: **React 19 + Vite + TypeScript + CSS Modules + `motion` (Framer Motion)**.

---

## Design Direction

**"PPMD Universe / Department OS"** — feels like a premium Apple-event microsite crossed with a cinematic dark dashboard. Not a corporate landing page; an emotional celebration piece for an internal corporate audience.

| Principle | Detail |
|---|---|
| Palette | Near-black `#0a0a0d` base, **A1 red `#e2001a`** as primary accent |
| Spine | WARM — red/burgundy throughout; only `#universe` scene breaks to COOL |
| Hallmark color | Amber (`--amber`, `--gradient-hallmark`) — reserved exclusively for the "10", 2015/2025 bookends, closing sparkle |
| Team accents | PM red `#ff3340` · PP magenta `#d6248f` · BPT coral `#ff7a45` |
| Typography | Serif display for hero/emotional moments; monospace scoped to Universe + telemetry band only |
| Motifs | Film grain overlay, OS-style `sys-label`s, team `codename`s, chapter indices (`01`–`06`), `v10.0` tag |

**Hard constraints (owner-locked):**
- No generic SaaS sections, no pricing, no neon/cyberpunk aesthetic
- Must feel premium, corporate, modern, and emotional — suitable for telecom/tech
- Do not restructure the section order; improve visual execution only
- Violet/teal confined to Universe scene's `coolField` only

---

## Key Components

### Layout Infrastructure
| File | Role |
|---|---|
| `src/index.css` | All design tokens (palette, gradients, spacing, shadows, radii, button classes) |
| `src/lib/motion.ts` | Shared animation variants: `staggerContainer/Item`, `blurUp`, `maskUp`, `plainUp`, `softSpring`, `sceneEnter/Exit/Reveal`, `morphCard/Node`, `backgroundShift` |
| `src/components/layout/SceneBackground.tsx` | `SceneProvider` + `SceneBackground` — one fixed `z:-1` layer whose per-scene gradient crossfades as the user scrolls. Keyed by section `id` |
| `src/components/ui/Section.tsx` | Scene wrapper — every `<Section id=…>` auto-registers scroll-driven opacity/scale/y AND calls `useSceneActivation` |
| `src/components/layout/GrainOverlay.tsx` | Fixed film grain + vignette, mounted once in `App` |
| `src/components/layout/Navbar.tsx` | Navigation |
| `src/components/layout/ScrollProgress.tsx` | Top progress bar |
| `src/components/layout/Footer.tsx` | Footer |

### UI Primitives
| File | Role |
|---|---|
| `src/components/ui/SectionHeading.tsx` | Accepts `index` prop; reveals via `maskUp` clip wipe |
| `src/components/ui/Badge.tsx` | Pill badge |
| `src/components/ui/Avatar.tsx` | Person avatar |
| `src/components/ui/Container.tsx` | Layout container |
| `src/components/ui/ParticleField.tsx` | Ambient particle system |
| `src/components/ui/LightTrails.tsx` | Decorative light-trail SVG/canvas |
| `src/components/ui/icons.tsx` / `iconMap.tsx` | Icon system |

### Page Sections (in render order)
> **Corrective structural redesign (2026-06-30):** abbreviation is **PPMD** (was P&PM — `department.short`). Weak concepts replaced outright. Scene-background red tints de-flooded (graphite-dominant). Guiding rules: lighter glass / warm gradient surfaces, red as accent only (no red-on-red, no dark-on-dark, no muddy orange-on-red).

| Section | `id` | Chapter | Notes |
|---|---|---|---|
| `AnniversaryHero` | `hero` | — | Editorial stacked lockup: warm-white→amber "10", then "YEARS" as a clean tracked uppercase label flanked by hairlines (no pill/red border). Est. dates below. Red de-flooded |
| `DepartmentPillars` | — | — | 4 department pillars (Delivery / Processes / Transformation / Quality) — warm glass cards, gradient borders, icons. Data: `data/pillars.ts`. (Replaced the stats/numbers band) |
| `PPMDEcosystem` | `universe` | 01 | Radial ecosystem: central PPMD core + 3 team modules around it (triangle), curved core→module data paths + faint inter-module triangle links, layered glass, hover→caption. No orbit, no boxes-below |
| `Teams` | `teams` | 02 | Unchanged. Three distinct module layouts: PM pipeline / PP stack / BPT console |
| `PeopleDirectory` | `people` | 03 | **Head-of-Department spotlight** (`head` in `data/people.ts`) + 3 team entry points → team detail (featured lead + compact readable rows) → `PersonModal`. Scales to ~36 |
| `JourneyTimeline` | `timeline` | 04 | Vertical rail; **primary (`major`) vs secondary** milestone hierarchy — major = large amber node + elevated card, secondary = quiet graphite. Clean amber→red rail (not muddy) |
| `RequestToImpactFlow` | `collaboration` | 05 | "From Request to Impact" — 6 stages (step 6 = "Launch & Continuous Improvement"), each with lead + support + value. Data: `data/process.ts` |
| `CelebrationWall` | `wall` | 06 | "Voices from the Organization" — external testimonials (author/role/department/relationship/category). Amber finale |

Deleted: `StatsHighlightBand`, `DepartmentSystemMap`, `TeamDirectory` (+ the earlier `DepartmentStats`/`TeamUniverse`/`People`/`Timeline`/`HowWeWork`). `data/stats.ts` + `useCountUp` now unused.

### Hooks
| File | Role |
|---|---|
| `src/hooks/useTilt.ts` | Pointer tilt + CSS spotlight on cards |
| `src/hooks/useCountUp.ts` | Scroll-triggered, reduced-motion-safe number spin-up |

---

## Important Files

| Path | Why it matters |
|---|---|
| `src/index.css` | Single source of truth for all tokens — touch carefully |
| `src/lib/motion.ts` | All shared animation variants — extend here, not inline |
| `src/components/layout/SceneBackground.tsx` | The crossfade scene engine — fragile; test scroll behavior after any edit |
| `src/components/ui/Section.tsx` | Scene wrapper glue — every section depends on this |
| `src/App.tsx` | Section order is locked; do not reorder |
| `src/data/stats.ts` | DepartmentStats data source |
| `src/data/people.ts` | People section data |
| `src/data/teams.ts` | Team definitions + per-team `--accent`/`--accent-glow` CSS vars |
| `src/data/timeline.ts` | Timeline events |
| `src/data/workflow.ts` | HowWeWork 8-step data |
| `src/data/messages.ts` | CelebrationWall messages |
| `src/data/department.ts` | Department-level data |
| `src/components/sections/DepartmentOverview.tsx` | **Unused** — dropped from the flow but file + `pillars` data preserved intentionally |

---

## What Has Been Implemented

- Full section skeleton: all 8 sections wired, each with `.tsx` + `.module.css`
- Design token system in `src/index.css` (palette, gradients, spacing, shadows, buttons)
- Cinematic layer: film grain (`GrainOverlay`), scroll progress bar, scene-morphing background system (`SceneBackground` + `SceneProvider` + `useSceneActivation`)
- `Section` component as auto-registering scene wrapper (scroll-driven cross-dissolve)
- Shared motion library (`lib/motion.ts`) with all named variants
- `SectionHeading` with chapter index + `maskUp` reveal
- `useCountUp` hook for the telemetry band
- `useTilt` hook for card tilt + spotlight
- `PersonModal` with full focus trap and focus restore
- `DepartmentStats` live count-up band
- `TeamUniverse` orbit centerpiece with `.coolField` (only cool scene)
- `Teams` with three distinct team module layouts
- `People` galaxy node-cards
- `Timeline` with amber 2015/2025 bookends
- `HowWeWork` 8-step collaboration cycle
- `CelebrationWall` closing section
- Global a11y: `:focus-visible`, `prefers-reduced-motion` reset, touch media query reveals
- Per-team accent CSS var pattern (`--accent`/`--accent-glow` passed from `teamsById`)

---

## What Must Be Preserved in Future Work

1. **Section order in `App.tsx`** — locked, do not reorder or remove sections
2. **Amber scarcity rule** — `--amber` / `--gradient-hallmark` used ONLY on hero "10", timeline 2015/2025 bookends, CelebrationWall closing sparkle
3. **Warm spine** — violet/teal confined to `TeamUniverse` `.coolField` only; all other scenes stay red/burgundy/coral/magenta
4. **Monospace scope** — restricted to Universe scene + DepartmentStats telemetry band; never leaked into warm scenes
5. **Motion variant reuse** — add animation needs to `lib/motion.ts`, never hand-roll inline variants
6. **Button classes** — always use global `.btn` + `.btn-primary` / `.btn-ghost`; never hand-roll CTA styles
7. **Scene wrapper** — always use `<Section id=…>` so the scene system and scroll transitions work
8. **A11y patterns** — keep `:focus-visible`, `prefers-reduced-motion`, touch reveals, and `PersonModal` focus trap intact
9. **`DepartmentOverview` file** — intentionally unused but preserved; do not delete

---

## Next Recommended Steps

1. **Content population** — fill in real people data (`data/people.ts`), timeline events (`data/timeline.ts`), celebration messages (`data/messages.ts`), and stats (`data/stats.ts`) with actual department content
2. **Visual polish pass on Teams** — the three module layouts (PM pipeline / PP stack / BPT console) are structurally in place; refine their visual differentiation and internal hierarchy
3. **CelebrationWall** — implement the amber sparkle closing animation and ensure the wall card grid reads as a genuine emotional send-off
4. **TeamUniverse orbit** — verify the orbit animation renders smoothly at 60 fps and the `.coolField` edge mask correctly blends back to the warm spine
5. **Responsive / mobile pass** — audit all sections at 375 px; ensure `useTilt` pointer effects degrade gracefully on touch
6. **Performance audit** — check for layout thrash in `SceneBackground` IntersectionObserver; verify `GrainOverlay` SVG filter performance on low-end devices
7. **Accessibility audit** — run axe or Lighthouse on the full page scroll; verify all section headings have logical heading hierarchy
8. **Navigation links** — confirm Navbar anchor links (`#universe`, `#teams`, `#people`, `#timeline`, `#collaboration`, `#wall`) all resolve and scroll correctly
