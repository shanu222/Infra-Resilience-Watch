import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, CheckCircle2, Download, Loader2, Printer, RefreshCw } from 'lucide-react'
import type { Advisory } from '../types'
import { useApp } from '../contexts/AppContext'
import { downloadAdvisoryPdf, printAdvisoryPdf } from '../pdf/advisoryPdfActions'

type PdfState = 'idle' | 'working' | 'done' | 'error'

interface Props {
  advisory: Advisory
  compact?: boolean
}

function messageFor(error: unknown): string {
  if (error instanceof Error && error.message) return error.message
  return 'PDF generation failed. Please try again.'
}

export default function DocumentActions({ advisory, compact = false }: Props) {
  const { settings } = useApp()
  const [pdfState, setPdfState] = useState<PdfState>('idle')
  const [printState, setPrintState] = useState<PdfState>('idle')
  const [error, setError] = useState<string | null>(null)
  const resetTimer = useRef<number | null>(null)

  useEffect(() => () => {
    if (resetTimer.current) window.clearTimeout(resetTimer.current)
  }, [])

  const busy = pdfState === 'working' || printState === 'working'

  function scheduleReset(setter: (s: PdfState) => void) {
    if (resetTimer.current) window.clearTimeout(resetTimer.current)
    resetTimer.current = window.setTimeout(() => setter('idle'), 4000)
  }

  async function handleDownload() {
    if (busy) return
    setError(null)
    setPdfState('working')
    try {
      await downloadAdvisoryPdf(advisory, settings)
      setPdfState('done')
      scheduleReset(setPdfState)
    } catch (err) {
      setPdfState('error')
      setError(messageFor(err))
    }
  }

  async function handlePrint() {
    if (busy) return
    setError(null)
    setPrintState('working')
    try {
      await printAdvisoryPdf(advisory, settings)
      setPrintState('done')
      scheduleReset(setPrintState)
    } catch (err) {
      setPrintState('error')
      setError(messageFor(err))
    }
  }

  const pdfLabel =
    pdfState === 'working' ? 'Generating PDF…'
      : pdfState === 'done' ? 'Downloaded'
        : pdfState === 'error' ? 'Retry PDF'
          : 'Download PDF'

  const pdfIcon =
    pdfState === 'working' ? <Loader2 size={14} className="animate-spin" />
      : pdfState === 'done' ? <CheckCircle2 size={14} />
        : pdfState === 'error' ? <RefreshCw size={14} />
          : <Download size={14} />

  if (compact) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handlePrint}
            disabled={busy}
            className="flex items-center gap-1.5 text-slate-700 hover:text-slate-900 font-medium disabled:opacity-60"
          >
            {printState === 'working' ? <Loader2 size={12} className="animate-spin" /> : <Printer size={12} />}
            {printState === 'working' ? 'Preparing…' : 'Print'}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={busy}
            className="flex items-center gap-1.5 text-blue-700 hover:text-blue-800 font-medium disabled:opacity-60"
          >
            {pdfState === 'working' ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
            {pdfLabel}
          </button>
        </div>
        {error && <p className="text-xs text-red-700">{error}</p>}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 w-full sm:w-auto">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={handlePrint}
          disabled={busy}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-all flex-1 sm:flex-none min-w-[4.5rem] disabled:opacity-60"
        >
          {printState === 'working' ? <Loader2 size={14} className="animate-spin" /> : <Printer size={14} />}
          <span className="hidden sm:inline">{printState === 'working' ? 'Preparing…' : 'Print'}</span>
        </button>
        <button
          type="button"
          onClick={handleDownload}
          disabled={busy}
          aria-live="polite"
          className={`btn-3d ${pdfState === 'error' ? 'btn-3d-red' : 'btn-3d-primary'} flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm flex-1 sm:flex-none min-w-[4.5rem] disabled:opacity-70`}
        >
          {pdfIcon}
          <span className="hidden sm:inline">{pdfLabel}</span>
          <span className="sm:hidden">{pdfState === 'working' ? '…' : 'PDF'}</span>
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 px-3 py-2 rounded-xl text-xs text-red-800"
          style={{ background: 'rgba(254,226,226,0.95)', border: '1px solid #fca5a5' }}
        >
          <AlertTriangle size={14} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
