import { jsPDF } from 'jspdf'
import type { Advisory, AppSettings, Severity } from '../types'
import { BRAND, normalizeSeverity } from '../data/constants'
import { themeOf } from '../data/documentDesign'
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

const RUNNING_HEADER_HEIGHT = 14
const FOOTER_HEIGHT = 12
const WING_NAME = 'Infrastructure Advisory & Project Development Wing'

const SEVERITY_COLOR: Record<Severity, string> = {
  Normal: '#1D4ED8',
  Low: '#16A34A',
  Moderate: '#D97706',
  High: '#EA580C',
  Critical: '#DC2626',
}

const ACCENT = {
  blue: '#168DDB',
  cyan: '#12B8D6',
  green: '#20B26B',
  amber: '#F2A900',
  orange: '#F47B20',
  red: '#E5484D',
  purple: '#7357D9',
  slate: '#475569',
}

interface Palette {
  header: RGB
  accent: RGB
  band: RGB
  ink: RGB
  severity: RGB
}

interface Doc {
  pdf: jsPDF
  y: number
  palette: Palette
  sectionNumber: number
  advisoryNumber: string
}

/* ------------------------------------------------------------------ *
 * Page flow
 * ------------------------------------------------------------------ */

function contentBottom(): number {
  return PAGE.height - MARGIN.bottom - FOOTER_HEIGHT
}

function newPage(doc: Doc) {
  doc.pdf.addPage('a4', 'portrait')
  drawRunningHeader(doc)
  doc.y = MARGIN.top + RUNNING_HEADER_HEIGHT
}

/** Reserve vertical space; starts a new page when the block will not fit. */
function ensureSpace(doc: Doc, needed: number) {
  if (doc.y + needed > contentBottom()) newPage(doc)
}

function drawRunningHeader(doc: Doc) {
  const { pdf, palette } = doc
  const y = MARGIN.top

  setFill(pdf, palette.header)
  pdf.rect(MARGIN.left, y - 6, CONTENT_WIDTH, 0.9, 'F')

  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(7.5)
  setText(pdf, palette.header)
  drawTrackedText(pdf, BRAND.name, MARGIN.left, y, 0.5)

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(7.5)
  setText(pdf, hexToRgb(ACCENT.slate))
  const ref = `Advisory No: ${doc.advisoryNumber}`
  pdf.text(ref, PAGE.width - MARGIN.right - pdf.getTextWidth(ref), y)

  setFill(pdf, palette.band)
  pdf.rect(MARGIN.left, y + 2, CONTENT_WIDTH, 0.7, 'F')
}

function drawFooters(doc: Doc) {
  const { pdf, palette } = doc
  const total = pdf.getNumberOfPages()

  for (let page = 1; page <= total; page += 1) {
    pdf.setPage(page)
    const y = PAGE.height - MARGIN.bottom

    setStroke(pdf, tintRgb(palette.header, 0.72))
    pdf.setLineWidth(0.3)
    pdf.line(MARGIN.left, y - 5, PAGE.width - MARGIN.right, y - 5)

    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(7)
    setText(pdf, palette.header)
    pdf.text(BRAND.shortName, MARGIN.left, y - 1)

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(6.5)
    setText(pdf, hexToRgb(ACCENT.slate))
    pdf.text(WING_NAME, MARGIN.left, y + 2.6)

    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(7)
    setText(pdf, palette.accent)
    const label = `Page ${page} of ${total}`
    pdf.text(label, PAGE.width - MARGIN.right - pdf.getTextWidth(label), y - 1)
  }

  pdf.setPage(total)
}

/* ------------------------------------------------------------------ *
 * Text blocks
 * ------------------------------------------------------------------ */

