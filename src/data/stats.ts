/** Anniversary telemetry — edit values/labels freely. Numbers count up on scroll. */
export interface Stat {
  value: number
  prefix?: string
  suffix?: string
  label: string
  sub: string
}

export const stats: Stat[] = [
  { value: 10, suffix: '', label: 'Years of delivery', sub: '2015 — 2025' },
  { value: 3, suffix: '', label: 'Teams, one department', sub: 'PM · PP · BPT' },
  { value: 11, suffix: '', label: 'People behind it', sub: 'and counting' },
  { value: 100, suffix: '%', label: 'Commitment to quality', sub: 'every release' },
]
