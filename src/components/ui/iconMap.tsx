import type { ComponentType, SVGProps } from 'react'
import {
  ClipboardIcon,
  CompassIcon,
  FlaskIcon,
  NetworkIcon,
  ShieldIcon,
  TargetIcon,
  TransformIcon,
} from './icons'
import type { Pillar, Team } from '../../data/types'

type IconComp = ComponentType<SVGProps<SVGSVGElement>>

/** Maps the string keys used in data files to real icon components. */
export const pillarIcons: Record<Pillar['icon'], IconComp> = {
  delivery: TargetIcon,
  governance: ClipboardIcon,
  transform: TransformIcon,
  quality: ShieldIcon,
  coordination: NetworkIcon,
}

export const teamIcons: Record<Team['icon'], IconComp> = {
  compass: CompassIcon,
  governance: ClipboardIcon,
  testing: FlaskIcon,
}