function paragraph(
  doc: Doc,
  value: string,
  options: { size?: number; color?: RGB; bold?: boolean; indent?: number; gap?: number } = {},
) {
  const text = cleanText(value)
  if (!text) return

  const { pdf } = doc
  const size = options.size ?? 9.5
  const indent = options.indent ?? 0
  const width = CONTENT_WIDTH - indent
  const lh = lineHeight(size)

  pdf.setFont('helvetica', options.bold ? 'bold' : 'normal')
  pdf.setFontSize(size)
  setText(pdf, options.color ?? hexToRgb('#1F2937'))

  for (const block of text.split('\n')) {
    if (!block.trim()) {
      doc.y += lh * 0.5
      continue
    }
    const lines = pdf.splitTextToSize(block, width) as string[]
    for (const line of lines) {
      ensureSpace(doc, lh)
      pdf.setFont('helvetica', options.bold ? 'bold' : 'normal')
      pdf.setFontSize(size)
      setText(pdf, options.color ?? hexToRgb('#1F2937'))
      pdf.text(line, MARGIN.left + indent, doc.y + lh * 0.72)
      doc.y += lh
    }
  }

  doc.y += options.gap ?? 1.2
}

/** Section heading kept together with the first lines of its content. */
function sectionHeading(doc: Doc, title: string, colorHex: string) {
  const { pdf } = doc
  const color = hexToRgb(colorHex)
  const number = String(doc.sectionNumber).padStart(2, '0')
  doc.sectionNumber += 1

  const boxHeight = 8
  ensureSpace(doc, boxHeight + lineHeight(9.5) * 2 + 3)

  setFill(pdf, color)
  pdf.roundedRect(MARGIN.left, doc.y, 9, boxHeight, 1.4, 1.4, 'F')

  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(7.5)
  setText(pdf, [255, 255, 255])
  pdf.text(number, MARGIN.left + 4.5 - pdf.getTextWidth(number) / 2, doc.y + 5.4)

  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(9)
  setText(pdf, color)
  drawTrackedText(pdf, title.toUpperCase(), MARGIN.left + 12.5, doc.y + 5.4, 0.55)

  setStroke(pdf, color)
  pdf.setLineWidth(0.5)
  pdf.line(MARGIN.left, doc.y + boxHeight + 1.6, PAGE.width - MARGIN.right, doc.y + boxHeight + 1.6)

  doc.y += boxHeight + 4.4
}

function calloutBlock(doc: Doc, value: string, colorHex: string) {
  const text = cleanText(value)
  if (!text) return

  const { pdf } = doc
  const color = hexToRgb(colorHex)
  const size = 9.5
  const lh = lineHeight(size)
  const padding = 3.2
  const innerWidth = CONTENT_WIDTH - padding * 2 - 2

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(size)

  const paragraphs = text.split('\n').filter(Boolean)
  for (const block of paragraphs) {
    const lines = pdf.splitTextToSize(block, innerWidth) as string[]
    let index = 0

    while (index < lines.length) {
      const available = contentBottom() - doc.y - padding * 2
      if (available < lh * 1.5) {
        newPage(doc)
        continue
      }
      const fit = Math.max(1, Math.floor(available / lh))
      const slice = lines.slice(index, index + fit)
      const boxHeight = slice.length * lh + padding * 2

      setFill(pdf, tintRgb(color, 0.9))
      pdf.roundedRect(MARGIN.left, doc.y, CONTENT_WIDTH, boxHeight, 2, 2, 'F')
      setFill(pdf, color)
      pdf.rect(MARGIN.left, doc.y, 1.6, boxHeight, 'F')

      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(size)
      setText(pdf, hexToRgb('#1F2937'))
      slice.forEach((line, i) => {
        pdf.text(line, MARGIN.left + padding + 2, doc.y + padding + lh * (i + 0.72))
      })

      doc.y += boxHeight + 2
      index += fit
    }
  }

  doc.y += 0.8
}

