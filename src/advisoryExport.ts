import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

/** A4 width at 96 CSS px (210mm). */
export const A4_WIDTH_PX = 794
const A4_WIDTH_MM = 210
const A4_HEIGHT_MM = 297
const MAX_CANVAS_PX = 14000

function findAdvisoryDoc(): HTMLElement | null {
  return (
    document.querySelector('.advisory-publish-view .advisory-doc') ||
    document.querySelector('.advisory-preview-frame .advisory-doc') ||
    document.querySelector('.advisory-doc')
  )
}

function sanitizeFilename(name: string): string {
  const safe = name.replace(/[<>:"/\\|?*\n\r]/g, '').trim()
  return safe || 'infrastructure-advisory'
}

function waitForImages(root: HTMLElement): Promise<void> {
  const images = Array.from(root.querySelectorAll('img'))
  return Promise.all(
    images.map(img => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve()
      return new Promise<void>(resolve => {
        img.addEventListener('load', () => resolve(), { once: true })
        img.addEventListener('error', () => resolve(), { once: true })
        setTimeout(resolve, 10000)
      })
    }),
  ).then(() => undefined)
}

/** Rasterize remote images to data URLs so html2canvas never taints the canvas. */
async function rasterizeImages(root: HTMLElement): Promise<void> {
  const images = Array.from(root.querySelectorAll('img'))
  for (const img of images) {
    const src = img.currentSrc || img.src
    if (!src || src.startsWith('data:') || src.startsWith('blob:')) continue
    if (img.getAttribute('data-export-original-src')) continue

    const w = img.naturalWidth || img.width
    const h = img.naturalHeight || img.height
    if (!w || !h) continue

    try {
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) continue
      ctx.drawImage(img, 0, 0, w, h)
      img.setAttribute('data-export-original-src', src)
      img.src = canvas.toDataURL('image/png')
      if (img.closest('header')) {
        img.style.background = '#ffffff'
        img.style.padding = '4px'
      }
    } catch {
      try {
        const res = await fetch(src, { mode: 'cors', cache: 'force-cache' })
        if (!res.ok) continue
        const blob = await res.blob()
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = () => reject(new Error('read failed'))
          reader.readAsDataURL(blob)
        })
        img.setAttribute('data-export-original-src', src)
        img.src = dataUrl
      } catch {
        /* skip — html2canvas may still paint already-decoded pixels */
      }
    }
  }
}

function restoreRasterizedImages(root: HTMLElement): void {
  root.querySelectorAll('img[data-export-original-src]').forEach(node => {
    const img = node as HTMLImageElement
    const original = img.getAttribute('data-export-original-src')
    if (original) img.src = original
    img.removeAttribute('data-export-original-src')
  })
}

function computeScale(el: HTMLElement, preferred = 2): number {
  const h = el.scrollHeight || el.offsetHeight
  if (!h) return preferred
  return Math.min(preferred, MAX_CANVAS_PX / h)
}

function sliceCanvasToPdf(canvas: HTMLCanvasElement, filename: string) {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true })
  const pageWidthMm = A4_WIDTH_MM
  const pageHeightMm = A4_HEIGHT_MM
  const imgHeightMm = (canvas.height * pageWidthMm) / canvas.width
  const imgData = canvas.toDataURL('image/jpeg', 0.92)

  let offsetMm = 0
  let page = 0

  while (offsetMm < imgHeightMm) {
    if (page > 0) pdf.addPage()
    pdf.addImage(imgData, 'JPEG', 0, -offsetMm, pageWidthMm, imgHeightMm, undefined, 'FAST')
    offsetMm += pageHeightMm
    page += 1
  }

  pdf.save(`${sanitizeFilename(filename)}.pdf`)
}

