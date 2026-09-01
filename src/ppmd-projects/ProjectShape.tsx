import type { ProjectAccent } from './projectAccents'
import s from './ProjectShape.module.css'

/**
 * The abstract figure behind a project scene.
 *
 * Ten compositions, drawn as line-weight SVG on a low two-stop wash. They
 * are ENVIRONMENT, not illustration: none of them depicts what a project
 * did, because a literal icon for "Transition to EURO" or "5G" would be
 * either a cliché or a guess, and sixteen guesses in a row would read as
 * clip art. What they do carry is difference — sixteen scenes that are
 * plainly not the same scene.
 *
 * Everything is deterministic. A project's figure, its crop, its rotation
 * and its scale come from the table in `projectsData`, keyed by the
 * workbook id, so the same project draws the same figure on every load
 * and in every build. Nothing here is generated at runtime.
 *
 * Readability comes first: the whole layer sits behind the text at low
 * opacity with a mask that opens toward the reading column, and it is
 * marked `aria-hidden` and `pointer-events: none` throughout.
 */

export type ShapeKind =
  | 'orbitalRings'
  | 'diagonalBeam'
  | 'concentricContours'
  | 'archFrame'
  | 'clippedPolygon'
  | 'splitArcs'
  | 'meshWave'
  | 'capsuleStack'
  | 'radialFlare'
  | 'isoGrid'

/** How one project crops and turns its figure. Authored, never rolled. */
export interface ShapePlacement {
  kind: ShapeKind
  /** Uniform scale of the figure inside its frame. */
  scale: number
  /** Rotation in degrees. */
  rotate: number
  /** Offset from the frame's centre, in percent of the frame. */
  x: number
  y: number
  /** Overall strength, 0..1 — the ceiling is low on purpose. */
  strength: number
}

/* Every figure is drawn in one 200×200 space and fitted by the wrapper,
   so scale and rotation mean the same thing for all ten. */
const BOX = 200

function Figure({ kind }: { kind: ShapeKind }) {
  switch (kind) {
    case 'orbitalRings':
      return (
        <>
          <ellipse cx="100" cy="100" rx="86" ry="34" />
          <ellipse cx="100" cy="100" rx="62" ry="76" />
          <ellipse cx="100" cy="100" rx="30" ry="88" />
          <circle cx="100" cy="100" r="7" className={s.solid} />
        </>
      )

    case 'diagonalBeam':
      return (
        <>
          <path d="M -30 172 L 150 -18" strokeWidth="26" className={s.beam} />
          <path d="M -30 196 L 174 -18" />
          <path d="M -8 200 L 200 -8" />
          <path d="M 24 208 L 224 12" />
          <path d="M 62 212 L 236 40" strokeWidth="0.6" />
        </>
      )

    case 'concentricContours':
      return (
        <>
          {[18, 34, 50, 66, 82, 98].map((r, i) => (
            <circle key={r} cx="86" cy="104" r={r} strokeWidth={i % 2 ? 1.4 : 0.7} />
          ))}
          <line x1="86" y1="0" x2="86" y2="200" strokeWidth="0.5" />
        </>
      )

    case 'archFrame':
      return (
        <>
          <path d="M 26 190 L 26 92 A 74 74 0 0 1 174 92 L 174 190" />
          <path d="M 52 190 L 52 96 A 48 48 0 0 1 148 96 L 148 190" strokeWidth="0.8" />
          <path d="M 78 190 L 78 100 A 22 22 0 0 1 122 100 L 122 190" strokeWidth="0.8" />
          <line x1="4" y1="190" x2="196" y2="190" strokeWidth="1.6" />
        </>
      )

    case 'clippedPolygon':
      return (
        <>
          <path d="M 100 8 L 186 58 L 186 148 L 100 196 L 14 148 L 14 58 Z" strokeWidth="1.5" />
          <path d="M 100 40 L 158 74 L 158 138 L 100 168 L 42 138 L 42 74 Z" />
          <path d="M 14 58 L 186 148" strokeWidth="0.6" />
          <path d="M 186 58 L 14 148" strokeWidth="0.6" />
        </>
      )

    case 'splitArcs':
      return (
        <>
          <path d="M 96 -8 A 108 108 0 0 0 96 208" strokeWidth="1.6" />
          <path d="M 120 -8 A 84 84 0 0 0 120 208" strokeWidth="0.8" />
          <path d="M 104 -8 A 140 140 0 0 1 104 208" strokeWidth="1.6" />
          <path d="M 80 -8 A 116 116 0 0 1 80 208" strokeWidth="0.8" />
        </>
      )

    case 'meshWave':
      return (
        <>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <path
              key={i}
              d={`M -10 ${44 + i * 20} C 40 ${20 + i * 20}, 78 ${72 + i * 20}, 118 ${46 + i * 20} S 190 ${18 + i * 20}, 214 ${52 + i * 20}`}
              strokeWidth={i % 2 ? 1.3 : 0.6}
            />
          ))}
        </>
      )

    case 'capsuleStack':
      return (
        <>
          {[
            [18, 28, 150, 26],
            [42, 66, 126, 26],
            [10, 104, 168, 26],
            [56, 142, 108, 26],
          ].map(([x, y, w, h]) => (
            <rect key={y} x={x} y={y} width={w} height={h} rx={h / 2} />
          ))}
          <rect x="18" y="28" width="60" height="26" rx="13" className={s.solid} />
        </>
      )

    case 'radialFlare':
      return (
        <>
          {Array.from({ length: 18 }, (_, i) => {
            const a = (i / 18) * Math.PI * 2
            const inner = 22
            const outer = i % 3 === 0 ? 104 : 74
            return (
              <line
                key={i}
                x1={100 + Math.cos(a) * inner}
                y1={100 + Math.sin(a) * inner}
                x2={100 + Math.cos(a) * outer}
                y2={100 + Math.sin(a) * outer}
                strokeWidth={i % 3 === 0 ? 1.4 : 0.6}
              />
            )
          })}
          <circle cx="100" cy="100" r="22" />
        </>
      )

    case 'isoGrid':
      return (
        <>
          {Array.from({ length: 9 }, (_, i) => (
            <line key={`a${i}`} x1={-40 + i * 34} y1="212" x2={60 + i * 34} y2="-12" strokeWidth="0.7" />
          ))}
          {Array.from({ length: 9 }, (_, i) => (
            <line key={`b${i}`} x1={-40 + i * 34} y1="-12" x2={60 + i * 34} y2="212" strokeWidth="0.7" />
          ))}
          <path d="M 46 100 L 100 66 L 154 100 L 100 134 Z" strokeWidth="1.6" />
        </>
      )
  }
}

