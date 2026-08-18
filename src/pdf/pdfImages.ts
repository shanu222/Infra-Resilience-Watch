export interface LoadedImage {
  dataUrl: string
  format: 'PNG' | 'JPEG'
  width: number
  height: number
}

const MAX_EDGE = 1600

function loadHtmlImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    if (!src.startsWith('data:') && !src.startsWith('blob:')) {
      img.crossOrigin = 'anonymous'
    }
    const timer = window.setTimeout(() => reject(new Error('Image load timeout')), 20000)
    img.onload = () => {
      window.clearTimeout(timer)
      resolve(img)
    }
    img.onerror = () => {
      window.clearTimeout(timer)
      reject(new Error('Image failed to load'))
    }
    img.src = src
  })
}

async function fetchAsDataUrl(src: string): Promise<string> {
  const res = await fetch(src, { mode: 'cors', cache: 'force-cache' })
  if (!res.ok) throw new Error(`Image request failed (${res.status})`)
  const blob = await res.blob()
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Image could not be read'))
    reader.readAsDataURL(blob)
  })
}

function rasterize(img: HTMLImageElement, preferPng: boolean): LoadedImage {
  const naturalW = img.naturalWidth || img.width
  const naturalH = img.naturalHeight || img.height
  if (!naturalW || !naturalH) throw new Error('Image has no dimensions')

  const scale = Math.min(1, MAX_EDGE / Math.max(naturalW, naturalH))
  const w = Math.max(1, Math.round(naturalW * scale))
  const h = Math.max(1, Math.round(naturalH * scale))

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas unavailable')

  if (!preferPng) {
    // Flatten transparency for photos so JPEG never renders black.
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, w, h)
  }
  ctx.drawImage(img, 0, 0, w, h)

  const format: 'PNG' | 'JPEG' = preferPng ? 'PNG' : 'JPEG'
  const dataUrl = preferPng
    ? canvas.toDataURL('image/png')
    : canvas.toDataURL('image/jpeg', 0.85)

  if (!dataUrl.startsWith('data:image/')) throw new Error('Image encoding failed')

  return { dataUrl, format, width: w, height: h }
}

/**
 * Normalize any image source (data URL, blob, Supabase/remote URL) into an
 * embeddable PNG/JPEG data URL with known dimensions. Returns null on failure so
 * optional imagery never corrupts the PDF.
 */
export async function loadImageForPdf(
  src: string | undefined | null,
  options: { preferPng?: boolean } = {},
): Promise<LoadedImage | null> {
  if (!src) return null
  const preferPng = options.preferPng ?? false

  try {
    const img = await loadHtmlImage(src)
    try {
      return rasterize(img, preferPng)
    } catch {
      // Canvas tainted (remote image without CORS headers) — refetch as data URL.
      const dataUrl = await fetchAsDataUrl(src)
      const safeImg = await loadHtmlImage(dataUrl)
      return rasterize(safeImg, preferPng)
    }
  } catch {
    try {
      const dataUrl = await fetchAsDataUrl(src)
      const safeImg = await loadHtmlImage(dataUrl)
      return rasterize(safeImg, preferPng)
    } catch {
      return null
    }
  }
}

/** Fit dimensions inside a box while preserving aspect ratio. */
export function fitContain(
  image: { width: number; height: number },
  maxWidth: number,
  maxHeight: number,
): { width: number; height: number } {
  const ratio = image.width / image.height
  let w = maxWidth
  let h = w / ratio
  if (h > maxHeight) {
    h = maxHeight
    w = h * ratio
  }
  return { width: w, height: h }
}
