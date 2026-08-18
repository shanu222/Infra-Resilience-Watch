import { useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Download, Printer, Share2, ArrowLeft, Shield, Clock, Eye } from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import AdvisoryDocument from '../components/AdvisoryDocument'
import SeverityBadge from '../components/SeverityBadge'
import WatchCard from '../components/WatchCard'
import { relatedItems, userPathFor } from '../utils'
import { BRAND } from '../data/constants'

export default function AdvisoryDetail() {
  const { id } = useParams<{ id: string }>()
  const { getPublishedAdvisories, advisories, incrementViewCount, isAuthenticated } = useApp()
  const navigate = useNavigate()
  const location = useLocation()

  const published = getPublishedAdvisories()
  const advisory = published.find(a => a.id === id)
    || (isAuthenticated ? advisories.find(a => a.id === id) : undefined)

  useEffect(() => {
    if (advisory && advisory.status === 'Published') {
      incrementViewCount(advisory.id)
    }
  }, [advisory?.id])

  const inUserPortal = location.pathname.startsWith('/user')

  if (!advisory) {
    return (
      <div className="min-h-screen flex items-center justify-center py-16" style={{ background: '#f8fafc' }}>
        <div className="text-center">
          <Shield size={48} className="mx-auto mb-4 text-slate-300" />
          <h1 className="text-xl font-bold text-slate-600 mb-2">Content Not Found</h1>
          <p className="text-slate-400 text-sm mb-6">This item may have expired, been archived, or the link may be incorrect.</p>
          <button type="button" onClick={() => navigate('/user')} className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold" style={{ background: '#1D4ED8' }}>
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
    if (advisory.status !== 'Published') navigate('/admin/advisories')
    else if (inUserPortal) navigate('/user')
    else navigate('/user')
  }

  return (
    <div className="min-h-screen" style={{ background: inUserPortal ? 'transparent' : '#f1f5f9' }}>
      <div className={`no-print bg-white border-b border-slate-100 ${inUserPortal ? '' : 'sticky top-0 z-20 shadow-sm'}`}>
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={goBack}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-sm transition-all"
          >
            <ArrowLeft size={14} />
            Back
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-slate-700 truncate hidden sm:block">{advisory.title}</div>
          </div>
          <div className="flex items-center gap-2">
            <SeverityBadge severity={advisory.severity} size="sm" />
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-all"
            >
              <Share2 size={14} />
              <span className="hidden sm:inline">Share</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-all"
            >
              <Printer size={14} />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #1D4ED8, #06B6D4)' }}
            >
              <Download size={14} />
              <span className="hidden sm:inline">Download PDF</span>
            </button>
          </div>
        </div>
      </div>

      {advisory.status !== 'Published' && (
        <div className="no-print max-w-5xl mx-auto px-4 pt-4">
          <div className="px-4 py-3 rounded-xl text-sm text-amber-800 flex items-center gap-2" style={{ background: '#fef3c7', border: '1px solid #fcd34d' }}>
            <Eye size={15} />
            <strong>Admin Preview:</strong> This item is in <strong>{advisory.status}</strong> status and is not visible to the public.
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200">
          <AdvisoryDocument advisory={advisory} />
        </div>
      </div>

      {related.length > 0 && (
        <div className="no-print max-w-5xl mx-auto px-4 pb-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4" style={{ fontFamily: 'DM Serif Display, serif' }}>Related content</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {related.map(item => (
              <WatchCard key={item.id} item={item} onOpen={() => navigate(userPathFor(item))} />
            ))}
          </div>
        </div>
      )}

      <div className="no-print max-w-5xl mx-auto px-4 pb-8">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
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
                <span className="text-amber-600 flex items-center gap-1.5">
                  Expires: {new Date(advisory.expiryDate).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={handleShare} className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium">
                <Share2 size={12} /> Share
              </button>
              <button type="button" onClick={handlePrint} className="flex items-center gap-1.5 text-slate-600 hover:text-slate-700 font-medium">
                <Printer size={12} /> Print
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
