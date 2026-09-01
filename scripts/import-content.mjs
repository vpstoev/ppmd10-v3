/**
 * Turn the content workbook into a static TypeScript module.
 *
 *   node scripts/import-content.mjs [--check]
 *
 * The site is static and ships to GitHub Pages, so nothing here runs in a
 * browser and the workbook is never a runtime dependency: this reads it
 * locally, writes `src/ppmd-content/workbookContent.ts`, and that
 * generated file is what the application imports. Re-run it whenever the
 * workbook changes and commit the result.
 *
 * `--check` regenerates into memory and reports whether the committed
 * file is still in step, without writing anything.
 *
 * The workbook is opened READ-ONLY (see `scripts/xlsx.mjs`). It carries
 * VBA, and nothing in this pipeline may re-save it.
 *
 * WHAT THIS DOES NOT DO
 * The workbook is a working document: it holds instructions, notes,
 * character-count helpers and sample text alongside the real records. So
 * this reads only rows carrying a valid record id for their sheet, and it
 * drops values that are template filler rather than content — `lorem
 * ipsum`, `TBD`, a row of dots. Dropping is the point: a field with no
 * real content is ABSENT from the generated data, and every surface on
 * the site already omits what it is not given. Nothing is invented to
 * fill a gap, and nothing that is filler reaches a reader.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { openWorkbook } from './xlsx.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const WORKBOOK = join(ROOT, 'PPMD_Website_Content_Template_V4.xlsm')
const OUT = join(ROOT, 'src', 'ppmd-content', 'workbookContent.ts')

/* ── Cleaning ───────────────────────────────────────────────────── */

/**
 * Leading and trailing whitespace only.
 *
 * Interior spacing is left exactly as written. A quote is somebody's own
 * words and a biography is somebody's own paragraph break; collapsing
 * runs inside them would be rewriting content, which this script has no
 * mandate to do. Non-breaking spaces are folded first, because they
 * arrive invisibly from Excel and would otherwise survive a trim and
 * show up as a stray indent on the page.
 */
function trim(value) {
  return String(value ?? '')
    .replace(/ /g, ' ')
    .replace(/^[\s​]+|[\s​]+$/g, '')
}

/**
 * Values that are scaffolding rather than content.
 *
 * Every pattern here was seen in this workbook. The test is deliberately
 * anchored — a cell that merely CONTAINS the word "placeholder" inside a
 * real sentence is real content, and only a cell that is nothing but
 * filler is dropped. `lorem ipsum` is the exception: it never appears
 * inside anything genuine.
 */
function isPlaceholder(value) {
  const s = trim(value)
  if (!s) return true
  if (/lorem\s+ipsum/i.test(s)) return true
  if (/^(tbd|n\/?a|none|placeholder|todo|xx+)$/i.test(s)) return true
  /* "XX out of YY", "XX/YY" and the same shape with real digits. */
  if (/^[x\d]+\s*(\/|out of)\s*[y\d]+$/i.test(s)) return true
  /* A cell of nothing but dots, ellipses or dashes — "….....", "---". */
  if (/^[.…\-–—\s]+$/.test(s)) return true
  return false
}

/** Content, or nothing at all. Never a placeholder, never an empty string. */
function content(value) {
  const s = trim(value)
  return isPlaceholder(s) ? undefined : s
}

/** `Yes`, `yes`, `YES`, `Y`, `TRUE` — all the same answer. */
function isYes(value) {
  return /^(y|yes|true|1)$/i.test(trim(value))
}

/** A workbook row is publishable only when its review status is Final. */
function isFinal(value) {
  return /^final$/i.test(trim(value))
}

/**
 * The five corrections that were confirmed with the department.
 *
 * Applied by exact match on a trimmed cell, and to nothing else. The
 * workbook holds other oddities — a Cyrillic А in "А1 rebranding", mixed
 * casing in "ICT projects" — and they are left exactly as written,
 * because deciding on somebody's behalf which of their words are typos is
 * not this script's job. See the import report for what was noticed and
 * left alone.
 */
const CORRECTIONS = new Map([
  ['Product lounch', 'Product Launch'],
  ['ICY projects', 'ICT Projects'],
  ['Content porftolio expanion', 'Content Portfolio Expansion'],
  ['Senior Manage', 'Senior Manager'],
  ['Billing and Enterprice Systems Department', 'Billing and Enterprise Systems Department'],
])

