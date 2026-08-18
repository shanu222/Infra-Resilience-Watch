import { useNavigate } from 'react-router-dom'
import { Calendar, MapPin, Building2, Play, ArrowRight, Eye } from 'lucide-react'
import type { Advisory, ContentKind } from '../types'
import HazardIcon from './HazardIcon'
import SeverityBadge from './SeverityBadge'
import KindBadge from './KindBadge'
import { excerpt, formatDate, userPathFor } from '../utils'

const KIND_ACCENT: Record<ContentKind, { border: string; gradient: string; btn: string }> = {
  issue:       { border: '#E5484D', gradient: 'linear-gradient(135deg,#0B1F3A 0%,#7B1921 100%)', btn: 'btn-3d-red' },
  advisory:    { border: '#168DDB', gradient: 'linear-gradient(135deg,#0B1F3A 0%,#0F4C7A 100%)', btn: 'btn-3d-primary' },
  solution:    { border: '#20B26B', gradient: 'linear-gradient(135deg,#071A33 0%,#0D5C35 100%)', btn: 'btn-3d-green' },
  video:       { border: '#7357D9', gradient: 'linear-gradient(135deg,#0B1F3A 0%,#3B2A7E 100%)', btn: 'btn-3d-purple' },
  'case-study':{ border: '#F2A900', gradient: 'linear-gradient(135deg,#1A0F00 0%,#7A5000 100%)', btn: 'btn-3d-amber' },
  observation: { border: '#10A99A', gradient: 'linear-gradient(135deg,#071A33 0%,#0A5850 100%)', btn: 'btn-3d-cyan' },
}

export default function WatchCard({ item, onOpen, index = 0 }: { item: Advisory; onOpen?: () => void; index?: number }) {
  const navigate = useNavigate()
  const coverImage = item.images.find(i => i.isCover) || item.images[0]
  const summary = item.shortSummary || excerpt(item.currentSituation || item.observedConditions || item.keyTakeaway, 130)
  const accent = KIND_ACCENT[item.kind] || KIND_ACCENT.advisory

  const delay = ['delay-50','delay-100','delay-150','delay-200','delay-250','delay-300'][index % 6]

  function open() {
    if (onOpen) onOpen()
    else navigate(userPathFor(item))
  }

  return (
    <article
      className={`premium-card flex flex-col cursor-pointer group overflow-hidden anim-fade-up ${delay}`}
      style={{ borderTop: `3px solid ${accent.border}` }}
      onClick={open}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open() } }}
      role="link"
      tabIndex={0}
      aria-label={item.title}
    >
      {/* Image / placeholder */}
      <div className="h-44 relative overflow-hidden shrink-0" style={{ background: accent.gradient }}>
        {coverImage ? (
          <img
            src={coverImage.dataUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-60">
            <HazardIcon hazard={item.hazard} size={40} />
          </div>
        )}
        {item.kind === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl"
              style={{ background: 'rgba(115,87,217,0.9)', border: '2px solid rgba(255,255,255,0.35)' }}>
              <Play size={22} className="text-white ml-1" fill="white" />
            </div>
          </div>
        )}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <KindBadge kind={item.kind} />
          <SeverityBadge severity={item.severity} size="sm" />
        </div>
        {item.viewCount > 0 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 text-[10px] font-medium text-white/80 bg-black/30 rounded-full px-2 py-0.5">
            <Eye size={9} /> {item.viewCount}
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: accent.border }}>
          {item.hazard}{item.infrastructureTypes[0] ? ` · ${item.infrastructureTypes[0]}` : ''}
        </div>
        <h3 className="text-sm font-bold leading-snug mb-2 text-slate-800 group-hover:text-[#168DDB] transition-colors truncate-2">
          {item.title}
        </h3>
        {summary && (
          <p className="text-xs text-slate-500 leading-relaxed mb-3 flex-1 truncate-3">{summary}</p>
        )}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-400 mb-4">
          <span className="flex items-center gap-1">
            <Calendar size={10} />{formatDate(item.publishedAt || item.createdAt)}
          </span>
          <span className="flex items-center gap-1 truncate max-w-[160px]">
            <MapPin size={10} />{item.district || item.province || 'Pakistan'}
          </span>
          {item.infrastructureTypes[0] && (
            <span className="flex items-center gap-1">
              <Building2 size={10} />{item.infrastructureTypes[0]}
            </span>
          )}
        </div>
        <button
          type="button"
          className={`btn-3d ${accent.btn} w-full py-2.5 rounded-xl text-xs flex items-center justify-center gap-2`}
        >
          View details <ArrowRight size={12} />
        </button>
      </div>
    </article>
  )
}
