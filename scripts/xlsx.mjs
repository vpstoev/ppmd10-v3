/**
 * A read-only .xlsx / .xlsm reader built on Node's own zlib.
 *
 * There is no spreadsheet library in this project and no Python on the
 * machine that builds it, and adding a dependency to read one file once a
 * quarter is a poor trade. An Office file is a ZIP of XML, both of which
 * Node can already open, so this reads the container directly.
 *
 * READ-ONLY, and that is a requirement rather than a convenience: the
 * workbook carries VBA (`.xlsm`), and anything that rewrites it would
 * either drop the macros or silently re-save parts of a file somebody
 * else owns. Nothing here opens the file for writing.
 */
import { readFileSync } from 'node:fs'
import { inflateRawSync } from 'node:zlib'

/* ── The ZIP container ──────────────────────────────────────────── */

const SIG_EOCD = 0x06054b50
const SIG_CEN = 0x02014b50

/**
 * Every file in the archive, by name.
 *
 * Read through the central directory rather than by scanning for local
 * headers: the central directory is the authoritative index, and a local
 * header may declare its sizes in a trailing descriptor it does not carry
 * itself.
 */
function readZip(path) {
  const buf = readFileSync(path)
  /* The end record is last, but a trailing comment can push it back by up
     to 64 kB, so it is found by scanning rather than by arithmetic. */
  let eocd = -1
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 66000); i--) {
    if (buf.readUInt32LE(i) === SIG_EOCD) {
      eocd = i
      break
    }
  }
  if (eocd < 0) throw new Error(`not a zip container: ${path}`)

  const count = buf.readUInt16LE(eocd + 10)
  let at = buf.readUInt32LE(eocd + 16)
  const files = new Map()
  for (let i = 0; i < count; i++) {
    if (buf.readUInt32LE(at) !== SIG_CEN) break
    const method = buf.readUInt16LE(at + 10)
    const compressed = buf.readUInt32LE(at + 20)
    const nameLen = buf.readUInt16LE(at + 28)
    const extraLen = buf.readUInt16LE(at + 30)
    const commentLen = buf.readUInt16LE(at + 32)
    const localAt = buf.readUInt32LE(at + 42)
    const name = buf.toString('utf8', at + 46, at + 46 + nameLen)
    files.set(name, { method, compressed, localAt })
    at += 46 + nameLen + extraLen + commentLen
  }

  return (name) => {
    const f = files.get(name)
    if (!f) return null
    /* The local header's own name/extra lengths are the ones that decide
       where the data starts; the central copy can differ in the extra
       field. */
    const nameLen = buf.readUInt16LE(f.localAt + 26)
    const extraLen = buf.readUInt16LE(f.localAt + 28)
    const start = f.localAt + 30 + nameLen + extraLen
    const raw = buf.subarray(start, start + f.compressed)
    return f.method === 0 ? raw : inflateRawSync(raw)
  }
}

/* ── Just enough XML ────────────────────────────────────────────── */

const ENTITIES = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
}

function decode(s) {
  return s.replace(/&(#x?[0-9a-fA-F]+|[a-z]+);/g, (m, ent) => {
    if (ent[0] === '#') {
      const code = ent[1] === 'x' ? parseInt(ent.slice(2), 16) : parseInt(ent.slice(1), 10)
      return Number.isFinite(code) ? String.fromCodePoint(code) : m
    }
    return ENTITIES[ent] ?? m
  })
}

/**
 * An element's own text, for elements that never nest inside themselves.
 *
 * The lazy attribute match before the `/>` alternative is not a style
 * choice. A greedy one consumes the closing slash of an EMPTY element,
 * fails that branch, and falls through to the "open tag, body, close tag"
 * branch — which then runs on to the next element's closing tag and
 * silently merges the two. In a spreadsheet that reads as one cell
 * swallowing its neighbours and every column after it shifting left,
 * which is wrong in a way that still looks like plausible data.
 */
function elements(xml, tag) {
  return xml.matchAll(new RegExp(`<${tag}\\b([^>]*?)(?:\\/>|>([\\s\\S]*?)<\\/${tag}>)`, 'g'))
}

/** Text content of every `<t>` in a fragment, concatenated. */
function textRuns(xml) {
  let out = ''
  for (const m of elements(xml, 't')) out += decode(m[2] ?? '')
  return out
}

