import { useNavigate } from 'react-router-dom'
import { Calendar, MapPin, Building2, Play, ArrowRight } from 'lucide-react'
import type { Advisory } from '../types'
import HazardIcon from './HazardIcon'
import SeverityBadge from './SeverityBadge'
import KindBadge from './KindBadge'
import { excerpt, formatDate, userPathFor } from '../utils'

export default function WatchCard({ item, onOpen }: { item: Advisory; onOpen?: () => void }) {
  const navigate = useNavigate()
  const coverImage = item.images.find(i => i.isCover) || item.images[0]
  const summary = item.shortSummary || excerpt(item.currentSituation || item.observedConditions || item.keyTakeaway, 140)

  function open() {
    if (onOpen) onOpen()
    else navigate(userPathFor(item))
  }

  return (
    <article
      className="premium-card rounded-2xl overflow-hidden flex flex-col cursor-pointer group"
      onClick={open}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open() } }}
      role="link"
      tabIndex={0}
      aria-label={item.title}
    >
      <div className="h-44 relative overflow-hidden bg-slate-200">
        {coverImage ? (
          <img src={coverImage.dataUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0B1F3A, #1769AA)' }}>
            <HazardIcon hazard={item.hazard} size={36} />
          </div>
        )}
        {item.kind === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: '#16B8D4' }}>
              <Play size={18} className="text-white ml-0.5" fill="white" />
            </div>
          </div>
        )}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <KindBadge kind={item.kind} />
          <SeverityBadge severity={item.severity} size="sm" />
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
          {item.hazard} {item.infrastructureTypes[0] ? `· ${item.infrastructureTypes[0]}` : ''}
        </div>
        <h3 className="text-sm font-bold text-navy leading-tight mb-2 group-hover:text-[#1769AA]">{item.title}</h3>
        {summary && <p className="text-xs text-slate-500 leading-relaxed mb-3 flex-1">{summary}</p>}
        <div className="grid grid-cols-2 gap-y-1.5 text-[11px] text-slate-500 mb-4">
          <span className="flex items-center gap-1"><Calendar size={11} />{formatDate(item.publishedAt || item.createdAt)}</span>
          <span className="flex items-center gap-1 truncate"><MapPin size={11} />{item.district || item.province || 'Pakistan'}</span>
          <span className="truncate">{item.province || '—'}</span>
          <span className="flex items-center gap-1 truncate"><Building2 size={11} />{item.infrastructureTypes.join(', ') || '—'}</span>
        </div>
        <button type="button" className="btn-3d btn-3d-primary w-full py-2.5 rounded-xl text-xs flex items-center justify-center gap-2">
          View details <ArrowRight size={13} />
        </button>
      </div>
    </article>
  )
}
