import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

/** A4 width at 96 CSS px (210mm). */
export const A4_WIDTH_PX = 794
const A4_WIDTH_MM = 210
const A4_HEIGHT_MM = 297
const STAGE_ID = 'advisory-export-stage'

function findAdvisoryDoc(): HTMLElement | null {
  return (
    document.querySelector('.advisory-preview-frame .advisory-doc') ||
    document.querySelector('.advisory-doc')
  )
}

function waitForImages(root: HTMLElement): Promise<void> {
  const images = Array.from(root.querySelectorAll('img'))
  return Promise.all(
    images.map(img => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve()
      return new Promise<void>(resolve => {
        img.addEventListener('load', () => resolve(), { once: true })
        img.addEventListener('error', () => resolve(), { once: true })
        setTimeout(resolve, 8000)
      })
    }),
  ).then(() => undefined)
}

function prepareClone(source: HTMLElement): HTMLElement {
  const clone = source.cloneNode(true) as HTMLElement
  clone.classList.add('advisory-doc-export')

  clone.querySelectorAll('iframe').forEach(node => node.remove())

  clone.querySelectorAll('img').forEach(img => {
    if (img.src.startsWith('http')) {
      img.crossOrigin = 'anonymous'
    }
    if (img.closest('header')) {
      img.style.background = '#ffffff'
      img.style.padding = '4px'
      img.style.borderRadius = '4px'
    }
  })

  clone.querySelectorAll('.print-only').forEach(el => {
    el.classList.remove('hidden')
    ;(el as HTMLElement).style.display = 'block'
  })

  return clone
}

async function mountExportStage(): Promise<{ stage: HTMLElement; docRoot: HTMLElement; cleanup: () => void }> {
  const existing = document.getElementById(STAGE_ID)
  if (existing) existing.remove()

  const source = findAdvisoryDoc()
  if (!source) throw new Error('Advisory document not found')

  const stage = document.createElement('div')
  stage.id = STAGE_ID
  stage.className = 'advisory-export-stage'
  stage.setAttribute('aria-hidden', 'true')

  const frame = document.createElement('div')
  frame.className = 'advisory-export-frame'

  const docRoot = prepareClone(source)
  frame.appendChild(docRoot)
  stage.appendChild(frame)
  document.body.appendChild(stage)

  await waitForImages(docRoot)
  if (document.fonts?.ready) {
    await document.fonts.ready
  }

  // Layout pass at fixed A4 width before capture / print.
  await new Promise<void>(r => requestAnimationFrame(() => requestAnimationFrame(() => r())))

  return {
    stage,
    docRoot,
    cleanup: () => stage.remove(),
  }
}

function sliceCanvasToPdf(canvas: HTMLCanvasElement, filename: string) {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true })
  const imgWidthMm = A4_WIDTH_MM
  const pageHeightMm = A4_HEIGHT_MM
  const imgHeightMm = (canvas.height * imgWidthMm) / canvas.width
  const imgData = canvas.toDataURL('image/jpeg', 0.92)

  let offsetMm = 0
  let page = 0

  while (offsetMm < imgHeightMm) {
    if (page > 0) pdf.addPage()
    pdf.addImage(imgData, 'JPEG', 0, -offsetMm, imgWidthMm, imgHeightMm, undefined, 'FAST')
    offsetMm += pageHeightMm
    page += 1
  }

  const safeName = filename.replace(/[<>:"/\\|?*\n\r]/g, '').trim() || 'infrastructure-advisory'
  pdf.save(`${safeName}.pdf`)
}

/** Generate and download a real PDF file (A4, matches publish-view styling). */
export async function downloadAdvisoryPdf(filename = 'infrastructure-advisory') {
  const { docRoot, cleanup } = await mountExportStage()
  try {
    const canvas = await html2canvas(docRoot, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: A4_WIDTH_PX,
      windowWidth: A4_WIDTH_PX,
      scrollX: 0,
      scrollY: 0,
    })
    sliceCanvasToPdf(canvas, filename)
  } finally {
    cleanup()
  }
}

/** Print using the same A4 export layout as PDF download. */
export async function printAdvisoryDocument(title = 'Infrastructure Advisory') {
  const { cleanup } = await mountExportStage()
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
    cleanup()
  }

  const fallback = window.setTimeout(done, 30000)
  window.addEventListener('afterprint', () => {
    window.clearTimeout(fallback)
    done()
  }, { once: true })

  requestAnimationFrame(() => {
    requestAnimationFrame(() => window.print())
  })
}