function bulletList(
  doc: Doc,
  items: string[],
  colorHex: string,
  options: { numbered?: boolean } = {},
) {
  const entries = items.map(cleanText).filter(Boolean)
  if (!entries.length) return

  const { pdf } = doc
  const color = hexToRgb(colorHex)
  const size = 9.5
  const lh = lineHeight(size)
  const markerWidth = options.numbered ? 7 : 5
  const textIndent = markerWidth + 1.5

  entries.forEach((entry, index) => {
    const lines = pdf.splitTextToSize(entry, CONTENT_WIDTH - textIndent) as string[]
    // Keep the marker with at least its first line.
    ensureSpace(doc, lh * Math.min(lines.length, 2))

    const markerY = doc.y + lh * 0.72
    if (options.numbered) {
      setFill(pdf, color)
      pdf.circle(MARGIN.left + 2.4, markerY - 1.1, 2.3, 'F')
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(6.5)
      setText(pdf, [255, 255, 255])
      const label = String(index + 1)
      pdf.text(label, MARGIN.left + 2.4 - pdf.getTextWidth(label) / 2, markerY + 0.5)
    } else {
      setFill(pdf, color)
      pdf.circle(MARGIN.left + 1.8, markerY - 1.1, 1.1, 'F')
    }

    lines.forEach((line, i) => {
      if (i > 0) ensureSpace(doc, lh)
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(size)
      setText(pdf, hexToRgb('#1F2937'))
      pdf.text(line, MARGIN.left + textIndent, doc.y + lh * 0.72)
      doc.y += lh
    })
    doc.y += 1
  })

  doc.y += 1
}

function chipRow(doc: Doc, items: string[], colorHex: string) {
  const entries = items.map(cleanText).filter(Boolean)
  if (!entries.length) return

  const { pdf } = doc
  const color = hexToRgb(colorHex)
  const height = 6.4
  const gap = 2.2
  let x = MARGIN.left

  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(7.5)

  ensureSpace(doc, height)

  for (const entry of entries) {
    const label = entry.toUpperCase()
    const width = trackedTextWidth(pdf, label, 0.4) + 6
    if (x + width > PAGE.width - MARGIN.right) {
      x = MARGIN.left
      doc.y += height + gap
      ensureSpace(doc, height)
    }

    setFill(pdf, tintRgb(color, 0.86))
    pdf.roundedRect(x, doc.y, width, height, 1.6, 1.6, 'F')
    setStroke(pdf, tintRgb(color, 0.55))
    pdf.setLineWidth(0.25)
    pdf.roundedRect(x, doc.y, width, height, 1.6, 1.6, 'S')

    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(7.5)
    setText(pdf, color)
    drawTrackedText(pdf, label, x + 3, doc.y + 4.3, 0.4)

    x += width + gap
  }

  doc.y += height + 3
}

function factGrid(doc: Doc, facts: { label: string; value: string }[], colorHex: string) {
  const entries = facts
    .map(f => ({ label: cleanText(f.label), value: cleanText(f.value) }))
    .filter(f => f.value)
  if (!entries.length) return

  const { pdf } = doc
  const color = hexToRgb(colorHex)
  const columnGap = 4
  const columnWidth = (CONTENT_WIDTH - columnGap) / 2
  const size = 8.5
  const lh = lineHeight(size)

  for (let i = 0; i < entries.length; i += 2) {
    const pair = entries.slice(i, i + 2)
    const heights = pair.map(entry => {
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(size)
      const lines = pdf.splitTextToSize(entry.value, columnWidth - 6) as string[]
      return lines.length * lh + 8.5
    })
    const rowHeight = Math.max(...heights)
    ensureSpace(doc, rowHeight + 2)

    pair.forEach((entry, col) => {
      const x = MARGIN.left + col * (columnWidth + columnGap)

      setFill(pdf, tintRgb(color, 0.92))
      pdf.roundedRect(x, doc.y, columnWidth, rowHeight, 1.8, 1.8, 'F')
      setStroke(pdf, tintRgb(color, 0.6))
      pdf.setLineWidth(0.25)
      pdf.roundedRect(x, doc.y, columnWidth, rowHeight, 1.8, 1.8, 'S')

      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(6.5)
      setText(pdf, color)
      drawTrackedText(pdf, entry.label.toUpperCase(), x + 3, doc.y + 4.2, 0.45)

      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(size)
      setText(pdf, hexToRgb('#1F2937'))
      const lines = pdf.splitTextToSize(entry.value, columnWidth - 6) as string[]
      lines.forEach((line, li) => {
        pdf.text(line, x + 3, doc.y + 7.4 + lh * (li + 0.72))
      })
    })

    doc.y += rowHeight + 2.5
  }

  doc.y += 0.8
}

