import type { ReactNode } from 'react'

interface EmphasizedTextProps {
  text: string
  phrases?: string[]
  className?: string
}

/** Render only the exact rich-text runs the editor marked bold in Excel. */
export function EmphasizedText({ text, phrases = [], className }: EmphasizedTextProps): ReactNode {
  const matches = phrases
    .flatMap((phrase) => {
      const at = text.indexOf(phrase)
      return at < 0 ? [] : [{ at, end: at + phrase.length }]
    })
    .sort((a, b) => a.at - b.at)

  if (!matches.length) return text
  const nodes: ReactNode[] = []
  let cursor = 0
  for (const match of matches) {
    if (match.at < cursor) continue
    if (match.at > cursor) nodes.push(text.slice(cursor, match.at))
    nodes.push(<strong key={`${match.at}-${match.end}`} className={className}>{text.slice(match.at, match.end)}</strong>)
    cursor = match.end
  }
  if (cursor < text.length) nodes.push(text.slice(cursor))
  return nodes
}
