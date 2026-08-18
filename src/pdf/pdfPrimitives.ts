import type { jsPDF } from 'jspdf'

export const PAGE = { width: 210, height: 297 }
export const MARGIN = { top: 16, bottom: 18, left: 16, right: 16 }
export const CONTENT_WIDTH = PAGE.width - MARGIN.left - MARGIN.right

/** pt -> mm, multiplied by a comfortable line-height factor. */
export function lineHeight(fontSize: number, factor = 1.35): number {
  return fontSize * 0.3528 * factor
}

export type RGB = [number, number, number]

export function hexToRgb(hex: string): RGB {
  const clean = hex.replace('#', '').trim()
  const full = clean.length === 3
    ? clean.split('').map(c => c + c).join('')
    : clean.slice(0, 6)
  const num = Number.parseInt(full, 16)
  if (Number.isNaN(num)) return [0, 0, 0]
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255]
}

export function mixRgb(a: RGB, b: RGB, t: number): RGB {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ]
}

export function tintRgb(color: RGB, t: number): RGB {
  return mixRgb(color, [255, 255, 255], t)
}

/** Approximate a linear gradient with thin horizontal/vertical bands. */
export function gradientRect(
  pdf: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  from: RGB,
  to: RGB,
  direction: 'horizontal' | 'vertical' = 'horizontal',
) {
  const steps = Math.max(24, Math.min(140, Math.round((direction === 'horizontal' ? w : h) * 3)))
  const span = direction === 'horizontal' ? w : h
  const size = span / steps
  for (let i = 0; i < steps; i += 1) {
    const c = mixRgb(from, to, i / (steps - 1))
    pdf.setFillColor(c[0], c[1], c[2])
    if (direction === 'horizontal') {
      // Slight overlap avoids hairline seams in some PDF viewers.
      pdf.rect(x + i * size, y, size + 0.12, h, 'F')
    } else {
      pdf.rect(x, y + i * size, w, size + 0.12, 'F')
    }
  }
}

export function setFill(pdf: jsPDF, color: RGB) {
  pdf.setFillColor(color[0], color[1], color[2])
}

export function setStroke(pdf: jsPDF, color: RGB) {
  pdf.setDrawColor(color[0], color[1], color[2])
}

export function setText(pdf: jsPDF, color: RGB) {
  pdf.setTextColor(color[0], color[1], color[2])
}

/** Uppercase label with manual letter spacing (jsPDF has no tracking option). */
export function drawTrackedText(
  pdf: jsPDF,
  text: string,
  x: number,
  y: number,
  tracking = 0.6,
): number {
  let cursor = x
  for (const char of text) {
    pdf.text(char, cursor, y)
    cursor += pdf.getTextWidth(char) + tracking
  }
  return cursor - x
}

export function trackedTextWidth(pdf: jsPDF, text: string, tracking = 0.6): number {
  let width = 0
  for (const char of text) width += pdf.getTextWidth(char) + tracking
  return width - (text.length ? tracking : 0)
}

/** Collapse whitespace and strip characters the standard PDF fonts cannot encode. */
export function cleanText(value: string | null | undefined): string {
  if (!value) return ''
  return value
    .replace(/\r\n?/g, '\n')
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2022/g, '-')
    .replace(/\u00A0/g, ' ')
    .replace(/[\u2026]/g, '...')
    .replace(/[^\x09\x0A\x20-\x7E\u00A1-\u00FF]/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function sanitizeFilename(value: string): string {
  return value
    .replace(/[/\\:*?"<>|]/g, '')
    .replace(/[\u0000-\u001F]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '')
    .slice(0, 90)
}