function twoColumnLists(
  doc: Doc,
  left: { title: string; items: string[]; color: string },
  right: { title: string; items: string[]; color: string },
) {
  const leftItems = left.items.map(cleanText).filter(Boolean)
  const rightItems = right.items.map(cleanText).filter(Boolean)
  if (!leftItems.length && !rightItems.length) return

  const { pdf } = doc
  const columnGap = 4
  const columnWidth = (CONTENT_WIDTH - columnGap) / 2
  const size = 9
  const lh = lineHeight(size)

  const measure = (items: string[]) => {
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(size)
    return items.reduce((total, item) => {
      const lines = pdf.splitTextToSize(item, columnWidth - 9) as string[]
      return total + lines.length * lh + 1.2
    }, 0)
  }

  const bodyHeight = Math.max(measure(leftItems), measure(rightItems))
  const blockHeight = bodyHeight + 12

  // Long lists fall back to stacked sections so nothing is clipped.
  if (blockHeight > contentBottom() - MARGIN.top - RUNNING_HEADER_HEIGHT) {
    if (leftItems.length) {
      paragraph(doc, left.title, { bold: true, size: 9, color: hexToRgb(left.color) })
      bulletList(doc, leftItems, left.color)
    }
    if (rightItems.length) {
      paragraph(doc, right.title, { bold: true, size: 9, color: hexToRgb(right.color) })
      bulletList(doc, rightItems, right.color)
    }
    return
  }

  ensureSpace(doc, blockHeight)
  const top = doc.y

  const drawColumn = (
    x: number,
    config: { title: string; items: string[]; color: string },
    items: string[],
  ) => {
    if (!items.length) return
    const color = hexToRgb(config.color)

    setFill(pdf, tintRgb(color, 0.9))
    pdf.roundedRect(x, top, columnWidth, blockHeight, 2, 2, 'F')
    setStroke(pdf, tintRgb(color, 0.58))
    pdf.setLineWidth(0.25)
    pdf.roundedRect(x, top, columnWidth, blockHeight, 2, 2, 'S')

    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(8.5)
    setText(pdf, color)
    drawTrackedText(pdf, config.title.toUpperCase(), x + 4, top + 6, 0.5)

    let cursor = top + 10
    items.forEach(item => {
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(size)
      setText(pdf, hexToRgb('#1F2937'))
      const lines = pdf.splitTextToSize(item, columnWidth - 9) as string[]
      setFill(pdf, color)
      pdf.circle(x + 4.6, cursor + lh * 0.72 - 1.1, 1, 'F')
      lines.forEach((line, i) => {
        pdf.text(line, x + 7.5, cursor + lh * (i + 0.72))
      })
      cursor += lines.length * lh + 1.2
    })
  }

  drawColumn(MARGIN.left, left, leftItems)
  drawColumn(MARGIN.left + columnWidth + columnGap, right, rightItems)

  doc.y = top + blockHeight + 3
}

function highlightBox(doc: Doc, label: string, value: string, accentHex: string) {
  const text = cleanText(value)
  if (!text) return

  const { pdf, palette } = doc
  const size = 9.5
  const lh = lineHeight(size)
  const padding = 4

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(size)
  const lines = pdf.splitTextToSize(text, CONTENT_WIDTH - padding * 2) as string[]
  const boxHeight = lines.length * lh + padding * 2 + 5

  // Taller than a full page: fall back to the paginating callout.
  if (boxHeight > contentBottom() - MARGIN.top - RUNNING_HEADER_HEIGHT) {
    sectionHeading(doc, label, accentHex)
    calloutBlock(doc, text, accentHex)
    return
  }

  ensureSpace(doc, boxHeight)

  gradientRect(pdf, MARGIN.left, doc.y, CONTENT_WIDTH, boxHeight, palette.header, palette.accent)
  setFill(pdf, palette.band)
  pdf.rect(MARGIN.left, doc.y, CONTENT_WIDTH, 1.2, 'F')

  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(7)
  setText(pdf, palette.band)
  drawTrackedText(pdf, label.toUpperCase(), MARGIN.left + padding, doc.y + padding + 3, 0.7)

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(size)
  setText(pdf, [255, 255, 255])
  lines.forEach((line, i) => {
    pdf.text(line, MARGIN.left + padding, doc.y + padding + 6.5 + lh * (i + 0.72))
  })

  doc.y += boxHeight + 3
}

