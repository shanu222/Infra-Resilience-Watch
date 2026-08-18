import { jsPDF } from 'jspdf'
import type { Advisory, AppSettings } from '../types'
import { BRAND, normalizeSeverity } from '../data/constants'
import {
  ACTION_PHASE_COLOR,
  DOC_ACCENT as ACCENT,
  SECTION_COLOR,
  SEVERITY_COLOR,
  hazardColor,
  themeOf,
} from '../data/documentDesign'
import { formatDateLong, locationLabel, sanitizeDocText } from '../utils'
import { fitContain, loadImageForPdf, type LoadedImage } from './pdfImages'
import {
  CONTENT_WIDTH,
  MARGIN,
  PAGE,
  cleanText,
  drawTrackedText,
  gradientRect,
  hexToRgb,
  lineHeight,
  sanitizeFilename,
  setFill,
  setStroke,
  setText,
  tintRgb,
  trackedTextWidth,
  type RGB,
} from './pdfPrimitives'
import {
  HAIRLINE,
  INK,
  MUTED,
  TYPE,
  assetCardBlocks,
  bannerBlocks,
  briefBlocks,
  calloutBlocks,
  contactBlocks,
  dualListBlocks,
  imageBlocks,
  imageGridBlocks,
  numberedCardBlocks,
  observationBlocks,
  paragraphBlocks,
  referenceBlocks,
  tagBlocks,
  timelineBlocks,
  videoBlocks,
  wrapText,
  type Block,
} from './pdfBlocks'

const RUNNING_HEADER_HEIGHT = 12
const FOOTER_ZONE = 11
const SECTION_GAP = 4.6
const COLUMN_GAP = 6
/** A section pair is only worth forming when both columns stay this short. */
const PAIR_MAX_HEIGHT = 56

const WING_NAME = BRAND.wing

interface Palette {
  header: RGB
  accent: RGB
  band: RGB
  ink: RGB
  severity: RGB
}

interface SectionSpec {
  title: string
  color: string
  build: (width: number) => Block[]
  /** Wide content (images, timelines, two-column cards) never shares a row. */
  solo?: boolean
  /** Banners render without a numbered section header. */
  bare?: boolean
}

/* ------------------------------------------------------------------ *
 * Section header
 * ------------------------------------------------------------------ */

function wrapTracked(pdf: jsPDF, text: string, width: number, tracking: number): string[] {
  const words = text.split(' ').filter(Boolean)
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (current && trackedTextWidth(pdf, candidate, tracking) > width) {
      lines.push(current)
      current = word
    } else {
      current = candidate
    }
  }
  if (current) lines.push(current)
  return lines
}

function sectionHeaderBlock(
  pdf: jsPDF,
  number: number,
  title: string,
  colorHex: string,
  width: number,
): Block {
  const color = hexToRgb(colorHex)
  const compact = width < 120
  const size = compact ? TYPE.sectionTitle - 1.6 : TYPE.sectionTitle
  const chip = 6.6
  const textX = chip + 4

  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(size)
  const lines = wrapTracked(pdf, title.toUpperCase(), width - textX - 1, 0.55)
  const titleBlock = lines.length * lineHeight(size, 1.24)
  const height = Math.max(chip, titleBlock) + 4.4

  return {
    height,
    draw: (x, y) => {
      setFill(pdf, color)
      pdf.roundedRect(x, y, chip, chip, 1.3, 1.3, 'F')
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(TYPE.label)
      setText(pdf, [255, 255, 255])
      const label = String(number).padStart(2, '0')
      pdf.text(label, x + chip / 2 - pdf.getTextWidth(label) / 2, y + 4.5)

      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(size)
      setText(pdf, color)
      lines.forEach((line, i) => {
        drawTrackedText(pdf, line, x + textX, y + 4.4 + i * lineHeight(size, 1.24), 0.55)
      })

      const ruleY = y + height - 2.2
      setStroke(pdf, color)
      pdf.setLineWidth(0.5)
      pdf.line(x, ruleY, x + Math.min(width, 26), ruleY)
      setStroke(pdf, HAIRLINE)
      pdf.setLineWidth(0.3)
      pdf.line(x + Math.min(width, 26), ruleY, x + width, ruleY)
    },
  }
}

