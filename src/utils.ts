import type { Advisory, ContentFilters, ContentKind } from './types'

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatDateLong(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function excerpt(text: string, n = 140): string {
  if (!text) return ''
  const clean = text.replace(/\s+/g, ' ').trim()
  return clean.length > n ? `${clean.slice(0, n).trim()}...` : clean
}

export function locationLabel(item: Pick<Advisory, 'district' | 'province' | 'specificLocation'>): string {
  return [item.specificLocation, item.district, item.province].filter(Boolean).join(', ') || 'Pakistan'
}

export function startOfLocalDay(value: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split('-').map(Number)
    return new Date(y, m - 1, d, 0, 0, 0, 0)
  }
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed
}

export function endOfLocalDay(value: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split('-').map(Number)
    return new Date(y, m - 1, d, 23, 59, 59, 999)
  }
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed
}

export function isFutureDate(value: string | null | undefined): boolean {
  if (!value) return false
  return startOfLocalDay(value) > new Date()
}

export function isContentLive(a: Advisory): boolean {
  const now = new Date()
  if (a.status !== 'Published') return false
  if (a.publishDate && startOfLocalDay(a.publishDate) > now) return false
  if (a.expiryDate && endOfLocalDay(a.expiryDate) < now) return false
  return true
}

export function sortNewest(items: Advisory[]): Advisory[] {
  return [...items].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1
    const da = new Date(a.publishedAt || a.createdAt).getTime()
    const db = new Date(b.publishedAt || b.createdAt).getTime()
    return db - da
  })
}

export function filterContent(items: Advisory[], f: ContentFilters): Advisory[] {
  const q = f.keyword.trim().toLowerCase()
  return items.filter(a => {
    if (f.hazard && a.hazard !== f.hazard) return false
    if (f.province && a.province !== f.province && a.province !== 'National') return false
    if (f.district && a.district !== f.district) return false
    if (f.infrastructureType && !a.infrastructureTypes.includes(f.infrastructureType)) return false
    if (f.issueType && a.issueType !== f.issueType) return false
    if (q) {
      const hay = [
        a.title, a.shortSummary, a.currentSituation, a.observedConditions,
        a.province, a.district, a.specificLocation, a.hazard, a.kind,
        a.issueType, a.type, a.keyTakeaway, a.risks, ...a.infrastructureTypes,
      ].join(' ').toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })
}

export const EMPTY_FILTERS: ContentFilters = {
  hazard: '',
  province: '',
  district: '',
  infrastructureType: '',
  issueType: '',
  keyword: '',
}

export function hasActiveFilters(f: ContentFilters): boolean {
  return Boolean(f.hazard || f.province || f.district || f.infrastructureType || f.issueType || f.keyword.trim())
}

export function getVideoEmbedUrl(url: string): string | null {
  if (!url) return null
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{6,})/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`
  return null
}

export function relatedItems(all: Advisory[], current: Advisory, limit = 3): Advisory[] {
  return all
    .filter(a => a.id !== current.id)
    .map(a => {
      let score = 0
      if (a.hazard === current.hazard) score += 3
      if (a.province && a.province === current.province) score += 2
      if (a.district && a.district === current.district) score += 2
      if (a.kind === current.kind) score += 1
      if (current.infrastructureTypes.some(t => a.infrastructureTypes.includes(t))) score += 2
      return { a, score }
    })
    .filter(x => x.score > 0)
    .sort((x, y) => y.score - x.score)
    .slice(0, limit)
    .map(x => x.a)
}

export function userPathFor(item: Pick<Advisory, 'id' | 'kind'>): string {
  return `/content/${item.id}`
}

/** Strip portal / deployment URLs from document text so they never appear in PDFs. */
export function sanitizeDocText(text: string): string {
  if (!text) return ''
  const portalUrlPattern = /https?:\/\/[^\s]*(?:vercel\.app|localhost|\/content\/)[^\s]*/gi
  return text
    .split('\n')
    .map(line => line.replace(portalUrlPattern, '').trimEnd())
    .filter((line, i, arr) => line !== '' || (i > 0 && arr[i - 1] !== ''))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/**
 * Print / save as PDF using the live publish-view DOM so layout, colors,
 * and typography match the on-screen document (iframe cloning dropped Tailwind).
 */
export function printAdvisoryDocument(_rootSelector = '.advisory-preview-frame', title = 'Infrastructure Advisory') {
  const prevTitle = document.title
  const safeTitle = title.replace(/[<>]/g, '').trim() || 'Infrastructure Advisory'
  document.title = safeTitle
  document.body.classList.add('printing-advisory-active')

  const cleanup = () => {
    document.body.classList.remove('printing-advisory-active')
    document.title = prevTitle
  }

  window.addEventListener('afterprint', cleanup, { once: true })
  const fallbackTimer = window.setTimeout(cleanup, 15000)
  window.addEventListener(
    'afterprint',
    () => window.clearTimeout(fallbackTimer),
    { once: true },
  )

  // Let print class apply before the browser snapshots layout.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.print()
    })
  })
}

export function kindToSection(kind: ContentKind): string {
  if (kind === 'case-study') return 'case-studies'
  if (kind === 'observation') return 'issues'
  return `${kind}s`
}