function imageBlock(
  doc: Doc,
  image: LoadedImage,
  caption: string,
  figureLabel: string,
  maxHeight = 92,
) {
  const { pdf } = doc
  const size = 8
  const lh = lineHeight(size)
  const fitted = fitContain(image, CONTENT_WIDTH, maxHeight)

  pdf.setFont('helvetica', 'italic')
  pdf.setFontSize(size)
  const captionText = cleanText(caption)
  const captionLines = captionText
    ? (pdf.splitTextToSize(`${figureLabel} · ${captionText}`, CONTENT_WIDTH - 4) as string[])
    : [figureLabel]
  const captionHeight = captionLines.length * lh + 2.5

  // Image + caption stay on the same page.
  ensureSpace(doc, fitted.height + captionHeight + 3)

  const x = MARGIN.left + (CONTENT_WIDTH - fitted.width) / 2
  pdf.addImage(image.dataUrl, image.format, x, doc.y, fitted.width, fitted.height, undefined, 'FAST')
  setStroke(pdf, hexToRgb('#CBD5E1'))
  pdf.setLineWidth(0.25)
  pdf.rect(x, doc.y, fitted.width, fitted.height, 'S')
  doc.y += fitted.height + 2

  pdf.setFont('helvetica', 'italic')
  pdf.setFontSize(size)
  setText(pdf, hexToRgb('#64748B'))
  captionLines.forEach((line, i) => {
    pdf.text(line, MARGIN.left, doc.y + lh * (i + 0.72))
  })
  doc.y += captionLines.length * lh + 3
}

/* ------------------------------------------------------------------ *
 * Cover header
 * ------------------------------------------------------------------ */

interface CoverAssets {
  orgLogo: LoadedImage | null
  wingLogo: LoadedImage | null
  advisoryLogo: LoadedImage | null
}