function continuationBlock(pdf: jsPDF, title: string, colorHex: string): Block {
  const color = hexToRgb(colorHex)
  return {
    height: 5.6,
    draw: (x, y) => {
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(TYPE.label)
      setText(pdf, tintRgb(color, 0.25))
      drawTrackedText(pdf, `${title.toUpperCase()} (CONTINUED)`, x, y + 3.2, 0.5)
    },
  }
}

/* ------------------------------------------------------------------ *
 * Cover
 * ------------------------------------------------------------------ */

interface CoverAssets {
  orgLogo: LoadedImage | null
  wingLogo: LoadedImage | null
  advisoryLogo: LoadedImage | null
}

function coverBlocks(
  pdf: jsPDF,
  advisory: Advisory,
  palette: Palette,
  advisoryNumber: string,
  assets: CoverAssets,
  width: number,
): Block[] {
  const severity = normalizeSeverity(advisory.severity)
  const logos = [assets.orgLogo, assets.wingLogo, assets.advisoryLogo].filter(Boolean) as LoadedImage[]
  const padX = 7

  pdf.setFont('times', 'bold')
  pdf.setFontSize(TYPE.title)
  const titleText = cleanText(advisory.title) || 'Untitled advisory'
  const titleLines = pdf.splitTextToSize(titleText, width - padX * 2 - 2) as string[]
  const titleLh = lineHeight(TYPE.title, 1.16)

  const logoPlates = logos.map(logo => ({ logo, size: fitContain(logo, 30, 13) }))
  const logoRow = logoPlates.length ? 17 : 0

  let cursor = 8
  const eyebrowY = cursor
  cursor += 5.4
  const typeY = cursor
  cursor += 6.2
  const logoY = cursor
  cursor += logoRow
  const ruleY = cursor
  cursor += 4.6
  const badgeY = cursor
  cursor += 10.6
  const titleY = cursor
  cursor += titleLines.length * titleLh
  const bandHeight = cursor + 7

  const band: Block = {
    height: bandHeight,
    draw: (x, y) => {
      gradientRect(pdf, x, y, width, bandHeight, palette.header, palette.accent)
      setFill(pdf, palette.band)
      pdf.rect(x, y, width, 1.7, 'F')

      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(TYPE.label + 0.4)
      setText(pdf, palette.band)
      drawTrackedText(pdf, BRAND.name, x + padX, y + eyebrowY, 0.9)

      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(11.5)
      setText(pdf, [255, 255, 255])
      pdf.text(cleanText(advisory.type) || 'Infrastructure Advisory', x + padX, y + typeY + 2.4)

      // Reference block, right aligned
      const refs = [
        { label: 'Advisory No', value: advisoryNumber },
        { label: 'Version', value: `${advisory.version}.0` },
      ]
      refs.forEach((ref, i) => {
        const ry = y + eyebrowY + i * 6.4
        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(TYPE.label - 0.4)
        setText(pdf, tintRgb(palette.band, 0.25))
        const labelText = ref.label.toUpperCase()
        const labelWidth = trackedTextWidth(pdf, labelText, 0.5)
        drawTrackedText(pdf, labelText, x + width - padX - labelWidth, ry, 0.5)

        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(TYPE.small)
        setText(pdf, [255, 255, 255])
        pdf.text(ref.value, x + width - padX - pdf.getTextWidth(ref.value), ry + 3.6)
      })

      logoPlates.forEach((plate, i) => {
        const px = x + padX + i * 34
        setFill(pdf, [255, 255, 255])
        pdf.roundedRect(px, y + logoY, plate.size.width + 3, plate.size.height + 3, 1.4, 1.4, 'F')
        pdf.addImage(
          plate.logo.dataUrl,
          plate.logo.format,
          px + 1.5,
          y + logoY + 1.5,
          plate.size.width,
          plate.size.height,
          undefined,
          'FAST',
        )
      })

      setFill(pdf, palette.band)
      pdf.rect(x + padX, y + ruleY, width - padX * 2, 0.8, 'F')

      // Hazard + severity badges
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(TYPE.label + 0.6)
      const hazardLabel = cleanText(advisory.hazard).toUpperCase()
      const hazardWidth = trackedTextWidth(pdf, hazardLabel, 0.8) + 9
      setFill(pdf, hexToRgb(hazardColor(advisory.hazard)))
      pdf.roundedRect(x + padX, y + badgeY, hazardWidth, 7, 1.6, 1.6, 'F')
      setText(pdf, [255, 255, 255])
      drawTrackedText(pdf, hazardLabel, x + padX + 4.5, y + badgeY + 4.7, 0.8)

      const sevLabel = `${severity.toUpperCase()} SEVERITY`
      const sevWidth = trackedTextWidth(pdf, sevLabel, 0.8) + 9
      const sevX = x + padX + hazardWidth + 3.4
      setFill(pdf, palette.severity)
      pdf.roundedRect(sevX, y + badgeY, sevWidth, 7, 1.6, 1.6, 'F')
      setText(pdf, [255, 255, 255])
      drawTrackedText(pdf, sevLabel, sevX + 4.5, y + badgeY + 4.7, 0.8)

      pdf.setFont('times', 'bold')
      pdf.setFontSize(TYPE.title)
      setText(pdf, [255, 255, 255])
      titleLines.forEach((line, i) => {
        pdf.text(line, x + padX, y + titleY + titleLh * (i + 0.8))
      })
    },
  }

  // Metadata strip on a light surface: readable and print-safe
  const meta = [
    { label: 'Date', value: formatDateLong(advisory.publishedAt || advisory.createdAt) },
    { label: 'Location', value: cleanText(advisory.specificLocation) || locationLabel(advisory) },
    { label: 'District', value: cleanText(advisory.district) },
    { label: 'Province', value: cleanText(advisory.province) },
  ].filter(item => item.value)

  const blocks: Block[] = [band]

  if (meta.length) {
    const cellWidth = (width - 8) / meta.length
    const valueLines = meta.map(item => wrapText(pdf, item.value, cellWidth - 4, TYPE.small, 'bold'))
    const rows = Math.max(...valueLines.map(l => Math.min(l.length, 2)))
    const height = 6.6 + rows * lineHeight(TYPE.small, 1.3) + 2.6

    blocks.push({
      height: height + 3,
      draw: (x, y) => {
        setFill(pdf, hexToRgb('#F1F6FB'))
        pdf.rect(x, y, width, height, 'F')
        setFill(pdf, palette.accent)
        pdf.rect(x, y, width, 0.7, 'F')

        meta.forEach((item, i) => {
          const mx = x + 4 + i * cellWidth
          pdf.setFont('helvetica', 'bold')
          pdf.setFontSize(TYPE.label - 0.4)
          setText(pdf, palette.accent)
          drawTrackedText(pdf, item.label.toUpperCase(), mx, y + 4.6, 0.55)

          pdf.setFont('helvetica', 'bold')
          pdf.setFontSize(TYPE.small)
          setText(pdf, INK)
          valueLines[i].slice(0, 2).forEach((line, li) => {
            pdf.text(line, mx, y + 6.2 + lineHeight(TYPE.small, 1.3) * (li + 0.74))
          })

          if (i > 0) {
            setStroke(pdf, HAIRLINE)
            pdf.setLineWidth(0.3)
            pdf.line(mx - 3, y + 2.4, mx - 3, y + height - 2.4)
          }
        })
      },
    })
  }

  if (advisory.infrastructureTypes.filter(Boolean).length) {
    blocks.push(...tagBlocks(pdf, advisory.infrastructureTypes, width, ACCENT.slate))
  }

  return blocks
}

