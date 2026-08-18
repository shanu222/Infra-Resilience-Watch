import type { jsPDF } from 'jspdf'
import { fitContain, type LoadedImage } from './pdfImages'
import {
  cleanText,
  drawTrackedText,
  gradientRect,
  hexToRgb,
  lineHeight,
  setFill,
  setStroke,
  setText,
  tintRgb,
  trackedTextWidth,
  type RGB,
} from './pdfPrimitives'

/** A measured, self-contained piece of the document that can be placed on any page. */
export interface Block {
  height: number
  draw: (x: number, y: number) => void
}

export const TYPE = {
  title: 22,
  sectionTitle: 10,
  lead: 10.5,
  body: 10,
  small: 8.6,
  caption: 7.8,
  label: 6.8,
}

export const INK = hexToRgb('#1F2937')
export const MUTED = hexToRgb('#64748B')
export const HAIRLINE = hexToRgb('#D8E2EC')

/** Tallest block the engine will emit, so a single block always fits one page. */
const MAX_BLOCK_HEIGHT = 195
/**
 * Card-backed text is sliced into segments of about this height. Smaller slices
 * flow into partially filled pages instead of leaving large voids behind.
 */
const CARD_SLICE_HEIGHT = 52

function empty(height: number): Block {
  return { height, draw: () => {} }
}

export function spacer(height: number): Block {
  return empty(height)
}

/* ------------------------------------------------------------------ *
 * Text measurement
 * ------------------------------------------------------------------ */

/** jsPDF never breaks inside a word, so long URLs/tokens are pre-chunked. */
function breakLongTokens(pdf: jsPDF, text: string, width: number): string {
  return text
    .split('\n')
    .map(line =>
      line
        .split(' ')
        .map(token => {
          if (!token || pdf.getTextWidth(token) <= width) return token
          const pieces: string[] = []
          let current = ''
          for (const char of token) {
            if (current && pdf.getTextWidth(current + char) > width - 1) {
              pieces.push(current)
              current = char
            } else {
              current += char
            }
          }
          if (current) pieces.push(current)
          return pieces.join(' ')
        })
        .join(' '))
    .join('\n')
}

export function wrapText(
  pdf: jsPDF,
  text: string,
  width: number,
  size: number,
  style: 'normal' | 'bold' | 'italic' = 'normal',
): string[] {
  pdf.setFont('helvetica', style)
  pdf.setFontSize(size)
  return pdf.splitTextToSize(breakLongTokens(pdf, text, width), width) as string[]
}

function drawLines(
  pdf: jsPDF,
  lines: string[],
  x: number,
  y: number,
  size: number,
  color: RGB,
  style: 'normal' | 'bold' | 'italic' = 'normal',
) {
  const lh = lineHeight(size)
  pdf.setFont('helvetica', style)
  pdf.setFontSize(size)
  setText(pdf, color)
  lines.forEach((line, i) => pdf.text(line, x, y + lh * (i + 0.74)))
}

function panel(
  pdf: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: RGB,
  border?: RGB,
  radius = 1.8,
) {
  setFill(pdf, fill)
  pdf.roundedRect(x, y, w, h, radius, radius, 'F')
  if (border) {
    setStroke(pdf, border)
    pdf.setLineWidth(0.25)
    pdf.roundedRect(x, y, w, h, radius, radius, 'S')
  }
}

/* ------------------------------------------------------------------ *
 * Paragraphs — one block per line for exact pagination
 * ------------------------------------------------------------------ */

export function paragraphBlocks(
  pdf: jsPDF,
  text: string,
  width: number,
  options: { size?: number; color?: RGB; style?: 'normal' | 'bold' | 'italic' } = {},
): Block[] {
  const value = cleanText(text)
  if (!value) return []

  const size = options.size ?? TYPE.body
  const color = options.color ?? INK
  const style = options.style ?? 'normal'
  const lh = lineHeight(size, 1.42)
  const blocks: Block[] = []

  const paragraphs = value.split('\n')
  paragraphs.forEach((paragraph, pi) => {
    if (!paragraph.trim()) return
    const lines = wrapText(pdf, paragraph, width, size, style)
    lines.forEach((line, li) => {
      const isLast = li === lines.length - 1
      blocks.push({
        height: lh + (isLast && pi < paragraphs.length - 1 ? 1.8 : 0),
        draw: (x, y) => drawLines(pdf, [line], x, y, size, color, style),
      })
    })
  })

  return blocks
}