/** A name, role, unit, category or title: trimmed, then corrected. */
function label(value) {
  const s = trim(value)
  if (!s) return undefined
  const fixed = CORRECTIONS.get(s)
  if (fixed) corrections.push(`${s} → ${fixed}`)
  return isPlaceholder(fixed ?? s) ? undefined : (fixed ?? s)
}

const corrections = []

/* ── Sheet reading ──────────────────────────────────────────────── */

/**
 * Find the header row by the name of its first column.
 *
 * Every sheet opens with a title, a paragraph of instructions and
 * sometimes a band of helper cells, and the number of those rows differs
 * per sheet and has changed between workbook versions. Looking for the
 * header by name rather than counting rows means a new note at the top of
 * a sheet cannot silently shift every field by one column.
 */
function readSheet(wb, sheetName, idColumn, isRecordId) {
  const rows = wb.rows(sheetName)
  const richRows = wb.richRows(sheetName)
  const headerAt = rows.findIndex(
    (r) => Array.isArray(r) && r.some((c) => trim(c) === idColumn),
  )
  if (headerAt < 0) throw new Error(`${sheetName}: no header row containing "${idColumn}"`)
  const header = rows[headerAt].map((c) => trim(c))
  const idAt = header.indexOf(idColumn)

  const records = []
  for (let i = headerAt + 1; i < rows.length; i++) {
    const row = rows[i] ?? []
    const richRow = richRows[i] ?? []
    const id = trim(row[idAt])
    /* Only rows carrying a valid id for this sheet are records. Notes,
       reminders and stray sums live in the same column and are not. */
    if (!isRecordId(id)) continue
    const get = (name) => {
      const at = header.indexOf(name)
      return at < 0 ? '' : row[at]
    }
    const getRich = (name) => {
      const at = header.indexOf(name)
      return at < 0 ? { text: '', runs: [] } : (richRow[at] ?? { text: '', runs: [] })
    }
    records.push({ id, get, getRich, rowOrder: records.length + 1 })
  }
  return records
}

/** Exact phrases deliberately marked bold by the workbook editor. */
function emphasis(record, field) {
  const full = trim(record.get(field))
  if (!full) return undefined
  const phrases = record.getRich(field).runs
    .filter((run) => run.bold)
    .map((run) => trim(run.text))
    .filter((phrase) => phrase && full.includes(phrase))
  return phrases.length ? [...new Set(phrases)] : undefined
}

/**
 * The order records are shown in.
 *
 * `display_order` is authoritative when it holds a number. In this
 * workbook some of those cells hold a formula Excel has never
 * calculated, which reaches this script as an empty cell rather than as a
 * number — and the honest fallback is the order somebody put the rows in,
 * not zero.
 */
function ordered(records) {
  return records
    .map((r, i) => {
      const raw = Number(trim(r.get('display_order')))
      return { ...r, order: Number.isFinite(raw) && raw > 0 ? raw : i + 1 }
    })
    .sort((a, b) => a.order - b.order)
    .map((r, i) => ({ ...r, order: i + 1 }))
}

/* ── The sheets ─────────────────────────────────────────────────── */

const wb = openWorkbook(WORKBOOK)

const hero = readSheet(wb, '01_Hero', 'content_key', (id) => /^hero\./.test(id)).map((r) => ({
  key: r.id,
  scene: content(r.get('scene')),
  text: content(r.get('final_text')),
  supporting: content(r.get('supporting_text')),
}))

const capabilities = ordered(
  readSheet(wb, '02_Capabilities', 'capability_id', (id) => /^CAP-[A-Z0-9]+$/.test(id)),
).map((r) => ({
  id: r.id,
  displayOrder: r.order,
  name: label(r.get('capability_name')),
  headline: content(r.get('headline')),
  description: content(r.get('description')),
  line: content(r.get('short_visual_line')),
  accent: content(r.get('accent')),
}))

const leadership = ordered(
  readSheet(wb, '03_Leadership', 'leadership_id', (id) =>
    /^(senior-director|department-head)$/.test(id),
  ),
).map((r) => ({
  id: r.id,
  displayOrder: r.order,
  profileType: label(r.get('profile_type')),
  name: label(r.get('name')),
  title: label(r.get('exact_title')),
  unit: label(r.get('organisational_unit')),
  statement: content(r.get('statement')),
  statementEmphasis: emphasis(r, 'statement'),
  shortBio: content(r.get('short_bio')),
  shortBioEmphasis: emphasis(r, 'short_bio'),
  keyContribution: content(r.get('key_contribution')),
  keyContributionEmphasis: emphasis(r, 'key_contribution'),
  personalFact: content(r.get('personal_fact')),
  personalFactEmphasis: emphasis(r, 'personal_fact'),
  quote: content(r.get('quote')),
  photoFilename: content(r.get('photo_filename')),
  photoAlt: content(r.get('photo_alt')),
  photoPosition: content(r.get('photo_position')),
  accent: content(r.get('accent')),
}))