/* ------------------------------------------------------------------ *
 * Flow engine
 * ------------------------------------------------------------------ */

/** Placement record used by the layout audit in scripts/verify-pdf.mjs. */
export interface Placement {
  page: number
  label: string
  x: number
  y: number
  width: number
  height: number
}

class DocumentFlow {
  private y = MARGIN.top
  private sectionNumber = 1
  private page = 1

  constructor(
    private pdf: jsPDF,
    private palette: Palette,
    private advisoryNumber: string,
    private trace?: Placement[],
  ) {}

  private get bottom(): number {
    return PAGE.height - MARGIN.bottom - FOOTER_ZONE
  }

  get contentTop(): number {
    return MARGIN.top + RUNNING_HEADER_HEIGHT
  }

  get contentBottom(): number {
    return this.bottom
  }

  /** Draws a block and records where it landed. */
  private paint(block: Block, x: number, y: number, width: number, label: string) {
    block.draw(x, y)
    this.trace?.push({ page: this.page, label, x, y, width, height: block.height })
  }

  newPage() {
    this.pdf.addPage('a4', 'portrait')
    this.page += 1
    this.drawRunningHeader()
    this.y = MARGIN.top + RUNNING_HEADER_HEIGHT
  }

  private drawRunningHeader() {
    const { pdf, palette } = this
    const y = MARGIN.top

    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(TYPE.label)
    setText(pdf, palette.header)
    drawTrackedText(pdf, BRAND.name, MARGIN.left, y, 0.6)

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(TYPE.label + 0.4)
    setText(pdf, MUTED)
    const ref = `Advisory No: ${this.advisoryNumber}`
    pdf.text(ref, PAGE.width - MARGIN.right - pdf.getTextWidth(ref), y)

    setFill(pdf, palette.accent)
    pdf.rect(MARGIN.left, y + 1.8, CONTENT_WIDTH, 0.6, 'F')
    setFill(pdf, palette.band)
    pdf.rect(MARGIN.left, y + 1.8, 24, 0.6, 'F')
  }