/* ------------------------------------------------------------------ *
 * Callout card — tinted surface with a coloured rail
 * ------------------------------------------------------------------ */

export function calloutBlocks(
  pdf: jsPDF,
  text: string,
  width: number,
  colorHex: string,
  options: { size?: number; emphasis?: boolean } = {},
): Block[] {
  const value = cleanText(text)
  if (!value) return []

  const color = hexToRgb(colorHex)
  const size = options.size ?? TYPE.body
  const lh = lineHeight(size, 1.42)
  const padY = 3.4
  const padX = 4.6
  const innerWidth = width - padX - 3.4

  const lines = value
    .split('\n')
    .filter(line => line.trim())
    .flatMap(line => wrapText(pdf, line, innerWidth, size))

  const perSlice = Math.max(3, Math.floor((CARD_SLICE_HEIGHT - padY * 2) / lh))
  const sliceCount = Math.ceil(lines.length / perSlice)
  const fill = tintRgb(color, options.emphasis ? 0.86 : 0.91)
  const border = tintRgb(color, 0.62)
  const blocks: Block[] = []

  for (let i = 0; i < sliceCount; i += 1) {
    const slice = lines.slice(i * perSlice, (i + 1) * perSlice)
    const height = slice.length * lh + padY * 2
    const isFirst = i === 0
    const isLast = i === sliceCount - 1

    blocks.push({
      // Consecutive slices sit flush so they read as one continuous panel.
      height: height + (isLast ? 1.6 : 0),
      draw: (x, y) => {
        if (isFirst && isLast) {
          panel(pdf, x, y, width, height, fill, border)
        } else {
          setFill(pdf, fill)
          pdf.rect(x, y, width, height, 'F')
          setStroke(pdf, border)
          pdf.setLineWidth(0.25)
          pdf.line(x, y, x, y + height)
          pdf.line(x + width, y, x + width, y + height)
          if (isFirst) pdf.line(x, y, x + width, y)
          if (isLast) pdf.line(x, y + height, x + width, y + height)
        }
        setFill(pdf, color)
        pdf.rect(x, y, 1.5, height, 'F')
        drawLines(pdf, slice, x + padX, y + padY - lh * 0.1, size, INK)
      },
    })
  }

  return blocks
}

/* ------------------------------------------------------------------ *
 * Executive brief — at-a-glance strip + summary text
 * ------------------------------------------------------------------ */

export function briefBlocks(
  pdf: jsPDF,
  facts: { label: string; value: string; color: string }[],
  summary: string,
  width: number,
  accentHex: string,
): Block[] {
  const blocks: Block[] = []
  const cells = facts.filter(f => cleanText(f.value))

  if (cells.length) {
    const gap = 2.6
    const cellWidth = (width - gap * (cells.length - 1)) / cells.length
    const valueLines = cells.map(cell => wrapText(pdf, cleanText(cell.value), cellWidth - 7, TYPE.small, 'bold'))
    const rows = Math.max(...valueLines.map(l => Math.min(l.length, 2)))
    const height = 7.4 + rows * lineHeight(TYPE.small, 1.3) + 3

    blocks.push({
      height: height + 2.6,
      draw: (x, y) => {
        cells.forEach((cell, i) => {
          const color = hexToRgb(cell.color)
          const cx = x + i * (cellWidth + gap)
          panel(pdf, cx, y, cellWidth, height, tintRgb(color, 0.9), tintRgb(color, 0.6))
          setFill(pdf, color)
          pdf.roundedRect(cx, y, cellWidth, 1.1, 0.5, 0.5, 'F')

          pdf.setFont('helvetica', 'bold')
          pdf.setFontSize(TYPE.label)
          setText(pdf, color)
          drawTrackedText(pdf, cell.label.toUpperCase(), cx + 3.4, y + 5.2, 0.5)

          drawLines(pdf, valueLines[i].slice(0, 2), cx + 3.4, y + 6.4, TYPE.small, INK, 'bold')
        })
      },
    })
  }

  blocks.push(...calloutBlocks(pdf, summary, width, accentHex, { size: TYPE.lead, emphasis: true }))
  return blocks
}