const teams = ordered(
  readSheet(wb, '04_Teams', 'team_id', (id) => /^(PM|PROCESSES|BPT)$/.test(id)),
).map((r) => {
  const facts = [1, 2, 3]
    .map((n) => ({
      value: content(r.get(`fact_${n}_value`)),
      label: label(r.get(`fact_${n}_label`)),
    }))
    /* A label with no number behind it is a caption for nothing. Both
       halves have to be real for the fact to exist. */
    .filter((f) => f.value && f.label)
  return {
    id: r.id,
    displayOrder: r.order,
    name: label(r.get('team_name')),
    professionalsCount: Number(trim(r.get('professionals_count'))) || undefined,
    headline: content(r.get('headline')),
    description: content(r.get('description')),
    facts,
    distinctiveFact: content(r.get('distinctive_fact')),
    accent: content(r.get('accent')),
  }
})

const people = ordered(
  readSheet(wb, '05_People', 'id', (id) => /^(PM|PROC|BPT)-\d+$/.test(id)),
).map((r) => ({
  id: r.id,
  displayOrder: Number(trim(r.get('display_order'))) || r.order,
  name: label(r.get('name')),
  role: label(r.get('role')),
  team: label(r.get('team')),
  isLeadership: isYes(r.get('is_leadership')),
  leadershipOrder: Number(trim(r.get('leadership_order'))) || undefined,
  photoFilename: content(r.get('photo_filename')),
  photoAlt: content(r.get('photo_alt')),
  photoPosition: content(r.get('photo_position')),
  shortBio: content(r.get('short_bio')),
  shortBioEmphasis: emphasis(r, 'short_bio'),
  keyContribution: content(r.get('key_contribution')),
  keyContributionEmphasis: emphasis(r, 'key_contribution'),
  /* The current workbook labels this final people paragraph
     `A_Closer_look`; keep the older key as a backwards-compatible fallback. */
  personalFact: content(r.get('personal_fact') || r.get('A_Closer_look')),
  personalFactEmphasis: emphasis(r, r.get('personal_fact') ? 'personal_fact' : 'A_Closer_look'),
  accent: content(r.get('accent')),
}))

const timeline = ordered(
  readSheet(wb, '06_Timeline', 'milestone_id', (id) => /^M-\d{4}$/.test(id)),
).map((r) => ({
  id: r.id,
  displayOrder: r.order,
  /* The `year` COLUMN is the displayed year. Several milestone ids are
     left over from an earlier draft and no longer agree with it, so
     nothing here is derived from the id. */
  year: trim(r.get('year')),
  title: label(r.get('title')),
  shortDescription: content(r.get('short_description')),
  detailedDescription: content(r.get('detailed_description')),
  accent: content(r.get('accent')),
}))

const projects = ordered(
  readSheet(wb, '07_Projects', 'project_id', (id) => /^PRJ-\d+$/.test(id)),
)
  .filter((r) => isYes(r.get('include_in_site')))
  .map((r) => ({
    id: r.id,
    displayOrder: r.order,
    name: label(r.get('project_name')),
    category: label(r.get('category')),
    description: content(r.get('description')),
    impact: content(r.get('impact_line')),
    accent: content(r.get('accent')),
  }))

const focus = ordered(
  readSheet(wb, '08_Current_Focus', 'focus_id', (id) => /^FOCUS-\d+$/.test(id)),
).map((r) => ({
  id: r.id,
  displayOrder: r.order,
  title: label(r.get('title')),
  line: content(r.get('short_line')),
  detailedDescription: content(r.get('detailed_description')),
  accent: content(r.get('accent')),
}))

const voices = ordered(
  readSheet(wb, '09_Voices', 'voice_id', (id) => /^VOICE-\d+$/.test(id)),
)
  /* Consent alone is not approval: the workbook's Final marking is the
     source-of-truth gate for what can appear on the public page. */
  .filter((r) => isFinal(r.get('status')) && isYes(r.get('consent_confirmed')))
  .map((r) => ({
    id: r.id,
    displayOrder: r.order,
    /* Trimmed and never otherwise touched: these are people's own words,
       and the excerpting the section does happens at render time on whole
       words, leaving the full text reachable. */
    quote: trim(r.get('quote')),
    emphasis: emphasis(r, 'quote') ?? [],
    name: label(r.get('person_name')),
    role: label(r.get('role_title')),
    unit: label(r.get('business_unit')),
    isHighlight: isYes(r.get('is_highlight')),
    photoFilename: content(r.get('photo_filename')),
  }))