  /** Places blocks in a single column, breaking pages as needed. */
  private placeColumn(blocks: Block[], x: number, width: number, label: string, continuation?: Block) {
    for (const block of blocks) {
      if (this.y + block.height > this.bottom) {
        this.newPage()
        if (continuation) {
          this.paint(continuation, x, this.y, width, `${label} (cont.)`)
          this.y += continuation.height
        }
      }
      this.paint(block, x, this.y, width, label)
      this.y += block.height
    }
  }

  placeCover(blocks: Block[], label = 'cover') {
    this.placeColumn(blocks, MARGIN.left, CONTENT_WIDTH, label)
    this.y += SECTION_GAP - 1
  }

  private placeSection(spec: SectionSpec, blocks: Block[]) {
    const { pdf } = this
    const header = spec.bare
      ? null
      : sectionHeaderBlock(pdf, this.sectionNumber, spec.title, spec.color, CONTENT_WIDTH)

    // Keep the header with the opening content so no heading is left as a widow.
    const opening = blocks.slice(0, 2).reduce((total, block) => total + block.height, 0)
    const lead = (header?.height ?? 0) + Math.min(opening, 26)
    if (this.y + lead > this.bottom) this.newPage()

    if (header) {
      this.paint(header, MARGIN.left, this.y, CONTENT_WIDTH, `${spec.title} header`)
      this.y += header.height
      this.sectionNumber += 1
    }

    this.placeColumn(
      blocks,
      MARGIN.left,
      CONTENT_WIDTH,
      spec.title,
      spec.bare ? undefined : continuationBlock(pdf, spec.title, spec.color),
    )
    this.y += SECTION_GAP
  }