async function captureElementToPdf(el: HTMLElement, filename: string): Promise<void> {
  const scale = computeScale(el)
  const rect = el.getBoundingClientRect()

  const canvas = await html2canvas(el, {
    scale,
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#ffffff',
    logging: false,
    imageTimeout: 20000,
    scrollX: 0,
    scrollY: -window.scrollY,
    width: Math.ceil(rect.width) || el.scrollWidth,
    height: Math.ceil(el.scrollHeight),
    windowWidth: document.documentElement.clientWidth,
    onclone: (_doc, clone) => {
      clone.querySelectorAll('.print-only').forEach(node => {
        const n = node as HTMLElement
        n.style.display = 'block'
      })
      clone.querySelectorAll('iframe').forEach(node => node.remove())
      const target = clone.classList.contains('advisory-doc')
        ? clone
        : (clone.querySelector('.advisory-doc') as HTMLElement | null)
      if (target) {
        target.style.maxWidth = 'none'
        target.style.width = `${el.scrollWidth}px`
        target.style.overflow = 'visible'
      }
    },
  })

  if (!canvas.width || !canvas.height) {
    throw new Error('PDF capture produced an empty image')
  }

  sliceCanvasToPdf(canvas, filename)
}

async function captureWithJsPdfHtml(el: HTMLElement, filename: string): Promise<boolean> {
  const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4', compress: true })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const margin = 8
  const contentWidth = pageWidth - margin * 2

  return new Promise<boolean>(resolve => {
    const timeout = window.setTimeout(() => resolve(false), 45000)

    const finish = (ok: boolean) => {
      window.clearTimeout(timeout)
      resolve(ok)
    }

    try {
      pdf.html(el, {
        margin: [margin, margin, margin, margin],
        x: margin,
        y: margin,
        width: contentWidth,
        windowWidth: el.scrollWidth || A4_WIDTH_PX,
        autoPaging: 'text',
        html2canvas: {
          scale: computeScale(el),
          useCORS: true,
          allowTaint: false,
          backgroundColor: '#ffffff',
          logging: false,
          imageTimeout: 20000,
          scrollX: 0,
          scrollY: -window.scrollY,
        },
        callback: doc => {
          try {
            doc.save(`${sanitizeFilename(filename)}.pdf`)
            finish(true)
          } catch {
            finish(false)
          }
        },
      })
    } catch {
      finish(false)
    }
  })
}

/** Download a structured PDF that matches the on-screen publish preview. */
export async function downloadAdvisoryPdf(filename = 'infrastructure-advisory') {
  const el = findAdvisoryDoc()
  if (!el) throw new Error('Advisory document not found')

  el.scrollIntoView({ block: 'start' })
  document.body.classList.add('advisory-capturing')

  try {
    await document.fonts?.ready
    await waitForImages(el)
    await rasterizeImages(el)
    await new Promise<void>(r => requestAnimationFrame(() => requestAnimationFrame(() => r())))

    const usedHtml = await captureWithJsPdfHtml(el, filename)
    if (!usedHtml) {
      await captureElementToPdf(el, filename)
    }
  } finally {
    restoreRasterizedImages(el)
    document.body.classList.remove('advisory-capturing')
  }
}

/** Print the same publish-view document (not a separate clone). */
export async function printAdvisoryDocument(title = 'Infrastructure Advisory') {
  const el = findAdvisoryDoc()
  if (!el) throw new Error('Advisory document not found')

  el.scrollIntoView({ block: 'start' })
  await document.fonts?.ready
  await waitForImages(el)

  const prevTitle = document.title
  const safeTitle = title.replace(/[<>]/g, '').trim() || 'Infrastructure Advisory'
  document.title = safeTitle
  document.body.classList.add('advisory-printing')

  let finished = false
  const done = () => {
    if (finished) return
    finished = true
    document.body.classList.remove('advisory-printing')
    document.title = prevTitle
  }

  const fallback = window.setTimeout(done, 60000)
  window.addEventListener(
    'afterprint',
    () => {
      window.clearTimeout(fallback)
      done()
    },
    { once: true },
  )

  requestAnimationFrame(() => {
    requestAnimationFrame(() => window.print())
  })
}
