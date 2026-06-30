import { department } from '../../data/department'
import styles from './Logo.module.css'

/** A1-inspired brand mark + department abbreviation + anniversary tag. */
export function Logo() {
  return (
    <a href="#top" className={styles.logo} aria-label={`${department.name} home`}>
      <span className={styles.mark} aria-hidden>
        A1
      </span>
      <span className={styles.text}>
        <span className={styles.word}>{department.short}</span>
        <span className={styles.tag}>{department.anniversary} Years</span>
      </span>
    </a>
  )
}
