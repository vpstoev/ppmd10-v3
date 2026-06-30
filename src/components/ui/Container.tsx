import type { ReactNode } from 'react'
import styles from './Container.module.css'

interface ContainerProps {
  children: ReactNode
  className?: string
  /** Narrower max-width for prose-heavy blocks. */
  size?: 'default' | 'narrow'
}

export function Container({ children, className = '', size = 'default' }: ContainerProps) {
  return (
    <div className={`${styles.container} ${size === 'narrow' ? styles.narrow : ''} ${className}`}>
      {children}
    </div>
  )
}