const closing = readSheet(wb, '10_Final_Closing', 'content_key', (id) =>
  /^closing\./.test(id),
).map((r) => ({
  key: r.id,
  text: content(r.get('text')),
  supporting: content(r.get('supporting_text')),
}))

const navigation = ordered(
  readSheet(wb, '11_Navigation', 'nav_id', (id) => /^NAV-/.test(id)),
).map((r) => ({
  id: r.id,
  displayOrder: r.order,
  label: label(r.get('label')),
  anchor: content(r.get('section_anchor')),
  showWhenProjectsDisabled: isYes(r.get('show_when_projects_disabled')),
}))

const CONFIG_KEYS = new Set([
  'showProjectsSection',
  'anniversaryStartYear',
  'anniversaryEndYear',
  'departmentName',
  'departmentAbbreviation',
])
const siteConfig = Object.fromEntries(
  readSheet(wb, '12_Site_Config', 'config_key', (id) => CONFIG_KEYS.has(id)).map((r) => [
    r.id,
    trim(r.get('value')),
  ]),
)

/* ── Emit ───────────────────────────────────────────────────────── */

/** Drop undefined fields so the generated file states only what exists. */
function lean(value) {
  if (Array.isArray(value)) return value.map(lean)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, v]) => v !== undefined && v !== '')
        .map(([k, v]) => [k, lean(v)]),
    )
  }
  return value
}

const literal = (value) => JSON.stringify(lean(value), null, 2).replace(/\n/g, '\n')

const banner = `/**
 * GENERATED FILE — do not edit by hand.
 *
 * Produced from PPMD_Website_Content_Template_V4.xlsm by
 * \`node scripts/import-content.mjs\`. Edit the workbook and re-run the
 * script; anything typed here is lost on the next import.
 *
 * This module is the site's own copy of the content. The workbook is
 * never read at runtime and does not need to exist for the site to build
 * or to run.
 *
 * A field that is absent was absent — or was template filler — in the
 * workbook. Every surface treats a missing field as "do not show this
 * line", so nothing here is padded to keep a shape.
 */
`

const body = `${banner}
export interface WorkbookHeroLine {
  key: string
  scene?: string
  text?: string
  supporting?: string
}

export interface WorkbookCapability {
  id: string
  displayOrder: number
  name?: string
  headline?: string
  description?: string
  line?: string
  accent?: string
}

export interface WorkbookLeader {
  id: string
  displayOrder: number
  profileType?: string
  name?: string
  title?: string
  unit?: string
  statement?: string
  statementEmphasis?: string[]
  shortBio?: string
  shortBioEmphasis?: string[]
  keyContribution?: string
  keyContributionEmphasis?: string[]
  personalFact?: string
  personalFactEmphasis?: string[]
  quote?: string
  photoFilename?: string
  photoAlt?: string
  photoPosition?: string
  accent?: string
}

export interface WorkbookTeamFact {
  value?: string
  label?: string
}

export interface WorkbookTeam {
  id: string
  displayOrder: number
  name?: string
  professionalsCount?: number
  headline?: string
  description?: string
  facts: WorkbookTeamFact[]
  distinctiveFact?: string
  accent?: string
}

export interface WorkbookPerson {
  id: string
  displayOrder: number
  name?: string
  role?: string
  team?: string
  isLeadership: boolean
  leadershipOrder?: number
  photoFilename?: string
  photoAlt?: string
  photoPosition?: string
  shortBio?: string
  shortBioEmphasis?: string[]
  keyContribution?: string
  keyContributionEmphasis?: string[]
  personalFact?: string
  personalFactEmphasis?: string[]
  accent?: string
}

export interface WorkbookMilestone {
  id: string
  displayOrder: number
  /** The workbook's own \`year\` column — never derived from the id. */
  year: string
  title?: string
  shortDescription?: string
  detailedDescription?: string
  accent?: string
}

export interface WorkbookProject {
  id: string
  displayOrder: number
  name?: string
  category?: string
  description?: string
  impact?: string
  accent?: string
}

export interface WorkbookFocusArea {
  id: string
  displayOrder: number
  title?: string
  line?: string
  detailedDescription?: string
  accent?: string
}

export interface WorkbookVoice {
  id: string
  displayOrder: number
  /** The full approved quote, exactly as written. */
  quote: string
  emphasis: string[]
  name?: string
  role?: string
  unit?: string
  isHighlight: boolean
  photoFilename?: string
}

export interface WorkbookClosingLine {
  key: string
  text?: string
  supporting?: string
}

export interface WorkbookNavItem {
  id: string
  displayOrder: number
  label?: string
  anchor?: string
  showWhenProjectsDisabled: boolean
}

export const WB_HERO: WorkbookHeroLine[] = ${literal(hero)}

export const WB_CAPABILITIES: WorkbookCapability[] = ${literal(capabilities)}

export const WB_LEADERSHIP: WorkbookLeader[] = ${literal(leadership)}

export const WB_TEAMS: WorkbookTeam[] = ${literal(teams)}

export const WB_PEOPLE: WorkbookPerson[] = ${literal(people)}

export const WB_TIMELINE: WorkbookMilestone[] = ${literal(timeline)}

export const WB_PROJECTS: WorkbookProject[] = ${literal(projects)}

export const WB_FOCUS: WorkbookFocusArea[] = ${literal(focus)}

export const WB_VOICES: WorkbookVoice[] = ${literal(voices)}

export const WB_CLOSING: WorkbookClosingLine[] = ${literal(closing)}

export const WB_NAVIGATION: WorkbookNavItem[] = ${literal(navigation)}

export const WB_SITE_CONFIG: Record<string, string> = ${literal(siteConfig)}
`