/* ------------------------------------------------------------------ *
 * Compact tags
 * ------------------------------------------------------------------ */

export function tagBlocks(pdf: jsPDF, items: string[], width: number, colorHex: string): Block[] {
  const entries = items.map(cleanText).filter(Boolean)
  if (!entries.length) return []

  const color = hexToRgb(colorHex)
  const height = 5.8
  const gap = 2

  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(TYPE.label)

  const rows: { label: string; width: number }[][] = [[]]
  let used = 0
  for (const entry of entries) {
    const label = entry.toUpperCase()
    const tagWidth = Math.min(width, trackedTextWidth(pdf, label, 0.4) + 6)
    if (used + tagWidth > width && rows[rows.length - 1].length) {
      rows.push([])
      used = 0
    }
    rows[rows.length - 1].push({ label, width: tagWidth })
    used += tagWidth + gap
  }

  return rows.map((row, ri) => ({
    height: height + (ri === rows.length - 1 ? 1.8 : gap),
    draw: (x, y) => {
      let cursor = x
      for (const tag of row) {
        panel(pdf, cursor, y, tag.width, height, tintRgb(color, 0.87), tintRgb(color, 0.58), 1.2)
        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(TYPE.label)
        setText(pdf, color)
        drawTrackedText(pdf, tag.label, cursor + 3, y + 3.9, 0.4)
        cursor += tag.width + gap
      }
    },
  }))
}

/* ------------------------------------------------------------------ *
 * Asset cards — infrastructure at risk
 * ------------------------------------------------------------------ */

export function assetCardBlocks(
  pdf: jsPDF,
  items: string[],
  width: number,
  colorHex: string,
): Block[] {
  const entries = items.map(cleanText).filter(Boolean)
  if (!entries.length) return []

  const color = hexToRgb(colorHex)
  const columns = width > 120 ? 3 : 2
  const gap = 2.6
  const cellWidth = (width - gap * (columns - 1)) / columns
  const blocks: Block[] = []

  for (let i = 0; i < entries.length; i += columns) {
    const row = entries.slice(i, i + columns)
    const wrapped = row.map(entry => wrapText(pdf, entry, cellWidth - 9, TYPE.small, 'bold'))
    const rowHeight = Math.max(...wrapped.map(l => l.length)) * lineHeight(TYPE.small, 1.3) + 5.6

    blocks.push({
      height: rowHeight + gap,
      draw: (x, y) => {
        row.forEach((_, ci) => {
          const cx = x + ci * (cellWidth + gap)
          panel(pdf, cx, y, cellWidth, rowHeight, tintRgb(color, 0.91), tintRgb(color, 0.6))
          setFill(pdf, color)
          pdf.roundedRect(cx + 3, y + rowHeight / 2 - 1.1, 2.2, 2.2, 1.1, 1.1, 'F')
          drawLines(pdf, wrapped[ci], cx + 7.6, y + 1.4, TYPE.small, INK, 'bold')
        })
      },
    })
  }

  return blocks
}

/* ------------------------------------------------------------------ *
 * Observation grid — only fields that carry data
 * ------------------------------------------------------------------ */