  private placePair(
    left: { spec: SectionSpec; blocks: Block[]; height: number },
    right: { spec: SectionSpec; blocks: Block[]; height: number },
    columnWidth: number,
  ) {
    const rowHeight = Math.max(left.height, right.height)
    if (this.y + rowHeight > this.bottom) this.newPage()

    const top = this.y
    const columns: [typeof left, number][] = [
      [left, MARGIN.left],
      [right, MARGIN.left + columnWidth + COLUMN_GAP],
    ]

    for (const [column, x] of columns) {
      const header = sectionHeaderBlock(
        this.pdf,
        this.sectionNumber,
        column.spec.title,
        column.spec.color,
        columnWidth,
      )
      this.sectionNumber += 1
      this.paint(header, x, top, columnWidth, `${column.spec.title} header`)
      let cursor = top + header.height
      for (const block of column.blocks) {
        this.paint(block, x, cursor, columnWidth, column.spec.title)
        cursor += block.height
      }
    }

    this.y = top + rowHeight + SECTION_GAP
  }

  /** Pairs short adjacent sections so pages do not end with large voids. */
  layout(specs: SectionSpec[]) {
    const prepared = specs
      .map(spec => ({ spec, blocks: spec.build(CONTENT_WIDTH) }))
      .filter(entry => entry.blocks.length)

    const columnWidth = (CONTENT_WIDTH - COLUMN_GAP) / 2
    let i = 0

    while (i < prepared.length) {
      const current = prepared[i]
      const next = prepared[i + 1]

      if (next && !current.spec.solo && !next.spec.solo && !current.spec.bare && !next.spec.bare) {
        const a = current.spec.build(columnWidth)
        const b = next.spec.build(columnWidth)
        const ah = sectionHeaderBlock(this.pdf, 0, current.spec.title, current.spec.color, columnWidth).height
          + a.reduce((t, block) => t + block.height, 0)
        const bh = sectionHeaderBlock(this.pdf, 0, next.spec.title, next.spec.color, columnWidth).height
          + b.reduce((t, block) => t + block.height, 0)

        if (a.length && b.length && ah <= PAIR_MAX_HEIGHT && bh <= PAIR_MAX_HEIGHT) {
          this.placePair(
            { spec: current.spec, blocks: a, height: ah },
            { spec: next.spec, blocks: b, height: bh },
            columnWidth,
          )
          i += 2
          continue
        }
      }

      this.placeSection(current.spec, current.blocks)
      i += 1
    }
  }

  finish(closing: string) {
    const { pdf, palette } = this

    const note = (size: number, rule: boolean): { lines: string[]; height: number; lh: number } => {
      const lines = wrapText(pdf, closing, CONTENT_WIDTH, size)
      const lh = lineHeight(size, 1.36)
      return { lines, lh, height: lines.length * lh + (rule ? 4 : 1) }
    }

    const full = note(TYPE.caption, true)

    if (this.y + full.height <= this.bottom) {
      const block: Block = {
        height: full.height,
        draw: (x, y) => {
          setStroke(pdf, palette.band)
          pdf.setLineWidth(0.7)
          pdf.line(x, y, x + CONTENT_WIDTH, y)

          pdf.setFont('helvetica', 'normal')
          pdf.setFontSize(TYPE.caption)
          setText(pdf, MUTED)
          full.lines.forEach((line, i) => pdf.text(line, x, y + 3.4 + full.lh * (i + 0.74)))
        },
      }
      this.paint(block, MARGIN.left, this.y, CONTENT_WIDTH, 'closing note')
      this.y += block.height
    } else {
      // A disclaimer must never open a page of its own, so it uses the reserved
      // band between the content area and the footer rule instead.
      const compact = note(7, false)
      const block: Block = {
        height: compact.height,
        draw: (x, y) => {
          pdf.setFont('helvetica', 'normal')
          pdf.setFontSize(7)
          setText(pdf, MUTED)
          compact.lines
            .slice(0, 2)
            .forEach((line, i) => pdf.text(line, x, y + compact.lh * (i + 0.74)))
        },
      }
      this.paint(block, MARGIN.left, this.bottom + 1, CONTENT_WIDTH, 'closing note (compact)')
    }

    this.drawFooters()
  }

