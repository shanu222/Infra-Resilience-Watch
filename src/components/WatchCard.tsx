import { useNavigate } from 'react-router-dom'
import { Calendar, MapPin, ArrowRight, Building2, Play } from 'lucide-react'
import type { Advisory } from '../types'
import HazardIcon from './HazardIcon'
import SeverityBadge from './SeverityBadge'
import KindBadge from './KindBadge'
import { excerpt, formatDate, locationLabel, userPathFor } from '../utils'

export default function WatchCard({
  item,
  onOpen,
}: {
  item: Advisory
  onOpen?: () => void
}) {
  const navigate = useNavigate()
  const coverImage = item.images.find(i => i.isCover) || item.images[0]
  const location = locationLabel(item)
  const dateStr = formatDate(item.publishedAt || item.createdAt)
  const summary = item.shortSummary || excerpt(item.currentSituation || item.observedConditions || item.keyTakeaway, 130)

  function open() {
    if (onOpen) onOpen()
    else navigate(userPathFor(item))
  }

  return (
    <article
      onClick={open}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group overflow-hidden flex flex-col"
    >
      <div className="h-44 bg-slate-100 overflow-hidden relative">
        {coverImage ? (
          <img
            src={coverImage.dataUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0A1628, #1E3A5F)' }}>
            <HazardIcon hazard={item.hazard} size={36} />
          </div>
        )}
        {item.kind === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(6,182,212,0.9)' }}>
              <Play size={18} className="text-white ml-0.5" fill="white" />
            </div>
          </div>
        )}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <KindBadge kind={item.kind} />
          <SeverityBadge severity={item.severity} size="sm" />
        </div>
        {item.featured && (
          <div className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white" style={{ background: '#06B6D4' }}>
            Today
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <HazardIcon hazard={item.hazard} size={13} showLabel />
        </div>
        <h3 className="text-sm font-bold text-slate-800 leading-tight mb-2 group-hover:text-blue-600 transition-colors">
          {item.title}
        </h3>
        {item.issueType && (
          <div className="text-[11px] text-slate-500 font-medium mb-2">{item.issueType}</div>
        )}
        {summary && <p className="text-xs text-slate-500 leading-relaxed mb-3 flex-1">{summary}</p>}

        <div className="space-y-1.5 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Calendar size={11} />
            {dateStr || 'Undated'}
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin size={11} />
            <span className="truncate">{location}</span>
          </div>
          {item.infrastructureTypes.length > 0 && (
            <div className="flex items-center gap-1.5">
              <Building2 size={11} />
              <span className="truncate">{item.infrastructureTypes.join(', ')}</span>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 group-hover:gap-2.5 transition-all">
          Open details <ArrowRight size={12} />
        </div>
      </div>
    </article>
  )
}