export function observationBlocks(
  pdf: jsPDF,
  facts: { label: string; value: string }[],
  width: number,
  colorHex: string,
): Block[] {
  const entries = facts
    .map(f => ({ label: cleanText(f.label), value: cleanText(f.value) }))
    .filter(f => f.value)
  if (!entries.length) return []

  const color = hexToRgb(colorHex)
  const columns = width > 120 ? 3 : 2
  const gap = 2.6
  const cellWidth = (width - gap * (columns - 1)) / columns
  const blocks: Block[] = []

  for (let i = 0; i < entries.length; i += columns) {
    const row = entries.slice(i, i + columns)
    const wrapped = row.map(entry => wrapText(pdf, entry.value, cellWidth - 6.5, TYPE.small))
    const rowHeight = Math.max(...wrapped.map(l => l.length)) * lineHeight(TYPE.small, 1.3) + 8.2

    blocks.push({
      height: rowHeight + gap,
      draw: (x, y) => {
        row.forEach((entry, ci) => {
          const cx = x + ci * (cellWidth + gap)
          panel(pdf, cx, y, cellWidth, rowHeight, tintRgb(color, 0.93), tintRgb(color, 0.62))
          pdf.setFont('helvetica', 'bold')
          pdf.setFontSize(TYPE.label)
          setText(pdf, color)
          drawTrackedText(pdf, entry.label.toUpperCase(), cx + 3.2, y + 4.6, 0.45)
          drawLines(pdf, wrapped[ci], cx + 3.2, y + 5.4, TYPE.small, INK)
        })
      },
    })
  }

  return blocks
}

/* ------------------------------------------------------------------ *
 * Numbered recommendation / action cards
 * ------------------------------------------------------------------ */

export function numberedCardBlocks(
  pdf: jsPDF,
  items: string[],
  width: number,
  colorHex: string,
  options: { start?: number; plain?: boolean } = {},
): Block[] {
  const entries = items.map(cleanText).filter(Boolean)
  if (!entries.length) return []

  const color = hexToRgb(colorHex)
  const size = TYPE.body
  const lh = lineHeight(size, 1.42)
  const textIndent = 11
  const start = options.start ?? 1

  return entries.map((entry, index) => {
    const lines = wrapText(pdf, entry, width - textIndent - 4, size)
    const height = Math.max(lines.length * lh + 3.6, 9)

    return {
      height: height + 1.8,
      draw: (x, y) => {
        if (!options.plain) {
          panel(pdf, x, y, width, height, tintRgb(color, 0.93), tintRgb(color, 0.66))
        }
        setFill(pdf, color)
        pdf.roundedRect(x + 2.6, y + 1.8, 6, 5.4, 1.1, 1.1, 'F')
        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(TYPE.label)
        setText(pdf, [255, 255, 255])
        const label = String(start + index).padStart(2, '0')
        pdf.text(label, x + 5.6 - pdf.getTextWidth(label) / 2, y + 5.5)
        drawLines(pdf, lines, x + textIndent, y + 1.6, size, INK)
      },
    }
  })
}

/* ------------------------------------------------------------------ *
 * Action timeline
 * ------------------------------------------------------------------ */

export interface TimelinePhase {
  label: string
  items: string[]
  color: string
}

export function timelineBlocks(pdf: jsPDF, phases: TimelinePhase[], width: number): Block[] {
  const active = phases
    .map(phase => ({ ...phase, items: phase.items.map(cleanText).filter(Boolean) }))
    .filter(phase => phase.items.length)
  if (!active.length) return []

  const railX = 3.4
  const textX = 10
  const size = TYPE.body
  const lh = lineHeight(size, 1.42)
  const blocks: Block[] = []

  active.forEach((phase, pi) => {
    const color = hexToRgb(phase.color)
    const wrapped = phase.items.map(item => wrapText(pdf, item, width - textX - 3, size))
    const itemsHeight = wrapped.reduce((total, lines) => total + lines.length * lh + 1.4, 0)
    const height = 6.4 + itemsHeight + (pi === active.length - 1 ? 1 : 3.4)
    const isLast = pi === active.length - 1

    blocks.push({
      height,
      draw: (x, y) => {
        // Connecting rail
        setStroke(pdf, tintRgb(color, 0.55))
        pdf.setLineWidth(0.6)
        pdf.line(x + railX, y + 4.4, x + railX, y + height - (isLast ? 2.4 : 0))

        setFill(pdf, color)
        pdf.circle(x + railX, y + 2.6, 2.1, 'F')
        setFill(pdf, [255, 255, 255])
        pdf.circle(x + railX, y + 2.6, 0.8, 'F')

        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(TYPE.label + 0.4)
        setText(pdf, color)
        drawTrackedText(pdf, phase.label.toUpperCase(), x + textX, y + 3.6, 0.7)

        let cursor = y + 5.6
        wrapped.forEach(lines => {
          setFill(pdf, tintRgb(color, 0.55))
          pdf.circle(x + textX + 1, cursor + lh * 0.74 - 1.1, 0.85, 'F')
          drawLines(pdf, lines, x + textX + 3.6, cursor, size, INK)
          cursor += lines.length * lh + 1.4
        })
      },
    })
  })

  return blocks
}

