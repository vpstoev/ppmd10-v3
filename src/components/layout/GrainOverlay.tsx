import styles from './GrainOverlay.module.css'

/**
 * Cinematic material layer: a fine film grain + edge vignette rendered
 * above the page content (but below modals/nav). Purely decorative and
 * static, so it's safe under reduced-motion.
 */
export function GrainOverlay() {
  return (
    <>
      <div className={styles.grain} aria-hidden />
      <div className={styles.vignette} aria-hidden />
    </>
  )
}
