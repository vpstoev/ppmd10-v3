# Design QA — profile details and Voices entry

## Evidence

- Source visual truth:
  - `C:\Users\user\AppData\Local\Temp\codex-clipboard-4d4bf95f-218e-4e90-9b85-1d4e2985276d.png`
  - `C:\Users\user\AppData\Local\Packages\Microsoft.ScreenSketch_8wekyb3d8bbwe\TempState\Recordings\20260901-1026-48.2577862.mp4`
  - extracted entry sequence: `C:\Users\user\.codex\.chatgpt-projects\g-p-6a552be1611881919c179373264aa167\video-frames-1026\entry-0-1.2.jpg`
- Browser-rendered implementation:
  - profile detail: `C:\Users\user\.codex\.chatgpt-projects\g-p-6a552be1611881919c179373264aa167\qa-aneliya.jpg`
  - Voices opening: `C:\Users\user\.codex\.chatgpt-projects\g-p-6a552be1611881919c179373264aa167\qa-voices-opening.jpg`
  - Voices clickable field: `C:\Users\user\.codex\.chatgpt-projects\g-p-6a552be1611881919c179373264aa167\qa-voices-field.jpg`
- Combined comparison inputs:
  - focused profile comparison: `C:\Users\user\.codex\.chatgpt-projects\g-p-6a552be1611881919c179373264aa167\qa-profile-comparison.jpg`
  - full Voices sequence comparison: `C:\Users\user\.codex\.chatgpt-projects\g-p-6a552be1611881919c179373264aa167\qa-voices-comparison.jpg`
- Viewport: 1280 × 720 CSS px, DPR 1.
- Pixel dimensions: source profile screenshot 1266 × 894; implementation captures 1280 × 720; focused comparison 1280 × 760; full sequence comparison 1920 × 1120.
- Normalization: profile comparison uses matching right-side portrait/control crops, scaled proportionally into equal-height panels. Voices comparison keeps the recorded 0–1.2 s contact sheet together and places the two final 1280 × 720 states beside it.
- States: Aneliya Panayotova profile detail; Voices opening at progress 0; Voices stable author field at progress 0.62.

## Findings

No actionable P0, P1 or P2 issues remain in the requested desktop states.

- Fonts and typography: existing Geist family and weight hierarchy are unchanged. New guidance copy uses the established compact uppercase label treatment. Names and roles retain consistent optical hierarchy.
- Spacing and layout rhythm: the portrait frame now matches the requested restrained scale, is vertically centred, and has a wider clear area with rounded corners. The close control is centred exactly: measured icon-to-button centre delta is 0 px on both axes.
- Colors and tokens: existing team/profile accent tokens are preserved. Portrait edge shading remains soft rather than becoming a hard rectangle. Voices uses the existing restrained violet/gold field atmosphere.
- Image quality and asset fidelity: the original portrait assets remain in use without re-encoding or stretching. `object-fit: contain` and the widened clear mask preserve each subject while the blurred backdrop stays confined to the rounded frame.
- Copy and content: `Scroll to gather the voices` explains the choreography and `Choose a voice` makes the interactive state explicit without adding navigation chrome.
- Icons: the existing Lucide close icon is retained and is now optically and geometrically centred.
- Interaction and accessibility: navigation from a later section lands immediately on the Voices opening rather than scrubbing through the timeline. Hidden author buttons are inert, `aria-hidden`, and non-pointer-interactive until the stable field. Selecting Diyana Neycheva opened Diyana Neycheva's testimonial, and the mouse-accessible close control returned to the same field.
- Browser console: no runtime errors. Only pre-existing Three.js deprecation/context-reset messages appeared during hot reload.

## Comparison history

### Pass 1 — blocked

- [P1] Profile close icon was visibly off-centre because an earlier flex alignment rule survived the later layout override.
- [P2] Portrait clear area was too narrow and the frame lacked the requested rounded editorial crop.
- [P1] Smooth navigation from below rapidly scrubbed through the long Voices pinned sequence, making the opening and rearrangement appear missing.
- [P1] Invisible author buttons remained pointer-active and could open a different person than the visible decorative name.

Fixes applied: explicit flex centring for the close control and SVG; wider rounded portrait frame and clear mask; instant navigation only for Voices; shorter retimed scroll runway; richer opening depth; explicit opening guidance; longer stable author field; pointer and accessibility gating outside the stable field.

### Pass 2 — passed

- The combined profile comparison shows the portrait area expanded to the requested size with rounded edges and a centred close control.
- The combined Voices comparison shows a distinct animated opening and a separate stable clickable-name state instead of the recorded rapid closing-to-field scrub.
- Browser measurements confirm the close icon centre delta is `(0, 0)`.
- Browser interaction confirms the field becomes interactive only inside its stable progress window and opens the matching testimonial.

## Primary interactions tested

- Desktop section navigation from the end of the page to Voices.
- Opening motion over time (computed transform changed after 1.2 s while scroll position stayed fixed).
- Scroll from opening to stable author field.
- Hidden author controls before the field (`inert`, `aria-hidden`, `pointer-events: none`).
- Correct visible-name selection and testimonial close/return.
- Open and close People and Teams profile details.
- Close-button geometry and portrait rendering for both leadership and team profiles.

## Follow-up polish

- P3 test gap: the in-app browser viewport for this run was fixed at 1280 × 720, so the changed desktop states were not re-captured at a second browser width. The existing narrow/mobile branches were not structurally changed, and lint plus production build both pass.

final result: passed
