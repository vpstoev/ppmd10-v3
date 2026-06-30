import type { ReactNode } from 'react'
import styles from './Badge.module.css'

interface BadgeProps {
  children: ReactNode
  /** Optional leading dot / icon. */
  icon?: ReactNode
  className?: string
}

/** Small pill used for eyebrow labels above headings. */
export function Badge({ children, icon, className = '' }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${className}`}>
      {icon ?? <span className={styles.dot} aria-hidden />}
      {children}
    </span>
  )
}