const check = process.argv.includes('--check')
if (check) {
  let current = ''
  try {
    current = readFileSync(OUT, 'utf8')
  } catch {
    /* not generated yet */
  }
  const same = current.replace(/\r\n/g, '\n') === body.replace(/\r\n/g, '\n')
  console.log(same ? 'up to date' : 'OUT OF DATE — run: node scripts/import-content.mjs')
  process.exitCode = same ? 0 : 1
} else {
  mkdirSync(dirname(OUT), { recursive: true })
  writeFileSync(OUT, body)
}

/* ── Report ─────────────────────────────────────────────────────── */

const teamTally = {}
for (const p of people) teamTally[p.team ?? '(no team)'] = (teamTally[p.team ?? '(no team)'] ?? 0) + 1

const dropped = []
const noteDropped = (sheet, records, fields) => {
  for (const r of records) {
    for (const f of fields) if (!r[f]) dropped.push(`${sheet} ${r.id}: ${f}`)
  }
}
noteDropped('projects', projects, ['description', 'impact'])
noteDropped('people', people, ['shortBio', 'keyContribution', 'personalFact', 'role'])
noteDropped('timeline', timeline, ['detailedDescription'])
noteDropped('focus', focus, ['detailedDescription'])

const duplicates = (list) => {
  const seen = new Set()
  const dupes = []
  for (const r of list) {
    const key = r.id ?? r.key
    if (seen.has(key)) dupes.push(key)
    seen.add(key)
  }
  return dupes
}

console.log(`${check ? 'checked' : 'wrote'} ${OUT.replace(ROOT, '.')}`)
console.log('  hero          ', hero.length)
console.log('  capabilities  ', capabilities.length)
console.log('  leadership    ', leadership.length, leadership.map((l) => l.name).join(', '))
console.log('  teams         ', teams.length, teams.map((t) => `${t.name}=${t.professionalsCount}`).join(' | '))
console.log('  people        ', people.length, JSON.stringify(teamTally))
console.log('  timeline      ', timeline.length, timeline.map((m) => m.year).join(','))
console.log('  projects      ', projects.length, '(include_in_site = Yes)')
console.log('  focus         ', focus.length)
console.log('  voices        ', voices.length, '(consent_confirmed = Yes)')
console.log('  closing       ', closing.length)
console.log('  navigation    ', navigation.length)
console.log('  site config   ', Object.keys(siteConfig).length)
console.log('  corrections   ', corrections.length ? [...new Set(corrections)].join(' | ') : 'none')
const allDupes = [
  ...duplicates(capabilities),
  ...duplicates(people),
  ...duplicates(projects),
  ...duplicates(voices),
  ...duplicates(timeline),
  ...duplicates(focus),
  ...duplicates(leadership),
  ...duplicates(teams),
]
console.log('  duplicate ids ', allDupes.length ? allDupes.join(', ') : 'none')
console.log(`  fields withheld as placeholder/empty: ${dropped.length}`)
for (const d of dropped.slice(0, 8)) console.log(`    · ${d}`)
if (dropped.length > 8) console.log(`    · … and ${dropped.length - 8} more`)