/* ------------------------------------------------------------------ *
 * Do / Do not — two columns, row-splittable
 * ------------------------------------------------------------------ */

function drawTick(pdf: jsPDF, x: number, y: number, color: RGB) {
  setStroke(pdf, color)
  pdf.setLineWidth(0.7)
  pdf.line(x, y + 1.1, x + 1.1, y + 2.2)
  pdf.line(x + 1.1, y + 2.2, x + 2.9, y - 0.3)
}

function drawCross(pdf: jsPDF, x: number, y: number, color: RGB) {
  setStroke(pdf, color)
  pdf.setLineWidth(0.7)
  pdf.line(x, y - 0.2, x + 2.6, y + 2.2)
  pdf.line(x + 2.6, y - 0.2, x, y + 2.2)
}

export function dualListBlocks(
  pdf: jsPDF,
  left: { title: string; items: string[]; color: string },
  right: { title: string; items: string[]; color: string },
  width: number,
): Block[] {
  const leftItems = left.items.map(cleanText).filter(Boolean)
  const rightItems = right.items.map(cleanText).filter(Boolean)
  if (!leftItems.length && !rightItems.length) return []

  const gap = 3.2
  const columnWidth = (width - gap) / 2
  const size = TYPE.small
  const lh = lineHeight(size, 1.38)
  const headerHeight = 8.4

  const columns = [
    { config: left, items: leftItems, tick: true, x: 0 },
    { config: right, items: rightItems, tick: false, x: columnWidth + gap },
  ].map(column => ({
    ...column,
    color: hexToRgb(column.config.color),
    wrapped: column.items.map(item => wrapText(pdf, item, columnWidth - 11, size)),
  }))

  /** Continuous column surfaces are built from flush segments so rows can paginate. */
  const surface = (
    column: (typeof columns)[number],
    x: number,
    y: number,
    height: number,
    cap: 'top' | 'middle' | 'bottom' | 'single',
  ) => {
    const fill = tintRgb(column.color, 0.92)
    const border = tintRgb(column.color, 0.6)
    const cx = x + column.x
    if (cap === 'single' || cap === 'top') {
      setFill(pdf, fill)
      pdf.roundedRect(cx, y, columnWidth, height, 1.8, 1.8, 'F')
      setFill(pdf, fill)
      pdf.rect(cx, y + height - 2, columnWidth, 2, 'F')
    } else if (cap === 'bottom') {
      setFill(pdf, fill)
      pdf.roundedRect(cx, y, columnWidth, height, 1.8, 1.8, 'F')
      setFill(pdf, fill)
      pdf.rect(cx, y, columnWidth, 2, 'F')
    } else {
      setFill(pdf, fill)
      pdf.rect(cx, y, columnWidth, height, 'F')
    }
    setStroke(pdf, border)
    pdf.setLineWidth(0.25)
    pdf.line(cx, y, cx, y + height)
    pdf.line(cx + columnWidth, y, cx + columnWidth, y + height)
    if (cap === 'top' || cap === 'single') pdf.line(cx + 1, y, cx + columnWidth - 1, y)
    if (cap === 'bottom' || cap === 'single') pdf.line(cx + 1, y + height, cx + columnWidth - 1, y + height)
  }

  const rowCount = Math.max(...columns.map(column => column.wrapped.length))
  const blocks: Block[] = []

  blocks.push({
    height: headerHeight,
    draw: (x, y) => {
      for (const column of columns) {
        if (!column.wrapped.length) continue
        surface(column, x, y, headerHeight, rowCount ? 'top' : 'single')
        setFill(pdf, column.color)
        pdf.rect(x + column.x + 1, y + 0.6, columnWidth - 2, 1.1, 'F')
        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(TYPE.label + 0.6)
        setText(pdf, column.color)
        drawTrackedText(pdf, column.config.title.toUpperCase(), x + column.x + 4, y + 6, 0.8)
      }
    },
  })

  for (let row = 0; row < rowCount; row += 1) {
    const heights = columns.map(column =>
      column.wrapped[row] ? column.wrapped[row].length * lh + 2 : 0)
    const rowHeight = Math.max(...heights)
    const isLast = row === rowCount - 1

    blocks.push({
      height: rowHeight + (isLast ? 2 : 0),
      draw: (x, y) => {
        for (const column of columns) {
          if (!column.wrapped.length) continue
          surface(column, x, y, rowHeight, isLast ? 'bottom' : 'middle')
          const lines = column.wrapped[row]
          if (!lines) continue
          const markY = y + lh * 0.74 - 1
          if (column.tick) drawTick(pdf, x + column.x + 4, markY, column.color)
          else drawCross(pdf, x + column.x + 4, markY, column.color)
          drawLines(pdf, lines, x + column.x + 9.4, y + 0.6, size, INK)
        }
      },
    })
  }

  return blocks
}

