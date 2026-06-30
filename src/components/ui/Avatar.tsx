import type { CSSProperties } from 'react'
import type { Person } from '../../data/types'
import { teamsById } from '../../data/teams'
import styles from './Avatar.module.css'

interface AvatarProps {
  person: Person
  size?: number
}

/** Initials avatar with the person's team accent; uses photo when provided. */
export function Avatar({ person, size = 56 }: AvatarProps) {
  const team = teamsById[person.team]
  const initials = person.name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const style = {
    width: size,
    height: size,
    fontSize: size * 0.36,
    '--accent': `var(${team.accentVar})`,
    '--accent-glow': `var(${team.accentGlowVar})`,
  } as CSSProperties

  return (
    <span className={styles.avatar} style={style}>
      {person.photo ? (
        <img src={person.photo} alt={person.name} className={styles.img} />
      ) : (
        <span className={styles.initials}>{initials}</span>
      )}
    </span>
  )
}
