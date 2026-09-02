import { useCallback, useEffect, useRef, useState } from 'react'
import styles from './MusicToggle.module.css'

const MUSIC_PREFERENCE_KEY = 'ppmd-soundtrack'
const MUSIC_SRC = `${import.meta.env.BASE_URL}audio/berrydeep-ambient-technology-engineering-565402.mp3`
const TARGET_VOLUME = 0.28
const FADE_DURATION_MS = 900

type MusicPreference = 'on' | 'off'

function readPreference(): MusicPreference {
  try {
    return localStorage.getItem(MUSIC_PREFERENCE_KEY) === 'on' ? 'on' : 'off'
  } catch {
    return 'off'
  }
}

function savePreference(preference: MusicPreference) {
  try {
    localStorage.setItem(MUSIC_PREFERENCE_KEY, preference)
  } catch {
    // The soundtrack still works when private browsing blocks storage.
  }
}

export default function MusicToggle() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const fadeFrameRef = useRef<number | null>(null)
  const [playing, setPlaying] = useState(false)
  const [unavailable, setUnavailable] = useState(false)

  const cancelFade = useCallback(() => {
    if (fadeFrameRef.current !== null) {
      cancelAnimationFrame(fadeFrameRef.current)
      fadeFrameRef.current = null
    }
  }, [])

  const fadeTo = useCallback(
    (target: number, onComplete?: () => void) => {
      const audio = audioRef.current
      if (!audio) return

      cancelFade()
      const initialVolume = audio.volume
      const startedAt = performance.now()

      const step = (now: number) => {
        const progress = Math.min((now - startedAt) / FADE_DURATION_MS, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        audio.volume = initialVolume + (target - initialVolume) * eased

        if (progress < 1) {
          fadeFrameRef.current = requestAnimationFrame(step)
        } else {
          fadeFrameRef.current = null
          onComplete?.()
        }
      }

      fadeFrameRef.current = requestAnimationFrame(step)
    },
    [cancelFade],
  )

  const start = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) return

    cancelFade()
    audio.volume = 0

    try {
      await audio.play()
      setUnavailable(false)
      setPlaying(true)
      savePreference('on')
      fadeTo(TARGET_VOLUME)
    } catch {
      setPlaying(false)
      setUnavailable(true)
      savePreference('off')
    }
  }, [cancelFade, fadeTo])

  const stop = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return

    setPlaying(false)
    savePreference('off')
    fadeTo(0, () => audio.pause())
  }, [fadeTo])

  const toggle = () => {
    if (playing) stop()
    else void start()
  }

  useEffect(() => {
    if (readPreference() !== 'on') return

    const resume = () => void start()
    window.addEventListener('pointerdown', resume, { once: true })
    window.addEventListener('keydown', resume, { once: true })

    return () => {
      window.removeEventListener('pointerdown', resume)
      window.removeEventListener('keydown', resume)
    }
  }, [start])

  useEffect(() => () => cancelFade(), [cancelFade])

  return (
    <>
      <audio
        ref={audioRef}
        src={MUSIC_SRC}
        loop
        preload="metadata"
        onError={() => {
          setUnavailable(true)
          setPlaying(false)
        }}
      />
      <button
        type="button"
        className={`${styles.button} ${playing ? styles.playing : ''}`}
        onClick={toggle}
        disabled={unavailable}
        aria-pressed={playing}
        aria-label={playing ? 'Turn soundtrack off' : 'Turn soundtrack on'}
        title={unavailable ? 'Soundtrack unavailable' : playing ? 'Sound off' : 'Sound on'}
      >
        <span className={styles.icon} aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span className={styles.label}>Sound</span>
        <span className={styles.state}>{playing ? 'On' : 'Off'}</span>
      </button>
    </>
  )
}
