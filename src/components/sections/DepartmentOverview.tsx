import { motion } from 'motion/react'
import { Container } from '../ui/Container'
import { Section } from '../ui/Section'
import { SectionHeading } from '../ui/SectionHeading'
import { pillarIcons } from '../ui/iconMap'
import { department, pillars } from '../../data/department'
import { staggerContainer, staggerItem, viewportOnce } from '../../lib/motion'
import styles from './DepartmentOverview.module.css'

export function DepartmentOverview() {
  return (
    <Section id="department">
      <Container>
        <SectionHeading
          eyebrow="The Department"
          title="Five disciplines,"
          highlight="one team"
          description={department.intro}
        />

        <motion.div
          className={styles.grid}
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          {pillars.map((pillar) => {
            const Icon = pillarIcons[pillar.icon]
            return (
              <motion.article
                key={pillar.title}
                className={styles.card}
                variants={staggerItem}
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              >
                <span className={styles.icon}>
                  <Icon width={22} height={22} />
                </span>
                <h3 className={styles.title}>{pillar.title}</h3>
                <p className={styles.desc}>{pillar.description}</p>
                <span className={styles.line} aria-hidden />
              </motion.article>
            )
          })}
        </motion.div>
      </Container>
    </Section>
  )
}