function drawCoverHeader(doc: Doc, advisory: Advisory, assets: CoverAssets) {
  const { pdf, palette } = doc
  const severity = normalizeSeverity(advisory.severity)
  const logos = [assets.orgLogo, assets.wingLogo, assets.advisoryLogo].filter(Boolean) as LoadedImage[]

  pdf.setFont('times', 'bold')
  pdf.setFontSize(19)
  const titleText = cleanText(advisory.title) || 'Untitled advisory'
  const titleLines = pdf.splitTextToSize(titleText, CONTENT_WIDTH - 8) as string[]
  const titleHeight = titleLines.length * lineHeight(19, 1.18)

  const logoHeight = logos.length ? 18 : 0
  const headerHeight = 16 + logoHeight + 10 + titleHeight + 20

  const x = MARGIN.left
  const y = MARGIN.top
  const width = CONTENT_WIDTH

  gradientRect(pdf, x, y, width, headerHeight, palette.header, palette.accent)
  setFill(pdf, palette.band)
  pdf.rect(x, y, width, 1.6, 'F')

  let cursor = y + 7

  // Brand + reference row
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(7.5)
  setText(pdf, palette.band)
  drawTrackedText(pdf, BRAND.name, x + 5, cursor + 2, 0.7)

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(7)
  setText(pdf, [226, 240, 252])
  const refLines = [`Advisory No: ${doc.advisoryNumber}`, `Version: ${advisory.version}.0`]
  refLines.forEach((line, i) => {
    pdf.text(line, PAGE.width - MARGIN.right - 5 - pdf.getTextWidth(line), cursor + 2 + i * 3.6)
  })

  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(10)
  setText(pdf, [255, 255, 255])
  pdf.text(cleanText(advisory.type) || 'Infrastructure Advisory', x + 5, cursor + 8)
  cursor += 12

  // Logos on a white plate so transparent PNGs never show artifacts.
  if (logos.length) {
    let logoX = x + 5
    for (const logo of logos) {
      const fitted = fitContain(logo, 34, 16)
      setFill(pdf, [255, 255, 255])
      pdf.roundedRect(logoX, cursor, fitted.width + 3, fitted.height + 3, 1.5, 1.5, 'F')
      pdf.addImage(
        logo.dataUrl,
        logo.format,
        logoX + 1.5,
        cursor + 1.5,
        fitted.width,
        fitted.height,
        undefined,
        'FAST',
      )
      logoX += fitted.width + 7
    }
    cursor += logoHeight
  }

  // Hazard + severity chips
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(7.5)
  const hazardLabel = cleanText(advisory.hazard).toUpperCase()
  const hazardWidth = trackedTextWidth(pdf, hazardLabel, 0.6) + 7
  setFill(pdf, palette.band)
  pdf.roundedRect(x + 5, cursor, hazardWidth, 6.4, 1.6, 1.6, 'F')
  setText(pdf, palette.header)
  drawTrackedText(pdf, hazardLabel, x + 8.5, cursor + 4.3, 0.6)

  const sevLabel = `${severity.toUpperCase()} SEVERITY`
  const sevWidth = trackedTextWidth(pdf, sevLabel, 0.6) + 7
  setFill(pdf, palette.severity)
  pdf.roundedRect(x + 5 + hazardWidth + 3, cursor, sevWidth, 6.4, 1.6, 1.6, 'F')
  setText(pdf, [255, 255, 255])
  drawTrackedText(pdf, sevLabel, x + 8.5 + hazardWidth + 3, cursor + 4.3, 0.6)
  cursor += 10.5

  // Title
  pdf.setFont('times', 'bold')
  pdf.setFontSize(19)
  setText(pdf, [255, 255, 255])
  titleLines.forEach((line, i) => {
    pdf.text(line, x + 5, cursor + lineHeight(19, 1.18) * (i + 0.78))
  })
  cursor += titleHeight + 4

  // Meta row
  const meta = [
    { label: 'Date', value: formatDateLong(advisory.publishedAt || advisory.createdAt) || '-' },
    { label: 'Location', value: cleanText(advisory.specificLocation) || locationLabel(advisory) },
    { label: 'District', value: cleanText(advisory.district) || '-' },
    { label: 'Province', value: cleanText(advisory.province) || 'Pakistan' },
  ]
  const columnWidth = (width - 10) / meta.length

  meta.forEach((item, i) => {
    const mx = x + 5 + i * columnWidth
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(6)
    setText(pdf, [156, 195, 228])
    drawTrackedText(pdf, item.label.toUpperCase(), mx, cursor + 2, 0.5)

    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(8)
    setText(pdf, [255, 255, 255])
    const lines = pdf.splitTextToSize(item.value, columnWidth - 3) as string[]
    pdf.text(lines.slice(0, 2), mx, cursor + 6)
  })

  doc.y = y + headerHeight + 4
}

/* ------------------------------------------------------------------ *
 * Document body
 * ------------------------------------------------------------------ */

