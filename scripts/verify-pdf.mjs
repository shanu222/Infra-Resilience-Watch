// PDF verification + layout audit. Builds the advisory PDF outside the browser and
// checks file integrity plus page geometry (overlaps, margin escapes, wasted space).
// Run: node scripts/verify-pdf.mjs
import { rmSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import * as zlib from 'node:zlib'
import { build } from 'vite'

/* ---------------------------------------------------------------- *
 * Browser shims so the image pipeline runs under Node
 * ---------------------------------------------------------------- */

function encodePng(width, height, rgb) {
  const table = Array.from({ length: 256 }, (_, n) => {
    let c = n
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    return c >>> 0
  })
  const crc32 = buf => {
    let c = 0xffffffff
    for (const byte of buf) c = table[(c ^ byte) & 0xff] ^ (c >>> 8)
    return (c ^ 0xffffffff) >>> 0
  }
  const chunk = (type, data) => {
    const len = Buffer.alloc(4)
    len.writeUInt32BE(data.length)
    const body = Buffer.concat([Buffer.from(type, 'latin1'), data])
    const crc = Buffer.alloc(4)
    crc.writeUInt32BE(crc32(body))
    return Buffer.concat([len, body, crc])
  }

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8
  ihdr[9] = 2
  const raw = Buffer.concat(
    Array.from({ length: height }, () =>
      Buffer.concat([Buffer.from([0]), Buffer.concat(Array.from({ length: width }, () => Buffer.from(rgb)))])),
  )
  return `data:image/png;base64,${
    Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      chunk('IHDR', ihdr),
      chunk('IDAT', zlib.deflateSync(raw)),
      chunk('IEND', Buffer.alloc(0)),
    ]).toString('base64')
  }`
}

const PHOTO = encodePng(160, 100, [70, 110, 150])
const LOGO = encodePng(90, 90, [22, 141, 219])

// jsPDF captures browser globals when it is imported, so shims are installed afterwards.
function installBrowserShims() {
  globalThis.Image = class {
    constructor() {
      this.naturalWidth = 160
      this.naturalHeight = 100
      this.onload = null
      this.onerror = null
    }
    set src(value) {
      this._src = value
      if (value === LOGO) {
        this.naturalWidth = 90
        this.naturalHeight = 90
      }
      setTimeout(() => this.onload?.(), 0)
    }
    get src() {
      return this._src
    }
  }

  globalThis.document = {
    createElement: () => ({
      width: 0,
      height: 0,
      getContext: () => ({ fillRect() {}, drawImage() {}, set fillStyle(_v) {} }),
      toDataURL: type => (type === 'image/png' ? LOGO : PHOTO),
    }),
  }
  globalThis.window = { setTimeout, clearTimeout }
}

/* ---------------------------------------------------------------- *
 * Fixtures
 * ---------------------------------------------------------------- */

const PARA =
  'Sustained monsoon rainfall has saturated embankment fill material along the left bank, reducing shear strength '
  + 'and increasing the likelihood of progressive slope failure during the next flood peak. Field teams recorded '
  + 'seepage at multiple chainages and observed hairline cracking along the crest.'
const LONG = Array.from({ length: 14 }, (_, i) => `Paragraph ${i + 1}: ${PARA}`).join('\n\n')

const base = {
  id: 'adv_verify_0001',
  kind: 'advisory',
  issueType: 'Infrastructure Risk',
  shortSummary: 'Embankment seepage and crest cracking observed along the left bank flood protection bund.',
  videoUrl: 'https://www.youtube.com/watch?v=abcdef12345',
  videoTitle: 'Field walkthrough of the affected embankment',
  videoDescription: 'Site briefing recorded during the joint inspection with the provincial irrigation team.',
  videoThumbnail: '',
  videoDuration: '',
  featured: true,
  title: 'Flood Protection Embankment Seepage and Crest Cracking - Immediate Engineering Advisory',
  advisoryNumber: 'IRW-2026-0142',
  type: 'Emergency Advisory',
  hazard: 'Flood',
  severity: 'Critical',
  province: 'Punjab',
  district: 'Rajanpur',
  specificLocation: 'Left bank bund, RD 118-124',
  infrastructureTypes: ['Bridges', 'Roads', 'Drainage', 'Water Supply', 'Power', 'Hospitals'],
  currentSituation: `${PARA}\n\n${PARA}`,
  identifiedProblem: 'Seepage at RD 121 with localized boiling on the country side toe.',
  observedConditions: 'Crest cracking of 8-14 mm width observed over a 60 m stretch.',
  affectedInfrastructure: ['Flood bund', 'Access road', 'Regulator structure', 'Distributary head'],
  weatherCondition: 'Overcast with intermittent heavy showers',
  rainfallCondition: '96 mm in the preceding 24 hours',
  riverCondition: 'High flood, rising trend',
  groundCondition: 'Saturated, low bearing capacity',
  visibility: 'Moderate',
  otherCondition: 'Night operations constrained by lighting',
  risks: 'Breach of the bund would inundate approximately 40 settlements and sever the district access road.',
  immediateActions: [
    'Deploy a sandbag ring bund around the seepage exit point.',
    'Establish 24-hour patrolling at RD 118-124.',
    'Pre-position stone pitching and geotextile at the site.',
  ],
  shortTermMeasures: ['Construct a filter berm on the country side toe.', 'Restore crest level and compact in layers.'],
  mediumTermMeasures: ['Undertake geotechnical investigation of the fill material.'],
  longTermMeasures: ['Redesign the section with an impervious core and toe drain.'],
  dos: ['Follow evacuation instructions issued by the district administration.', 'Keep emergency documents ready.'],
  donts: ['Do not use the embankment crest as a road.', 'Do not remove protective stone pitching.'],
  engineeringRecommendations: [
    'Provide an inverted filter at the seepage exit to prevent piping.',
    'Monitor pore pressure using standpipe piezometers at 50 m spacing.',
    'Avoid placing surcharge loads on the crest during high flood.',
  ],
  publicGuidance: 'Residents within 2 km of the left bank should prepare for possible relocation.',
  contactInfo: 'Agency: District Emergency Operations Centre\nPhone: 1122\nEscalation: Provincial Irrigation Department',
  images: [],
  references: 'Provincial Irrigation Department field inspection notes.\nNDMA monsoon contingency plan 2026.',
  keyTakeaway: 'Immediate toe protection and continuous patrolling are essential to prevent a breach.',
  documentTheme: 'blue-engineering',
  backgroundTemplate: 'ndma-blue',
  customBackground: '',
  orgLogo: '',
  wingLogo: '',
  status: 'Published',
  version: 2,
  createdAt: '2026-08-10T06:00:00.000Z',
  updatedAt: '2026-08-18T06:00:00.000Z',
  publishedAt: '2026-08-18T06:00:00.000Z',
  expiryDate: null,
  publishDate: null,
  viewCount: 42,
}

const settings = {
  orgLogo: LOGO,
  wingLogo: LOGO,
  advisoryLogo: '',
  defaultBackgroundTemplate: 'ndma-blue',
  defaultCustomBackground: '',
  defaultTheme: 'blue-engineering',
}

const photo = (caption, isCover, order) => ({ id: `img${order}`, dataUrl: PHOTO, caption, isCover, order })

// Mirrors the real advisory the user downloaded: every field filled with a few characters.
const terse = {
  ...base,
  title: ',mklklmkl',
  advisoryNumber: 'klmklm klmj',
  severity: 'Moderate',
  province: 'Islamabad Capital Territory',
  district: 'Islamabad',
  specificLocation: 'mlklml;',
  infrastructureTypes: ['Bridges', 'Hospitals', 'Drainage'],
  affectedInfrastructure: ['Buildings', 'Schools', 'Water Supply'],
  shortSummary: 'kmklmk;p/l',
  currentSituation: 'km,l;,juoi;j',
  identifiedProblem: ';io,jk;iojk',
  risks: 'jlk,.j;pojoilk.',
  observedConditions: ';jk,;opi.k/pl',
  weatherCondition: "pok'p.okop",
  rainfallCondition: ".'pl';pk;o",
  riverCondition: ';klmp;',
  groundCondition: 'klml',
  visibility: 'klmkl;',
  otherCondition: 'klmml/',
  engineeringRecommendations: ['mk,kl'],
  immediateActions: ['k;lk,l'],
  shortTermMeasures: ['mklmi;o'],
  mediumTermMeasures: ['jmkop'],
  longTermMeasures: ['klm/'],
  dos: ['/lmkl,'],
  donts: ['mkmkl'],
  videoTitle: 'klmklmj',
  videoDescription: "klm/lk'",
  publicGuidance: 'm.klml',
  keyTakeaway: 'kl,joi',
  contactInfo: ';jjkjjj',
  references: 'jjjjjjjjjjjil.',
  version: 1,
  images: [photo('', true, 0)],
}

const cases = [
  { name: 'terse advisory (matches reported PDF)', data: terse },
  { name: 'full advisory, no images', data: base },
  { name: 'full advisory, 4 images + logos', data: { ...base, images: [photo('Seepage exit point at RD 121', true, 0), photo('Crest cracking over the 60 m stretch', false, 1), photo('Country side toe boiling', false, 2), photo('', false, 3)] } },
  { name: 'single image only', data: { ...base, images: [photo('Cover photograph of the affected reach', true, 0)] } },
  { name: 'minimal advisory (optional fields empty)', data: { ...base, images: [], currentSituation: 'Short note.', identifiedProblem: '', risks: '', observedConditions: '', weatherCondition: '', rainfallCondition: '', riverCondition: '', groundCondition: '', visibility: '', otherCondition: '', immediateActions: [], shortTermMeasures: [], mediumTermMeasures: [], longTermMeasures: [], dos: [], donts: [], engineeringRecommendations: [], keyTakeaway: '', references: '', publicGuidance: '', contactInfo: '', videoUrl: '', videoTitle: '', videoDescription: '', infrastructureTypes: [], affectedInfrastructure: [] } },
  { name: 'very long advisory (multi-page flow)', data: { ...base, currentSituation: `${LONG}\n\n${LONG}`, risks: LONG, publicGuidance: LONG, engineeringRecommendations: Array.from({ length: 12 }, (_, i) => `Recommendation ${i + 1}: ${PARA}`) } },
  { name: 'long single-field stress (URLs + unbroken tokens)', data: { ...base, references: `${'https://example.gov.pk/very/long/path/that/never/breaks/anywhere-'.repeat(3)}\nSecond reference`, publicGuidance: 'A'.repeat(400) } },
  { name: 'long do / do-not lists', data: { ...base, dos: Array.from({ length: 16 }, (_, i) => `Do item ${i + 1}: ${PARA}`), donts: Array.from({ length: 9 }, (_, i) => `Avoid item ${i + 1}: ${PARA}`), identifiedProblem: LONG } },
  { name: 'many infrastructure types + observations', data: { ...base, infrastructureTypes: ['Bridges', 'Hospitals', 'Drainage', 'Buildings', 'Schools', 'Water Supply', 'Roads', 'Power', 'Telecom', 'Railways'], affectedInfrastructure: Array.from({ length: 11 }, (_, i) => `Asset class ${i + 1} requiring inspection`) } },
]

/* ---------------------------------------------------------------- *
 * Bundle the PDF module for Node
 * ---------------------------------------------------------------- */

const result = await build({
  logLevel: 'error',
  configFile: false,
  build: {
    write: false,
    ssr: true,
    lib: { entry: 'src/pdf/advisoryPdf.ts', formats: ['es'], fileName: 'advisory-pdf' },
    rollupOptions: { external: ['jspdf'] },
  },
})

const output = Array.isArray(result) ? result[0].output : result.output
const tempModule = 'scripts/.advisory-pdf.bundle.mjs'
writeFileSync(tempModule, output.find(chunk => chunk.type === 'chunk').code)
const { buildAdvisoryPdfBlob, advisoryPdfFilename, traceAdvisoryPdf } = await import(pathToFileURL(tempModule).href)

installBrowserShims()

/* ---------------------------------------------------------------- *
 * Audit
 * ---------------------------------------------------------------- */

const EPS = 0.35

function auditLayout(trace) {
  const problems = []
  const byPage = new Map()
  for (const p of trace.placements) {
    if (!byPage.has(p.page)) byPage.set(p.page, [])
    byPage.get(p.page).push(p)
  }

  const fill = []

  for (let page = 1; page <= trace.pages; page += 1) {
    if (!byPage.has(page)) problems.push(`p${page}: page has no content (blank page)`)
  }

  for (const [page, items] of [...byPage.entries()].sort((a, b) => a[0] - b[0])) {
    for (const item of items) {
      if (item.x < trace.frame.left - EPS) {
        problems.push(`p${page}: "${item.label}" starts left of the margin (x=${item.x.toFixed(1)})`)
      }
      if (item.x + item.width > trace.frame.right + EPS) {
        problems.push(`p${page}: "${item.label}" exceeds the right margin`)
      }
      if (item.y < trace.frame.top - EPS) {
        problems.push(`p${page}: "${item.label}" collides with the header zone`)
      }
      // The compact disclaimer sits in the reserved 9mm band above the footer rule.
      const floor = item.label.includes('compact') ? trace.frame.bottom + 9 : trace.frame.bottom
      if (item.y + item.height > floor + EPS) {
        problems.push(
          `p${page}: "${item.label}" runs into the footer zone `
          + `(ends ${(item.y + item.height).toFixed(1)} > ${floor.toFixed(1)})`,
        )
      }
    }

    // Overlap detection: two placements sharing both an x-range and a y-range.
    for (let i = 0; i < items.length; i += 1) {
      for (let j = i + 1; j < items.length; j += 1) {
        const a = items[i]
        const b = items[j]
        const xOverlap = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x)
        const yOverlap = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y)
        if (xOverlap > EPS && yOverlap > EPS) {
          problems.push(
            `p${page}: "${a.label}" overlaps "${b.label}" by ${yOverlap.toFixed(2)}mm vertically`,
          )
        }
      }
    }

    const lowest = Math.max(...items.map(item => item.y + item.height))
    const usable = trace.frame.bottom - (page === 1 ? trace.frame.top : trace.frame.contentTop)
    const used = lowest - (page === 1 ? trace.frame.top : trace.frame.contentTop)
    fill.push({ page, ratio: used / usable })
  }

  // Only the final page may legitimately end early.
  for (const entry of fill) {
    if (entry.page < fill.length && entry.ratio < 0.8) {
      problems.push(`p${entry.page}: only ${(entry.ratio * 100).toFixed(0)}% of the page is used`)
    }
  }

  return { problems, fill }
}