/** Text plus the exact runs Excel marks bold inside a rich-text cell. */
function richText(xml) {
  const runs = []
  let foundRun = false
  for (const m of elements(xml, 'r')) {
    foundRun = true
    const body = m[2] ?? ''
    runs.push({ text: textRuns(body), bold: /<b(?:\s[^>]*)?\/>|<b(?:\s[^>]*)?>[\s\S]*?<\/b>/.test(body) })
  }
  if (!foundRun) runs.push({ text: textRuns(xml), bold: false })
  return { text: runs.map((run) => run.text).join(''), runs }
}

/* ── The workbook ───────────────────────────────────────────────── */

/** Column letters to a zero-based index: A→0, AA→26. */
function colIndex(ref) {
  let n = 0
  for (const ch of ref) {
    const c = ch.charCodeAt(0)
    if (c < 65 || c > 90) break
    n = n * 26 + (c - 64)
  }
  return n - 1
}

/**
 * Open a workbook and return `{ sheetNames, rows(name) }`.
 *
 * `rows` gives a sheet as an array of arrays of strings, in worksheet
 * order, with blanks as empty strings. Every value comes back as text on
 * purpose: the content this reads is editorial, and a year that arrives
 * as `2017` in one row and `2017.0` in the next is a bug waiting to be
 * written. Callers convert what they actually need as numbers.
 *
 * A cell holding a formula that Excel has never evaluated has no cached
 * value, and it reads as empty rather than as the formula's text — which
 * is what lets the importer fall back to worksheet order.
 */
export function openWorkbook(path) {
  const read = readZip(path)
  const utf8 = (name) => {
    const b = read(name)
    return b ? b.toString('utf8') : null
  }

  /* Shared strings: the table every text cell points into. */
  const shared = []
  const sst = utf8('xl/sharedStrings.xml')
  if (sst) {
    const re = /<si>([\s\S]*?)<\/si>/g
    let m
    while ((m = re.exec(sst))) shared.push(richText(m[1]))
  }

  /* Sheet name → part path, resolved through the relationship id so the
     order of the files in the container never matters. */
  const rels = utf8('xl/_rels/workbook.xml.rels') ?? ''
  const target = new Map()
  for (const m of rels.matchAll(/<Relationship\b[^>]*\/>/g)) {
    const id = /Id="([^"]+)"/.exec(m[0])?.[1]
    let t = /Target="([^"]+)"/.exec(m[0])?.[1]
    if (!id || !t) continue
    t = t.replace(/^\/?(xl\/)?/, '')
    target.set(id, `xl/${t}`)
  }

  const wb = utf8('xl/workbook.xml') ?? ''
  const sheets = []
  for (const m of wb.matchAll(/<sheet\b[^>]*\/>/g)) {
    const name = /name="([^"]*)"/.exec(m[0])?.[1]
    const rid = /r:id="([^"]+)"/.exec(m[0])?.[1]
    if (name && rid && target.has(rid)) sheets.push({ name: decode(name), part: target.get(rid) })
  }

  const richRows = (sheetName) => {
    const sheet = sheets.find((s) => s.name === sheetName)
    if (!sheet) throw new Error(`no such sheet: ${sheetName}`)
    const xml = utf8(sheet.part)
    if (!xml) throw new Error(`missing part: ${sheet.part}`)
    const out = []
    for (const rm of elements(xml, 'row')) {
      const rowNum = Number(/\br="(\d+)"/.exec(rm[1])?.[1] ?? out.length + 1)
      const cells = []
      let col = 0
      for (const cm of elements(rm[2] ?? '', 'c')) {
        const attrs = cm[1]
        const body = cm[2] ?? ''
        const ref = /\br="([A-Z]+)\d+"/.exec(attrs)?.[1]
        const at = ref ? colIndex(ref) : col
        const type = /\bt="([^"]+)"/.exec(attrs)?.[1] ?? 'n'
        let value = { text: '', runs: [] }
        if (type === 'inlineStr') {
          value = richText(body)
        } else {
          /* `<v>` is the cached result. A formula cell that Excel never
             calculated has `<f>` and no `<v>`, and that is exactly the
             case the importer needs to see as empty. */
          const v = /<v>([\s\S]*?)<\/v>/.exec(body)?.[1]
          if (v !== undefined) {
            value = type === 's'
              ? (shared[Number(decode(v))] ?? { text: '', runs: [] })
              : { text: decode(v), runs: [] }
          }
        }
        while (cells.length < at) cells.push({ text: '', runs: [] })
        cells[at] = value
        col = at + 1
      }
      while (out.length < rowNum - 1) out.push([])
      out[rowNum - 1] = cells
    }
    return out
  }

  const rows = (sheetName) => richRows(sheetName).map((row) => row.map((cell) => cell.text))

  return { sheetNames: sheets.map((s) => s.name), rows, richRows }
}
