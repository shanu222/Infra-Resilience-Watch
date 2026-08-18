import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react'
import type { Advisory } from '../types'
import { useApp } from '../contexts/AppContext'

/**
 * Renders the real generated PDF so an administrator reviews the exact file that
 * will be downloaded, not an HTML approximation of it.
 */
export default function PdfDocumentPreview({ advisory }: { advisory: Advisory }) {
  const { settings } = useApp()
  const [url, setUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [nonce, setNonce] = useState(0)
  const currentUrl = useRef<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    ;(async () => {
      try {
        const { buildAdvisoryPdfBlob } = await import('../pdf/advisoryPdf')
        const blob = await buildAdvisoryPdfBlob(advisory, settings)
        if (cancelled) return
        const next = URL.createObjectURL(blob)
        if (currentUrl.current) URL.revokeObjectURL(currentUrl.current)
        currentUrl.current = next
        setUrl(next)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not render the PDF preview')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
    // Regenerating on every keystroke would be wasteful, so the preview refreshes
    // when the reviewer asks for it or the advisory identity changes.
  }, [advisory.id, advisory.updatedAt, nonce, settings])

  useEffect(() => () => {
    if (currentUrl.current) URL.revokeObjectURL(currentUrl.current)
  }, [])

  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Exact PDF output
        </span>
        <button
          type="button"
          onClick={() => setNonce(n => n + 1)}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
          {loading ? 'Rendering' : 'Refresh preview'}
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl px-4 py-3 mb-3 text-sm bg-rose-50 border border-rose-200 text-rose-700">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <span className="min-w-0 break-words">{error}</span>
        </div>
      )}

      {url && !error && (
        <iframe
          src={`${url}#view=FitH`}
          title="Advisory PDF preview"
          className="w-full rounded-xl border border-slate-200 bg-slate-100"
          style={{ height: 'min(80vh, 1120px)' }}
        />
      )}

      {!url && !error && (
        <div
          className="w-full rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center text-sm text-slate-500"
          style={{ height: 'min(60vh, 720px)' }}
        >
          <Loader2 size={18} className="animate-spin mr-2" /> Building the document…
        </div>
      )}
    </div>
  )
}
