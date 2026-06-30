import { Container } from '../ui/Container'
import { Logo } from './Logo'
import { teams } from '../../data/teams'
import { department } from '../../data/department'
import styles from './Footer.module.css'

const sections = [
  { label: 'The Department', href: '#department' },
  { label: 'Operating Model', href: '#universe' },
  { label: 'People', href: '#people' },
  { label: 'Timeline', href: '#timeline' },
  { label: 'How We Work', href: '#collaboration' },
  { label: 'Celebration Wall', href: '#wall' },
]

export function Footer() {
  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.top}>
          <div className={styles.brand}>
            <Logo />
            <p className={styles.tagline}>{department.tagline}.</p>
          </div>

          <nav className={styles.cols}>
            <div className={styles.col}>
              <h4>Explore</h4>
              <ul>
                {sections.map((s) => (
                  <li key={s.href}>
                    <a href={s.href}>{s.label}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div className={styles.col}>
              <h4>Teams</h4>
              <ul>
                {teams.map((t) => (
                  <li key={t.id}>
                    <a href="#teams">{t.short}</a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>

        <div className={styles.bottom}>
          <span>
            © {new Date().getFullYear()} {department.company} · {department.name}
          </span>
          <span className={styles.made}>
            {department.anniversary} years of delivery, structure, quality & teamwork
          </span>
        </div>
      </Container>
    </footer>
  )
}