  private drawFooters() {
    const { pdf, palette } = this
    const total = pdf.getNumberOfPages()

    for (let page = 1; page <= total; page += 1) {
      pdf.setPage(page)
      // Sits below the reserved note band, still well inside the printable area.
      const y = PAGE.height - MARGIN.bottom + 4

      setStroke(pdf, HAIRLINE)
      pdf.setLineWidth(0.3)
      pdf.line(MARGIN.left, y - 5, PAGE.width - MARGIN.right, y - 5)

      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(TYPE.label)
      setText(pdf, palette.header)
      pdf.text(BRAND.shortName, MARGIN.left, y - 1.2)

      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(TYPE.label - 0.6)
      setText(pdf, MUTED)
      pdf.text(WING_NAME, MARGIN.left, y + 2)

      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(TYPE.label + 0.4)
      setText(pdf, palette.accent)
      const label = `Page ${page} of ${total}`
      pdf.text(label, PAGE.width - MARGIN.right - pdf.getTextWidth(label), y - 1.2)
    }

    pdf.setPage(total)
  }
}

/* ------------------------------------------------------------------ *
 * Document composition
 * ------------------------------------------------------------------ */

function isExternalVideoLink(url: string): boolean {
  const clean = (url || '').trim()
  if (!/^https?:\/\//i.test(clean)) return false
  return !/vercel\.app|localhost|\/content\//i.test(clean)
}

async function buildDocument(
  advisory: Advisory,
  settings: AppSettings,
  trace?: Placement[],
): Promise<jsPDF> {
  const theme = themeOf(advisory.documentTheme)
  const severity = normalizeSeverity(advisory.severity)
  const hazardHex = hazardColor(advisory.hazard)

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true })
  pdf.setProperties({
    title: cleanText(advisory.title) || 'Infrastructure Advisory',
    subject: `${cleanText(advisory.type)} - ${cleanText(advisory.hazard)}`,
    author: BRAND.name,
    creator: BRAND.name,
    keywords: [advisory.hazard, advisory.province, advisory.district, severity].filter(Boolean).join(', '),
  })

  const palette: Palette = {
    header: hexToRgb(theme.header),
    accent: hexToRgb(theme.accent),
    band: hexToRgb(theme.band),
    ink: hexToRgb(theme.ink),
    severity: hexToRgb(SEVERITY_COLOR[severity]),
  }

  const advisoryNumber = cleanText(advisory.advisoryNumber)
    || `IRW-${new Date(advisory.createdAt).getFullYear()}-${advisory.id.slice(-6).toUpperCase()}`

  // Imagery is resolved before layout so measurements are exact.
  const coverSource = advisory.images.find(i => i.isCover) || advisory.images[0]
  const gallerySource = advisory.images.filter(i => i !== coverSource)

  const [orgLogo, wingLogo, advisoryLogo, coverImage] = await Promise.all([
    loadImageForPdf(advisory.orgLogo || settings.orgLogo, { preferPng: true }),
    loadImageForPdf(advisory.wingLogo || settings.wingLogo, { preferPng: true }),
    loadImageForPdf(settings.advisoryLogo, { preferPng: true }),
    loadImageForPdf(coverSource?.dataUrl),
  ])

  const gallery = (
    await Promise.all(
      gallerySource.slice(0, 12).map(async (img, index) => ({
        caption: img.caption,
        label: `FIGURE ${String(index + (coverImage ? 2 : 1)).padStart(2, '0')}`,
        image: await loadImageForPdf(img.dataUrl),
      })),
    )
  )
    .filter(item => item.image)
    .map(item => ({ ...item, image: item.image as LoadedImage }))

  const flow = new DocumentFlow(pdf, palette, advisoryNumber, trace)

  flow.placeCover(
    coverBlocks(pdf, advisory, palette, advisoryNumber, { orgLogo, wingLogo, advisoryLogo }, CONTENT_WIDTH),
  )

  if (coverImage) {
    // Editorial proportion: supports the advisory without consuming the page.
    flow.placeCover(
      imageBlocks(pdf, coverImage, coverSource?.caption || '', 'FIGURE 01', CONTENT_WIDTH, 58),
      'cover figure',
    )
  }

  const summary = sanitizeDocText(advisory.shortSummary)
  const situation = sanitizeDocText(advisory.currentSituation)
  const problem = sanitizeDocText(advisory.identifiedProblem)
  const risks = sanitizeDocText(advisory.risks)
  const observed = sanitizeDocText(advisory.observedConditions)
  const guidance = sanitizeDocText(advisory.publicGuidance)
  const takeaway = sanitizeDocText(advisory.keyTakeaway)
  const contact = sanitizeDocText(advisory.contactInfo)
  const references = sanitizeDocText(advisory.references)

  const conditions = [
    { label: 'Weather', value: advisory.weatherCondition },
    { label: 'Rainfall', value: advisory.rainfallCondition },
    { label: 'River / Water', value: advisory.riverCondition },
    { label: 'Ground', value: advisory.groundCondition },
    { label: 'Visibility', value: advisory.visibility },
    { label: 'Other', value: advisory.otherCondition },
  ]

  const videoTitle = cleanText(advisory.videoTitle)
  const videoDescription = sanitizeDocText(advisory.videoDescription)
  const videoLink = isExternalVideoLink(advisory.videoUrl) ? advisory.videoUrl.trim() : ''

  const specs: SectionSpec[] = [
    {
      title: 'Executive Brief',
      color: theme.accent,
      solo: true,
      build: w =>
        briefBlocks(
          pdf,
          [
            { label: 'Hazard', value: advisory.hazard, color: hazardHex },
            { label: 'Location', value: cleanText(advisory.specificLocation) || locationLabel(advisory), color: ACCENT.blue },
            { label: 'Severity', value: severity, color: SEVERITY_COLOR[severity] },
          ],
          summary,
          w,
          theme.accent,
        ),
    },
    {
      title: 'Situation / Observation',
      color: SECTION_COLOR.situation,
      build: w => paragraphBlocks(pdf, situation, w),
    },
    {
      title: 'Identified Problem',
      color: SECTION_COLOR.problem,
      build: w => calloutBlocks(pdf, problem, w, SECTION_COLOR.problem, { emphasis: true }),
    },
    {
      title: 'Infrastructure at Risk',
      color: SECTION_COLOR.assets,
      build: w => assetCardBlocks(pdf, advisory.affectedInfrastructure, w, SECTION_COLOR.assets),
    },
    {
      title: 'Risk / Potential Impact',
      color: SECTION_COLOR.risk,
      build: w => calloutBlocks(pdf, risks, w, SECTION_COLOR.risk, { emphasis: true }),
    },
    {
      title: 'Key Observations',
      color: SECTION_COLOR.observations,
      solo: true,
      build: w => [
        ...paragraphBlocks(pdf, observed, w),
        ...(observed ? [{ height: 1.6, draw: () => {} }] : []),
        ...observationBlocks(pdf, conditions, w, SECTION_COLOR.observations),
      ],
    },
    {
      title: 'Engineering Recommendations',
      color: SECTION_COLOR.recommendations,
      solo: true,
      build: w =>
        numberedCardBlocks(pdf, advisory.engineeringRecommendations, w, SECTION_COLOR.recommendations),
    },
    {
      title: 'Action Plan',
      color: SECTION_COLOR.actions,
      solo: true,
      build: w =>
        timelineBlocks(pdf, [
          { label: 'Immediate', items: advisory.immediateActions, color: ACTION_PHASE_COLOR.immediate },
          { label: 'Short Term', items: advisory.shortTermMeasures, color: ACTION_PHASE_COLOR.shortTerm },
          { label: 'Medium Term', items: advisory.mediumTermMeasures, color: ACTION_PHASE_COLOR.mediumTerm },
          { label: 'Long Term Resilience', items: advisory.longTermMeasures, color: ACTION_PHASE_COLOR.longTerm },
        ], w),
    },
    {
      title: 'Public Do & Do Not',
      color: SECTION_COLOR.publicConduct,
      solo: true,
      build: w =>
        dualListBlocks(
          pdf,
          { title: 'Do', items: advisory.dos, color: ACCENT.green },
          { title: 'Do Not', items: advisory.donts, color: ACCENT.red },
          w,
        ),
    },
    {
      title: 'Visual Evidence',
      color: SECTION_COLOR.visuals,
      solo: true,
      build: w => imageGridBlocks(pdf, gallery, w),
    },
    {
      title: 'Related Video Briefing',
      color: SECTION_COLOR.video,
      solo: true,
      build: w =>
        videoTitle || videoDescription || videoLink
          ? videoBlocks(pdf, { title: videoTitle, description: videoDescription, url: videoLink }, w, SECTION_COLOR.video)
          : [],
    },
    {
      title: 'Public Guidance',
      color: SECTION_COLOR.guidance,
      build: w => calloutBlocks(pdf, guidance, w, SECTION_COLOR.guidance),
    },
    {
      title: 'Key Takeaway',
      color: theme.accent,
      bare: true,
      solo: true,
      build: w => bannerBlocks(pdf, 'Key Takeaway', takeaway, w, palette),
    },
    {
      title: 'Contact / Escalation',
      color: SECTION_COLOR.contact,
      build: w => contactBlocks(pdf, contact, w, SECTION_COLOR.contact),
    },
    {
      title: 'Sources / References',
      color: SECTION_COLOR.references,
      build: w => referenceBlocks(pdf, references, w),
    },
  ]

  flow.layout(specs)
  flow.finish(
    `Issued through ${BRAND.name}. ${WING_NAME}. Content reflects information entered by authorized administrators `
    + 'and should be applied with professional engineering judgement.',
  )

  return pdf
}