/* ------------------------------------------------------------------ *
 * Video briefing card with clickable link
 * ------------------------------------------------------------------ */

/**
 * Footage block: the still frame of the recorded damage or event plus a link out
 * to the source. A PDF cannot play video, so the frame carries a play marker and
 * the whole thumbnail is clickable.
 */
export function videoBlocks(
  pdf: jsPDF,
  video: { url: string; thumbnail: LoadedImage | null },
  width: number,
  colorHex: string,
): Block[] {
  const color = hexToRgb(colorHex)
  const url = video.url.trim()
  if (!url && !video.thumbnail) return []

  const blocks: Block[] = []
  const frameWidth = Math.min(width, 82)
  const frameHeight = frameWidth / 1.78

  if (video.thumbnail) {
    const thumbnail = video.thumbnail
    blocks.push({
      height: frameHeight + 2.6,
      draw: (x, y) => {
        drawFramedImage(pdf, thumbnail, x, y, frameWidth, frameHeight)

        const cx = x + frameWidth / 2
        const cy = y + frameHeight / 2
        setFill(pdf, [255, 255, 255])
        pdf.circle(cx, cy, 6.4, 'F')
        setFill(pdf, color)
        pdf.circle(cx, cy, 5.6, 'F')
        setFill(pdf, [255, 255, 255])
        pdf.triangle(cx - 1.9, cy - 2.8, cx - 1.9, cy + 2.8, cx + 2.8, cy, 'F')

        if (url) pdf.link(x, y, frameWidth, frameHeight, { url })
      },
    })
  }

  if (url) {
    const label = 'WATCH THE FOOTAGE'
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(TYPE.label)
    const ctaWidth = Math.min(width, trackedTextWidth(pdf, label, 0.7) + 15)

    blocks.push({
      height: 9.4,
      draw: (x, y) => {
        setFill(pdf, color)
        pdf.roundedRect(x, y, ctaWidth, 6.6, 1.5, 1.5, 'F')

        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(TYPE.label)
        setText(pdf, [255, 255, 255])
        drawTrackedText(pdf, label, x + 4.5, y + 4.4, 0.7)
        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(TYPE.label + 1.4)
        pdf.text('>', x + ctaWidth - 5.4, y + 4.5)

        pdf.link(x, y, ctaWidth, 6.6, { url })
      },
    })
  }

  return blocks
}

/* ------------------------------------------------------------------ *
 * Contact block — label/value rows where the data provides them
 * ------------------------------------------------------------------ */

