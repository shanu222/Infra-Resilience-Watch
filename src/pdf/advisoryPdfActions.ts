import type { Advisory, AppSettings } from '../types'

/** jsPDF is loaded on demand so it stays out of the initial portal bundle. */
async function generate(advisory: Advisory, settings: AppSettings) {
  const { advisoryPdfFilename, buildAdvisoryPdfBlob } = await import('./advisoryPdf')
  const blob = await buildAdvisoryPdfBlob(advisory, settings)
  return { blob, filename: advisoryPdfFilename(advisory) }
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.rel = 'noopener'
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  // Give the browser time to start the download before revoking.
  window.setTimeout(() => URL.revokeObjectURL(url), 60000)
}

/**
 * Generate the advisory PDF, validate it, then download it.
 * Resolves with the filename only after the download has been triggered.
 */
export async function downloadAdvisoryPdf(
  advisory: Advisory,
  settings: AppSettings,
): Promise<string> {
  const { blob, filename } = await generate(advisory, settings)
  triggerDownload(blob, filename)
  return filename
}

/**
 * Print the generated PDF so print output is identical to the downloaded file.
 * Falls back to opening the PDF in a new tab when embedded printing is blocked.
 */
export async function printAdvisoryPdf(
  advisory: Advisory,
  settings: AppSettings,
): Promise<'printed' | 'opened'> {
  const { blob } = await generate(advisory, settings)
  const url = URL.createObjectURL(blob)

  const cleanup = (frame?: HTMLIFrameElement) => {
    window.setTimeout(() => {
      if (frame?.parentNode) frame.parentNode.removeChild(frame)
      URL.revokeObjectURL(url)
    }, 60000)
  }

  const printed = await new Promise<boolean>(resolve => {
    const frame = document.createElement('iframe')
    frame.setAttribute('aria-hidden', 'true')
    frame.title = 'Advisory print view'
    // Off-screen but full-size: PDF viewers refuse to initialize in a 1px frame.
    frame.style.cssText = 'position:fixed;left:-10000px;top:0;width:794px;height:1123px;border:0'

    let settled = false
    const settle = (ok: boolean) => {
      if (settled) return
      settled = true
      resolve(ok)
    }

    frame.onload = () => {
      try {
        const win = frame.contentWindow
        if (!win) {
          settle(false)
          return
        }
        win.focus()
        win.print()
        cleanup(frame)
        settle(true)
      } catch {
        cleanup(frame)
        settle(false)
      }
    }

    frame.onerror = () => {
      cleanup(frame)
      settle(false)
    }

    document.body.appendChild(frame)
    frame.src = url

    // Some browsers never fire load for PDF documents in iframes.
    window.setTimeout(() => settle(settled), 4000)
  })

  if (printed) return 'printed'

  const tab = window.open(url, '_blank')
  if (!tab) {
    URL.revokeObjectURL(url)
    throw new Error('Pop-up blocked. Allow pop-ups or use Download PDF.')
  }
  return 'opened'
}