let failed = false

for (const testCase of cases) {
  try {
    const blob = await buildAdvisoryPdfBlob(testCase.data, settings)
    const buffer = Buffer.from(await blob.arrayBuffer())
    const latin = buffer.toString('latin1')
    const pageCount = (latin.match(/\/Type\s*\/Page[^s]/g) || []).length
    const trace = await traceAdvisoryPdf(testCase.data, settings)
    const { problems, fill } = auditLayout(trace)

    const checks = {
      'valid PDF header': latin.startsWith('%PDF-'),
      'EOF marker present': buffer.subarray(-1400).toString('latin1').includes('%%EOF'),
      'application/pdf type': blob.type === 'application/pdf',
      'reasonable size': buffer.length > 5000,
      'pages present': pageCount >= 1,
      'trace matches pages': trace.pages === pageCount,
      'no layout problems': problems.length === 0,
    }

    const ok = Object.values(checks).every(Boolean)
    if (!ok) failed = true

    console.log(`\n${ok ? 'PASS' : 'FAIL'} — ${testCase.name}`)
    console.log(`  ${(buffer.length / 1024).toFixed(1)} KB · ${pageCount} page(s) · fill ${
      fill.map(f => `p${f.page} ${(f.ratio * 100).toFixed(0)}%`).join(', ')
    }`)
    for (const [label, value] of Object.entries(checks)) {
      if (!value) console.log(`  BAD  ${label}`)
    }
    for (const problem of problems.slice(0, 12)) console.log(`       - ${problem}`)
    if (problems.length > 12) console.log(`       - ...and ${problems.length - 12} more`)

    if (testCase.name.startsWith('full advisory, 4')) {
      writeFileSync('verify-output.pdf', buffer)
      console.log(`  filename: ${advisoryPdfFilename(testCase.data)}`)
    }
    if (testCase.name.startsWith('terse')) writeFileSync('verify-terse.pdf', buffer)
  } catch (err) {
    failed = true
    console.log(`\nFAIL — ${testCase.name}: ${err?.stack || err}`)
  }
}

rmSync(tempModule, { force: true })
console.log(failed ? '\nAudit failed.' : '\nAll PDF checks and layout audits passed.')
process.exit(failed ? 1 : 0)