export function contactBlocks(pdf: jsPDF, text: string, width: number, colorHex: string): Block[] {
  const value = cleanText(text)
  if (!value) return []

  const color = hexToRgb(colorHex)
  const rows = value
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const match = line.match(/^([A-Za-z][A-Za-z /&()-]{1,26}):\s*(.+)$/)
      return match ? { label: match[1].trim(), value: match[2].trim() } : { label: '', value: line }
    })

  const size = TYPE.small
  const lh = lineHeight(size, 1.4)
  const labelWidth = rows.some(r => r.label) ? 34 : 0

  return rows.map((row, i) => {
    const lines = wrapText(pdf, row.value, width - labelWidth - 8, size, row.label ? 'normal' : 'normal')
    const height = Math.max(lines.length * lh, 5) + 2.4

    return {
      height,
      draw: (x, y) => {
        if (i === 0) {
          setFill(pdf, color)
          pdf.roundedRect(x, y, 1.4, height - 1, 0.6, 0.6, 'F')
        }
        if (row.label) {
          pdf.setFont('helvetica', 'bold')
          pdf.setFontSize(TYPE.label)
          setText(pdf, color)
          drawTrackedText(pdf, row.label.toUpperCase(), x + 4.4, y + lh * 0.74, 0.45)
        }
        drawLines(pdf, lines, x + 4.4 + labelWidth, y - lh * 0.02, size, INK)
      },
    }
  })
}

/* ------------------------------------------------------------------ *
 * References — numbered, URL-safe
 * ------------------------------------------------------------------ */

export function referenceBlocks(pdf: jsPDF, text: string, width: number): Block[] {
  const value = cleanText(text)
  if (!value) return []

  const entries = value.split('\n').map(l => l.replace(/^\s*(?:\d+[.)]|-)\s*/, '').trim()).filter(Boolean)
  const size = TYPE.caption
  const lh = lineHeight(size, 1.45)
  const indent = 7

  return entries.map((entry, i) => {
    const lines = wrapText(pdf, entry, width - indent, size)
    return {
      height: lines.length * lh + 1.2,
      draw: (x, y) => {
        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(size)
        setText(pdf, MUTED)
        pdf.text(`${i + 1}.`, x, y + lh * 0.74)
        drawLines(pdf, lines, x + indent, y, size, MUTED)
      },
    }
  })
}

/* ------------------------------------------------------------------ *
 * Key takeaway banner
 * ------------------------------------------------------------------ */

export function bannerBlocks(
  pdf: jsPDF,
  label: string,
  text: string,
  width: number,
  palette: { header: RGB; accent: RGB; band: RGB },
): Block[] {
  const value = cleanText(text)
  if (!value) return []

  const size = TYPE.lead
  const lh = lineHeight(size, 1.42)
  const padX = 6
  const lines = wrapText(pdf, value, width - padX * 2, size)

  if (lines.length * lh > MAX_BLOCK_HEIGHT) {
    return calloutBlocks(pdf, value, width, '#071A33', { emphasis: true })
  }

  const height = lines.length * lh + 15

  return [{
    height: height + 2,
    draw: (x, y) => {
      gradientRect(pdf, x, y, width, height, palette.header, palette.accent)
      setFill(pdf, palette.band)
      pdf.rect(x, y, width, 1.3, 'F')
      pdf.rect(x, y + height - 0.7, width, 0.7, 'F')

      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(TYPE.label)
      setText(pdf, palette.band)
      drawTrackedText(pdf, label.toUpperCase(), x + padX, y + 7.4, 0.9)

      drawLines(pdf, lines, x + padX, y + 8.6, size, [255, 255, 255])
    },
  }]
}

/* ------------------------------------------------------------------ *
 * Images
 * ------------------------------------------------------------------ */

const IMAGE_RADIUS = 1.4

/**
 * Circular logo badge: a white plate with the mark contained inside it. Contain
 * (rather than crop) keeps wordmarks and seals whole, and a box of 1.4r always
 * fits within the circle.
 */
export function drawCircularLogo(
  pdf: jsPDF,
  image: LoadedImage,
  cx: number,
  cy: number,
  radius: number,
  ring: RGB,
) {
  setFill(pdf, [255, 255, 255])
  pdf.circle(cx, cy, radius, 'F')

  const box = radius * 1.4
  const size = fitContain(image, box, box)
  pdf.addImage(
    image.dataUrl,
    image.format,
    cx - size.width / 2,
    cy - size.height / 2,
    size.width,
    size.height,
    undefined,
    'FAST',
  )

  setStroke(pdf, ring)
  pdf.setLineWidth(0.5)
  pdf.circle(cx, cy, radius, 'S')
}

