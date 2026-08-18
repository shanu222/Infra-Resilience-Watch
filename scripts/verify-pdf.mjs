// Verification harness: builds the advisory PDF outside the browser to prove the
// generated file is a valid, non-empty, multi-page PDF. Run: node scripts/verify-pdf.mjs
import { rmSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import * as zlibSync from 'node:zlib'
import { build } from 'vite'

const LONG = Array.from({ length: 14 }, (_, i) =>
  `Paragraph ${i + 1}: Sustained monsoon rainfall has saturated embankment fill material along the left bank, `
  + 'reducing shear strength and increasing the likelihood of progressive slope failure during the next flood peak. '
  + 'Field teams recorded seepage at multiple chainages and observed hairline cracking in the crest.',
).join('\n\n')

const advisory = {
  id: 'adv_verify_0001',
  kind: 'advisory',
  issueType: 'Infrastructure Risk',
  shortSummary: 'Embankment seepage and crest cracking observed along the left bank flood protection bund.',
  videoUrl: 'https://www.youtube.com/watch?v=abcdef12345',
  videoTitle: 'Field walkthrough of affected embankment',
  videoDescription: 'Site briefing recorded during the joint inspection.',
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
  currentSituation: LONG,
  identifiedProblem: 'Seepage at RD 121 with localized boiling on the country side toe.',
  observedConditions: 'Crest cracking of 8-14 mm width observed over a 60 m stretch.',
  affectedInfrastructure: ['Flood bund', 'Access road', 'Regulator structure'],
  weatherCondition: 'Overcast with intermittent heavy showers',
  rainfallCondition: '96 mm in the preceding 24 hours',
  riverCondition: 'High flood, rising trend',
  groundCondition: 'Saturated, low bearing capacity',
  visibility: 'Moderate',
  otherCondition: 'Night operations constrained by lighting',
  risks: 'Breach of the bund would inundate approximately 40 settlements and sever the district access road.',
  immediateActions: [
    'Deploy sandbag ring bund around the seepage exit point.',
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
  contactInfo: 'District Emergency Operations Centre, Rajanpur',
  images: [],
  references: 'Provincial Irrigation Department field inspection notes.',
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
  orgLogo: '',
  wingLogo: '',
  advisoryLogo: '',
  defaultBackgroundTemplate: 'ndma-blue',
  defaultCustomBackground: '',
  defaultTheme: 'blue-engineering',
}

// Bundle the PDF modules (TypeScript + path aliases) into plain JS for Node.
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
const code = output.find(chunk => chunk.type === 'chunk').code
// Bare "jspdf" cannot resolve from a data: URL, so load from a temp file in the project.
const tempModule = 'scripts/.advisory-pdf.bundle.mjs'
writeFileSync(tempModule, code)
const { buildAdvisoryPdfBlob, advisoryPdfFilename } = await import(pathToFileURL(tempModule).href)

// Minimal browser shims so the image pipeline (loader -> canvas -> addImage) is exercised.
// A real PNG is encoded here so jsPDF parses genuine image data.
function encodePng(width, height, rgb) {
  const crcTable = Array.from({ length: 256 }, (_, n) => {
    let c = n
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    return c >>> 0
  })
  const crc32 = buf => {
    let c = 0xffffffff
    for (const byte of buf) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8)
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
  ihdr[8] = 8 // bit depth
  ihdr[9] = 2 // truecolor RGB
  const raw = Buffer.concat(
    Array.from({ length: height }, () =>
      Buffer.concat([Buffer.from([0]), Buffer.concat(Array.from({ length: width }, () => Buffer.from(rgb)))])),
  )
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlibSync.deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ])
  return `data:image/png;base64,${png.toString('base64')}`
}

const PNG_8x6 = encodePng(80, 60, [214, 64, 64])

globalThis.Image = class {
  constructor() {
    this.naturalWidth = 80
    this.naturalHeight = 60
    this.onload = null
    this.onerror = null
  }
  set src(value) {
    this._src = value
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
    toDataURL: () => PNG_8x6,
  }),
}

globalThis.window = { setTimeout, clearTimeout }

const imageAdvisory = {
  ...advisory,
  images: [
    { id: 'img1', dataUrl: PNG_8x6, caption: 'Seepage exit point at RD 121 observed during inspection', isCover: true, order: 0 },
    { id: 'img2', dataUrl: PNG_8x6, caption: 'Crest cracking along the 60 m stretch', isCover: false, order: 1 },
    { id: 'img3', dataUrl: PNG_8x6, caption: '', isCover: false, order: 2 },
  ],
  orgLogo: PNG_8x6,
  wingLogo: PNG_8x6,
}

const cases = [
  { name: 'full advisory', data: advisory },
  { name: 'advisory with images + logos', data: imageAdvisory },
  { name: 'advisory with one image only', data: { ...advisory, images: [imageAdvisory.images[0]] } },
  { name: 'minimal advisory', data: { ...advisory, currentSituation: 'Short note.', immediateActions: [], shortTermMeasures: [], mediumTermMeasures: [], longTermMeasures: [], dos: [], donts: [], engineeringRecommendations: [], keyTakeaway: '', references: '', publicGuidance: '', identifiedProblem: '', risks: '', observedConditions: '', infrastructureTypes: [], affectedInfrastructure: [] } },
  { name: 'very long advisory', data: { ...advisory, currentSituation: LONG + '\n\n' + LONG, risks: LONG, publicGuidance: LONG } },
]

let failed = false

for (const testCase of cases) {
  try {
    const blob = await buildAdvisoryPdfBlob(testCase.data, settings)
    const buffer = Buffer.from(await blob.arrayBuffer())
    const header = buffer.subarray(0, 5).toString('latin1')
    const trailer = buffer.subarray(-1400).toString('latin1')
    const pageCount = (buffer.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length

    const checks = {
      'PDF header': header === '%PDF-',
      'EOF marker': trailer.includes('%%EOF'),
      'MIME type': blob.type === 'application/pdf',
      'non-trivial size': buffer.length > 5000,
      'has pages': pageCount >= 1,
    }

    const ok = Object.values(checks).every(Boolean)
    if (!ok) failed = true

    console.log(`\n${ok ? 'PASS' : 'FAIL'} — ${testCase.name}`)
    console.log(`  size: ${(buffer.length / 1024).toFixed(1)} KB, pages: ${pageCount}`)
    for (const [label, value] of Object.entries(checks)) {
      console.log(`  ${value ? 'ok  ' : 'BAD '} ${label}`)
    }

    if (testCase.name === 'full advisory') {
      writeFileSync('verify-output.pdf', buffer)
      console.log(`  filename: ${advisoryPdfFilename(testCase.data)}`)
      console.log('  wrote verify-output.pdf')
    }
  } catch (err) {
    failed = true
    console.log(`\nFAIL — ${testCase.name}: ${err?.message || err}`)
  }
}

rmSync(tempModule, { force: true })
process.exit(failed ? 1 : 0)