/* ------------------------------------------------------------------ *
 * Public API
 * ------------------------------------------------------------------ */

export function advisoryPdfFilename(advisory: Advisory): string {
  const number = cleanText(advisory.advisoryNumber) || `IRW-${advisory.id.slice(-6).toUpperCase()}`
  const place = cleanText(advisory.district || advisory.province || 'Pakistan')
  const date = (advisory.publishedAt || advisory.createdAt || '').slice(0, 10)
  return `${sanitizeFilename(`IRW_Advisory_${number}_${place}_${date}`)}.pdf`
}

/** Build the advisory PDF and return a validated Blob. */
export async function buildAdvisoryPdfBlob(
  advisory: Advisory,
  settings: AppSettings,
): Promise<Blob> {
  const pdf = await buildDocument(advisory, settings)
  const blob = pdf.output('blob') as Blob

  if (!(blob instanceof Blob)) throw new Error('PDF generation did not return a file')
  if (blob.size < 1024) throw new Error('Generated PDF is empty')

  // jsPDF sometimes returns an untyped Blob; normalize so mobile/WhatsApp accept it.
  const typed = blob.type === 'application/pdf' ? blob : new Blob([blob], { type: 'application/pdf' })

  const header = new Uint8Array(await typed.slice(0, 5).arrayBuffer())
  const signature = String.fromCharCode(...header)
  if (!signature.startsWith('%PDF-')) throw new Error('Generated file is not a valid PDF')

  return typed
}

/** Layout geometry for the automated page audit. Not used by the portal UI. */
export async function traceAdvisoryPdf(advisory: Advisory, settings: AppSettings) {
  const placements: Placement[] = []
  const pdf = await buildDocument(advisory, settings, placements)
  return {
    placements,
    pages: pdf.getNumberOfPages(),
    frame: {
      top: MARGIN.top,
      left: MARGIN.left,
      right: PAGE.width - MARGIN.right,
      bottom: PAGE.height - MARGIN.bottom - FOOTER_ZONE,
      contentTop: MARGIN.top + RUNNING_HEADER_HEIGHT,
    },
  }
}
