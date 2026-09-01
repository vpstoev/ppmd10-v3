import { useEffect, useRef, useState } from 'react'
import { getSections } from './siteConfig'
import { useReducedMotionPref } from './ppmd-shared/sectionHooks'
import s from './SectionNavigation.module.css'

/**
 * Minimal section navigation: a fixed progress rail on desktop, a single
 * menu control on mobile. Sections come from siteConfig, so disabling
 * the Projects section updates the navigation automatically.
 */
export default function SectionNavigation() {
  const sections = getSections()
  const reducedMotion = useReducedMotionPref()
  const [active, setActive] = useState(sections[0].id)
  const [open, setOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const mid = window.innerHeight * 0.5
      let current = sections[0].id
      for (const sec of sections) {
        const el = document.getElementById(`ppmd-${sec.id}`)
        if (el && el.getBoundingClientRect().top <= mid) current = sec.id
      }
      setActive(current)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- section list is stable per build
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    panelRef.current?.querySelector('button')?.focus()
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const go = (id: string) => {
    const target = document.getElementById(`ppmd-${id}`)
    if (target && id === 'voices') {
      /* The global `scroll-behavior: smooth` otherwise scrubs the entire
         pinned Voices timeline while navigating to it from a later section. */
      const top = target.getBoundingClientRect().top + window.scrollY
      window.scrollTo({ top, behavior: 'instant' as ScrollBehavior })
    } else {
      target?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' })
    }
    setOpen(false)
  }

  return (
    <>
      {/* Desktop progress rail */}
      <nav className={s.rail} aria-label="Sections">
        {sections.map((sec) => (
          <button
            key={sec.id}
            type="button"
            className={s.railItem}
            aria-current={active === sec.id ? 'true' : undefined}
            onClick={() => go(sec.id)}
          >
            <span className={s.railLabel}>{sec.label}</span>
            <span className={s.railDot} aria-hidden="true" />
          </button>
        ))}
      </nav>

      {/* Mobile menu control */}
      <div className={s.mobileNav}>
        <button
          ref={toggleRef}
          type="button"
          className={s.mobileToggle}
          aria-expanded={open}
          aria-controls="ppmd-section-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? 'Close' : 'Sections'}
        </button>
        {open && (
          <div ref={panelRef} id="ppmd-section-menu" className={s.mobilePanel}>
            <nav aria-label="Sections">
              {sections.map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  className={s.mobileItem}
                  aria-current={active === sec.id ? 'true' : undefined}
                  onClick={() => go(sec.id)}
                >
                  {sec.label}
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>
    </>
  )
}