/** Cover dimensions: fills the frame completely, preserving aspect ratio. */
function fitCover(image: { width: number; height: number }, w: number, h: number) {
  const ratio = image.width / image.height
  let width = w
  let height = width / ratio
  if (height < h) {
    height = h
    width = height * ratio
  }
  return { width, height }
}

/**
 * Draws an image that exactly fills its frame. The overflow is removed with a
 * clipping path, so photographs never stretch and never leave side gutters.
 */
function drawFramedImage(
  pdf: jsPDF,
  image: LoadedImage,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  setFill(pdf, hexToRgb('#EEF3F8'))
  pdf.roundedRect(x, y, w, h, IMAGE_RADIUS, IMAGE_RADIUS, 'F')

  const canClip = typeof pdf.clip === 'function' && typeof pdf.discardPath === 'function'
  const placement = canClip ? fitCover(image, w, h) : fitContain(image, w, h)
  const ix = x + (w - placement.width) / 2
  const iy = y + (h - placement.height) / 2

  if (canClip) {
    pdf.saveGraphicsState()
    pdf.roundedRect(x, y, w, h, IMAGE_RADIUS, IMAGE_RADIUS, null as unknown as string)
    pdf.clip()
    pdf.discardPath()
    pdf.addImage(image.dataUrl, image.format, ix, iy, placement.width, placement.height, undefined, 'FAST')
    pdf.restoreGraphicsState()
  } else {
    pdf.addImage(image.dataUrl, image.format, ix, iy, placement.width, placement.height, undefined, 'FAST')
  }

  setStroke(pdf, HAIRLINE)
  pdf.setLineWidth(0.3)
  pdf.roundedRect(x, y, w, h, IMAGE_RADIUS, IMAGE_RADIUS, 'S')
}

function captionLines(pdf: jsPDF, label: string, caption: string, width: number): string[] {
  const text = cleanText(caption)
  return wrapText(pdf, text ? `${label} — ${text}` : label, width, TYPE.caption, 'italic')
}

export function imageBlocks(
  pdf: jsPDF,
  image: LoadedImage,
  caption: string,
  label: string,
  width: number,
  maxHeight: number,
): Block[] {
  // The frame follows the photograph's proportions but stays within a band, so a
  // hero image supports the advisory instead of dominating the page.
  const aspect = image.width / image.height
  const frameHeight = Math.min(maxHeight, Math.max(maxHeight * 0.6, width / aspect))
  const lines = captionLines(pdf, label, caption, width)
  const lh = lineHeight(TYPE.caption, 1.35)

  return [{
    height: frameHeight + lines.length * lh + 5,
    draw: (x, y) => {
      drawFramedImage(pdf, image, x, y, width, frameHeight)
      drawLines(pdf, lines, x, y + frameHeight + 1.4, TYPE.caption, MUTED, 'italic')
    },
  }]
}

/** Two-up image grid on a shared cell size so every figure aligns exactly. */
export function imageGridBlocks(
  pdf: jsPDF,
  images: { image: LoadedImage; caption: string; label: string }[],
  width: number,
): Block[] {
  if (!images.length) return []
  if (images.length === 1) {
    return imageBlocks(pdf, images[0].image, images[0].caption, images[0].label, width, 68)
  }

  const gap = 3.2
  const cellWidth = (width - gap) / 2
  const cellHeight = cellWidth / 1.7
  const lh = lineHeight(TYPE.caption, 1.35)
  const blocks: Block[] = []

  for (let i = 0; i < images.length; i += 2) {
    const row = images.slice(i, i + 2)
    const caps = row.map(item => captionLines(pdf, item.label, item.caption, cellWidth))
    const captionHeight = Math.max(...caps.map(c => c.length)) * lh
    const height = cellHeight + captionHeight + 3.4

    blocks.push({
      height: height + 1.6,
      draw: (x, y) => {
        row.forEach((item, ci) => {
          const cx = x + ci * (cellWidth + gap)
          drawFramedImage(pdf, item.image, cx, y, cellWidth, cellHeight)
          drawLines(pdf, caps[ci], cx, y + cellHeight + 1.2, TYPE.caption, MUTED, 'italic')
        })
      },
    })
  }

  return blocks
}
