import { useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Download, Printer, Share2, ArrowLeft, Shield, Clock, Eye } from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import AdvisoryDocument from '../components/AdvisoryDocument'
import SeverityBadge from '../components/SeverityBadge'
import WatchCard from '../components/WatchCard'
import { relatedItems, userPathFor, isContentLive } from '../utils'
import { BRAND } from '../data/constants'

export default function AdvisoryDetail() {
  const { id } = useParams<{ id: string }>()
  const { advisories, incrementViewCount, isAuthenticated } = useApp()
  const navigate = useNavigate()
  const location = useLocation()

  const live = advisories.find(a => a.id === id && isContentLive(a))
  const advisory = live || (isAuthenticated ? advisories.find(a => a.id === id) : undefined)
  const published = advisories.filter(isContentLive)

  useEffect(() => {
    if (advisory && advisory.status === 'Published') {
      incrementViewCount(advisory.id)
    }
  }, [advisory?.id])

  const inUserPortal = !location.pathname.startsWith('/admin')

  if (!advisory) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-16 px-4">
        <div className="glass-panel rounded-2xl p-8 text-center max-w-md w-full">
          <Shield size={48} className="mx-auto mb-4 text-slate-400" />
          <h1 className="text-xl font-bold text-slate-700 mb-2">Content Not Found</h1>
          <p className="text-slate-500 text-sm mb-6">This item may have expired, been archived, or the link may be incorrect.</p>
          <button type="button" onClick={() => navigate('/')} className="btn-3d btn-3d-primary px-5 py-2.5 rounded-xl text-sm">
            Back to User Portal
          </button>
        </div>
      </div>
    )
  }

  function handlePrint() {
    window.print()
  }

  function handleShare() {
    const url = window.location.href
    if (navigator.share) {
      navigator.share({ title: advisory!.title, url })
    } else {
      navigator.clipboard.writeText(url).then(() => {
        alert('Link copied to clipboard')
      })
    }
  }

  const related = relatedItems(published, advisory, 3)

  function goBack() {
    if (advisory!.status !== 'Published') navigate('/admin/advisories')
    else navigate('/')
  }

  return (
    <div className="min-h-screen">
      <div className={`no-print glass-toolbar ${inUserPortal ? '' : 'sticky top-0 z-20'}`}>
        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3">
          <div className="flex items-center gap-2 min-w-0 mb-2 sm:mb-0">
            <button
              type="button"
              onClick={goBack}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-sm transition-all shrink-0"
            >
              <ArrowLeft size={14} />
              Back
            </button>
            <div className="flex-1 min-w-0 hidden sm:block">
              <div className="text-sm font-medium text-slate-700 truncate">{advisory.title}</div>
            </div>
            <div className="hidden sm:block shrink-0">
              <SeverityBadge severity={advisory.severity} size="sm" />
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="sm:hidden shrink-0">
              <SeverityBadge severity={advisory.severity} size="sm" />
            </div>
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-all flex-1 sm:flex-none min-w-[4.5rem]"
            >
              <Share2 size={14} />
              <span className="hidden sm:inline">Share</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-all flex-1 sm:flex-none min-w-[4.5rem]"
            >
              <Printer size={14} />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="btn-3d btn-3d-primary flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm flex-1 sm:flex-none min-w-[4.5rem]"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Download PDF</span>
              <span className="sm:hidden">PDF</span>
            </button>
          </div>
        </div>
      </div>

      {advisory.status !== 'Published' && (
        <div className="no-print max-w-5xl mx-auto px-4 pt-4">
          <div className="px-4 py-3 rounded-xl text-sm text-amber-800 flex items-center gap-2" style={{ background: 'rgba(254,243,199,0.92)', border: '1px solid #fcd34d' }}>
            <Eye size={15} />
            <strong>Admin Preview:</strong> This item is in <strong>{advisory.status}</strong> status and is not visible to the public.
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-2 sm:px-4 py-4 sm:py-6 min-w-0">
        <div className="advisory-preview-frame rounded-xl sm:rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="advisory-preview-inner">
            <AdvisoryDocument advisory={advisory} />
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="no-print max-w-5xl mx-auto px-4 pb-6">
          <h2 className="text-lg font-bold user-ink mb-4" style={{ fontFamily: 'DM Serif Display, serif' }}>Related content</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {related.map(item => (
              <WatchCard key={item.id} item={item} onOpen={() => navigate(userPathFor(item))} />
            ))}
          </div>
        </div>
      )}

      <div className="no-print max-w-5xl mx-auto px-4 pb-8">
        <div className="glass-panel rounded-2xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
            <div className="flex flex-wrap gap-4">
              <span className="flex items-center gap-1.5">
                <Shield size={12} />
                {BRAND.shortName}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={12} />
                Published: {advisory.publishedAt ? new Date(advisory.publishedAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Not published'}
              </span>
              {advisory.expiryDate && (
                <span className="text-amber-700 flex items-center gap-1.5">
                  Expires: {new Date(advisory.expiryDate).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={handleShare} className="flex items-center gap-1.5 text-blue-700 hover:text-blue-800 font-medium">
                <Share2 size={12} /> Share
              </button>
              <button type="button" onClick={handlePrint} className="flex items-center gap-1.5 text-slate-700 hover:text-slate-800 font-medium">
                <Printer size={12} /> Print
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