function isExternalVideoLink(url: string): boolean {
  if (!url) return false
  const clean = url.trim()
  if (!/^https?:\/\//i.test(clean)) return false
  return !/vercel\.app|localhost|\/content\//i.test(clean)
}

async function buildDocument(advisory: Advisory, settings: AppSettings): Promise<jsPDF> {
  const theme = themeOf(advisory.documentTheme)
  const severity = normalizeSeverity(advisory.severity)

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true })
  pdf.setProperties({
    title: cleanText(advisory.title) || 'Infrastructure Advisory',
    subject: `${cleanText(advisory.type)} - ${cleanText(advisory.hazard)}`,
    author: BRAND.name,
    creator: BRAND.name,
    keywords: [advisory.hazard, advisory.province, advisory.district, severity].filter(Boolean).join(', '),
  })

  const doc: Doc = {
    pdf,
    y: MARGIN.top,
    sectionNumber: 1,
    advisoryNumber:
      cleanText(advisory.advisoryNumber) ||
      `IRW-${new Date(advisory.createdAt).getFullYear()}-${advisory.id.slice(-6).toUpperCase()}`,
    palette: {
      header: hexToRgb(theme.header),
      accent: hexToRgb(theme.accent),
      band: hexToRgb(theme.band),
      ink: hexToRgb(theme.ink),
      severity: hexToRgb(SEVERITY_COLOR[severity]),
    },
  }

  // Load imagery up front; failures degrade gracefully.
  const coverSource = advisory.images.find(i => i.isCover) || advisory.images[0]
  const gallerySource = advisory.images.filter(i => i !== coverSource)

  const [orgLogo, wingLogo, advisoryLogo, coverImage] = await Promise.all([
    loadImageForPdf(advisory.orgLogo || settings.orgLogo, { preferPng: true }),
    loadImageForPdf(advisory.wingLogo || settings.wingLogo, { preferPng: true }),
    loadImageForPdf(settings.advisoryLogo, { preferPng: true }),
    loadImageForPdf(coverSource?.dataUrl),
  ])

  const galleryImages = await Promise.all(
    gallerySource.slice(0, 12).map(async img => ({
      caption: img.caption,
      loaded: await loadImageForPdf(img.dataUrl),
    })),
  )

  drawCoverHeader(doc, advisory, { orgLogo, wingLogo, advisoryLogo })

  if (advisory.infrastructureTypes.filter(Boolean).length) {
    chipRow(doc, advisory.infrastructureTypes, theme.accent)
  }

  if (coverImage) {
    imageBlock(doc, coverImage, coverSource?.caption || '', 'FIGURE 01', 82)
  }

  const summary = sanitizeDocText(advisory.shortSummary)
  if (summary) {
    sectionHeading(doc, 'Executive Brief', theme.accent)
    paragraph(doc, summary)
  }

  if (sanitizeDocText(advisory.currentSituation)) {
    sectionHeading(doc, 'Situation / Observation', theme.accent)
    paragraph(doc, sanitizeDocText(advisory.currentSituation))
  }

  if (sanitizeDocText(advisory.identifiedProblem)) {
    sectionHeading(doc, 'Identified Problem', ACCENT.red)
    calloutBlock(doc, sanitizeDocText(advisory.identifiedProblem), ACCENT.red)
  }

  if (advisory.affectedInfrastructure.filter(Boolean).length) {
    sectionHeading(doc, 'Infrastructure at Risk', ACCENT.blue)
    chipRow(doc, advisory.affectedInfrastructure, ACCENT.blue)
  }

  if (sanitizeDocText(advisory.risks)) {
    sectionHeading(doc, 'Risk / Potential Impact', ACCENT.orange)
    calloutBlock(doc, sanitizeDocText(advisory.risks), ACCENT.orange)
  }

  const conditions = [
    { label: 'Weather', value: advisory.weatherCondition },
    { label: 'Rainfall', value: advisory.rainfallCondition },
    { label: 'River / Water', value: advisory.riverCondition },
    { label: 'Ground', value: advisory.groundCondition },
    { label: 'Visibility', value: advisory.visibility },
    { label: 'Other', value: advisory.otherCondition },
  ]
  if (sanitizeDocText(advisory.observedConditions) || conditions.some(c => cleanText(c.value))) {
    sectionHeading(doc, 'Key Observations', theme.ink)
    paragraph(doc, sanitizeDocText(advisory.observedConditions))
    factGrid(doc, conditions, theme.accent)
  }

  if (advisory.engineeringRecommendations.filter(Boolean).length) {
    sectionHeading(doc, 'Engineering Recommendations', theme.accent)
    bulletList(doc, advisory.engineeringRecommendations, theme.accent)
  }

  if (advisory.immediateActions.filter(Boolean).length) {
    sectionHeading(doc, 'Immediate Actions', ACCENT.red)
    bulletList(doc, advisory.immediateActions, ACCENT.red, { numbered: true })
  }

  if (advisory.shortTermMeasures.filter(Boolean).length) {
    sectionHeading(doc, 'Short-Term Measures', ACCENT.orange)
    bulletList(doc, advisory.shortTermMeasures, ACCENT.orange)
  }

  if (advisory.mediumTermMeasures.filter(Boolean).length) {
    sectionHeading(doc, 'Medium-Term Measures', ACCENT.blue)
    bulletList(doc, advisory.mediumTermMeasures, ACCENT.blue)
  }

  if (advisory.longTermMeasures.filter(Boolean).length) {
    sectionHeading(doc, 'Long-Term Resilience Measures', ACCENT.green)
    bulletList(doc, advisory.longTermMeasures, ACCENT.green)
  }

  if (advisory.dos.filter(Boolean).length || advisory.donts.filter(Boolean).length) {
    sectionHeading(doc, 'Public Do & Do Not', ACCENT.green)
    twoColumnLists(
      doc,
      { title: 'Do', items: advisory.dos, color: ACCENT.green },
      { title: 'Do Not', items: advisory.donts, color: ACCENT.red },
    )
  }

  const usableGallery = galleryImages.filter(g => g.loaded)
  if (usableGallery.length) {
    sectionHeading(doc, 'Visual Evidence', theme.ink)
    usableGallery.forEach((item, i) => {
      imageBlock(
        doc,
        item.loaded as LoadedImage,
        item.caption,
        `FIGURE ${String(i + 2).padStart(2, '0')}`,
        78,
      )
    })
  }

  const videoTitle = cleanText(advisory.videoTitle)
  const videoDescription = sanitizeDocText(advisory.videoDescription)
  if (videoTitle || videoDescription || isExternalVideoLink(advisory.videoUrl)) {
    sectionHeading(doc, 'Related Video Briefing', ACCENT.purple)
    if (videoTitle) paragraph(doc, videoTitle, { bold: true, color: hexToRgb(ACCENT.purple) })
    if (videoDescription) paragraph(doc, videoDescription)
    if (isExternalVideoLink(advisory.videoUrl)) {
      paragraph(doc, `Video link: ${advisory.videoUrl.trim()}`, {
        size: 8.5,
        color: hexToRgb(ACCENT.slate),
      })
    }
  }

  if (sanitizeDocText(advisory.publicGuidance)) {
    sectionHeading(doc, 'Public Guidance', ACCENT.purple)
    paragraph(doc, sanitizeDocText(advisory.publicGuidance))
  }

  if (sanitizeDocText(advisory.keyTakeaway)) {
    highlightBox(doc, 'Key Takeaway', sanitizeDocText(advisory.keyTakeaway), theme.accent)
  }

  if (sanitizeDocText(advisory.contactInfo)) {
    sectionHeading(doc, 'Contact / Escalation', ACCENT.slate)
    paragraph(doc, sanitizeDocText(advisory.contactInfo))
  }

  if (sanitizeDocText(advisory.references)) {
    sectionHeading(doc, 'Sources / References', ACCENT.slate)
    paragraph(doc, sanitizeDocText(advisory.references), { size: 8.5, color: hexToRgb(ACCENT.slate) })
  }

  // Issuing statement
  ensureSpace(doc, 22)
  doc.y += 2
  setStroke(pdf, doc.palette.band)
  pdf.setLineWidth(0.8)
  pdf.line(MARGIN.left, doc.y, PAGE.width - MARGIN.right, doc.y)
  doc.y += 3.5
  paragraph(
    doc,
    `Issued through ${BRAND.name}. ${WING_NAME}. Content is based on information entered by authorized administrators and should be used with professional engineering judgement.`,
    { size: 7.5, color: hexToRgb(ACCENT.slate) },
  )

  drawFooters(doc)
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