export function ProjectShape({
  placement,
  accent,
  /** 0..1 — the scene's own presence, so the figure arrives with it. */
  presence,
  /** Mirrors the composition for the right-hand editorial side. */
  flip,
  reducedMotion,
}: {
  placement: ShapePlacement
  accent: ProjectAccent
  presence: number
  flip: boolean
  reducedMotion: boolean
}) {
  const { kind, scale, rotate, x, y, strength } = placement
  /* The figure settles into place as the scene arrives. With reduced
     motion it is simply there at its resting position — the difference
     between scenes is carried by the figure itself, not by its travel. */
  const drift = reducedMotion ? 0 : (1 - presence) * 26
  const zoom = reducedMotion ? scale : scale * (1.06 - 0.06 * presence)

  return (
    <div
      className={`${s.layer} ${flip ? s.flip : ''}`}
      aria-hidden="true"
      style={{ opacity: presence * strength }}
    >
      <div
        className={s.wash}
        style={{
          background: accent.iridescent
            ? undefined
            : `radial-gradient(58% 52% at 50% 46%, ${accent.from}2e, transparent 72%),
               radial-gradient(46% 60% at 62% 66%, ${accent.to}22, transparent 76%)`,
        }}
      />
      <div className={s.copyShade} />
      <svg
        className={s.figure}
        viewBox={`0 0 ${BOX} ${BOX}`}
        preserveAspectRatio="xMidYMid slice"
        style={{
          transform: `translate(${x}%, ${y + drift * 0.1}%) rotate(${rotate}deg) scale(${zoom.toFixed(3)})`,
        }}
      >
        <defs>
          <linearGradient id={`pg-${kind}-${rotate}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={accent.from} />
            {accent.via && <stop offset="50%" stopColor={accent.via} />}
            <stop offset="100%" stopColor={accent.to} />
          </linearGradient>
        </defs>
        <g
          className={s.strokes}
          stroke={`url(#pg-${kind}-${rotate})`}
          fill="none"
          strokeWidth="1"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        >
          <Figure kind={kind} />
        </g>
      </svg>
    </div>
  )
}
