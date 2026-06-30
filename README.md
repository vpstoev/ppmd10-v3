# 10 Years · Project & Processes Management Department · A1

A premium, interactive anniversary website celebrating **10 years** of the A1
**Project & Processes Management Department** and its three teams. Built as both
a celebration site and a modern internal department profile.

## Tech stack

- **React 19** + **TypeScript**
- **Vite 8** for dev/build
- **Motion** (`motion/react`) for animation
- **CSS Modules** + a design-token system in `src/index.css`
- **Typography**: Sora (headings, navigation, buttons, labels) + Inter (body), loaded from Google Fonts with preconnect + `display=swap`
- **No external npm UI/icon/data dependencies** — icons and the particle field are hand-built

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check + production build
npm run preview  # preview the production build
npm run lint     # run eslint
```

## Editing the content

All content lives in plain data files under **`src/data/`** — no need to touch
components to update the celebration:

| File            | What it controls                                        |
| --------------- | ------------------------------------------------------- |
| `department.ts` | Department name, tagline, intro, and the overview cards |
| `teams.ts`      | The three teams: names, colors, icons, missions         |
| `people.ts`     | The roster — names, roles, superpowers, quotes, avatars  |
| `timeline.ts`   | The 10-year milestones                                  |
| `workflow.ts`   | The "How We Work Together" flow steps                   |
| `messages.ts`   | The celebration-wall messages                           |
| `types.ts`      | Shared data shapes                                      |

Person photos are optional — add a `photo` path to any person and it replaces
the generated initials avatar automatically.

## Sections

1. **Anniversary Hero** — animated "10 Years", particle/connection network, tagline
2. **Department Overview** — five animated discipline cards
3. **Three Teams** — distinct accent color, icon and mission per team
4. **Team Universe** — interactive orbit: department at the center, teams around it
5. **People** — filterable cards, click to open a profile
6. **Person Modal** — full profile with "known for", contribution, fun fact, 10-year message
7. **Timeline** — vertical, scroll-driven milestone reveals
8. **How We Work Together** — animated collaboration flow
9. **Celebration Wall** — mosaic of messages

## Design & performance

A1-inspired identity: near-black background, white text, A1 red (`#E2001A`) as
the primary accent, with each team carrying its own accent under one system.
Animations share common easing/variants (`src/lib/motion.ts`); the hero particle
field caps DPR and scales particle count to the viewport. **Reduced-motion
preferences are fully respected** — the particle field freezes and transitions
collapse when the user opts out.
