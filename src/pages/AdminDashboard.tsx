import { useNavigate } from 'react-router-dom'
import {
  Plus, FileText, Eye, Clock, Archive, AlertTriangle, TrendingUp, BarChart3,
  BookOpen, Newspaper, Globe, ChevronRight,
} from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import AdminLayout from '../components/AdminLayout'
import SeverityBadge from '../components/SeverityBadge'
import StatusBadge from '../components/StatusBadge'
import HazardIcon from '../components/HazardIcon'
import KindBadge from '../components/KindBadge'
import type { HazardType } from '../types'

const HAZARD_COLORS: Record<string, string> = {
  Flood: '#168DDB', 'Flash Flood': '#7357D9', 'Urban Flooding': '#12B8D6',
  Earthquake: '#F47B20', GLOF: '#12B8D6', Landslide: '#F2A900',
  Avalanche: '#168DDB', Cyclone: '#7357D9', Windstorm: '#6B7280',
  'Heavy Rainfall': '#168DDB', 'Urban Fire': '#E5484D', Drought: '#F2A900',
  'Extreme Heat': '#E5484D', 'Multi-Hazard': '#F47B20', Other: '#10A99A',
}

export default function AdminDashboard() {
  const { advisories, cloudEnabled, cloudError } = useApp()
  const navigate = useNavigate()

  const total = advisories.length
  const drafts = advisories.filter(a => a.status === 'Draft').length
  const published = advisories.filter(a => a.status === 'Published').length
  const issues = advisories.filter(a => a.kind === 'issue' || a.kind === 'observation').length
  const videos = advisories.filter(a => a.kind === 'video').length
  const solutions = advisories.filter(a => a.kind === 'solution').length
  const cases = advisories.filter(a => a.kind === 'case-study').length
  const today = new Date().toDateString()
  const todayCount = advisories.filter(a =>
    a.status === 'Published' && new Date(a.publishedAt || a.createdAt).toDateString() === today
  ).length

  const recent = [...advisories].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6)
  const mostViewed = [...advisories].filter(a => a.status === 'Published').sort((a, b) => b.viewCount - a.viewCount).slice(0, 5)

  const hazardCounts: Record<string, number> = {}
  advisories.forEach(a => { hazardCounts[a.hazard] = (hazardCounts[a.hazard] || 0) + 1 })
  const topHazards = Object.entries(hazardCounts).sort((a, b) => b[1] - a[1]).slice(0, 6)

  const kindCounts: Record<string, number> = {}
  advisories.forEach(a => { kindCounts[a.kind || 'advisory'] = (kindCounts[a.kind || 'advisory'] || 0) + 1 })
  const topKinds = Object.entries(kindCounts).sort((a, b) => b[1] - a[1])

  const provinceCounts: Record<string, number> = {}
  advisories.forEach(a => { if (a.province) provinceCounts[a.province] = (provinceCounts[a.province] || 0) + 1 })
  const topProvinces = Object.entries(provinceCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)

  const STATS = [
    { label: 'Advisories', value: advisories.filter(a => a.kind === 'advisory').length, icon: Newspaper, color: '#168DDB', bg: 'linear-gradient(135deg,#eff6ff,#dbeafe)', border: '#bfdbfe' },
    { label: 'Published', value: published, icon: Globe, color: '#20B26B', bg: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', border: '#bbf7d0' },
    { label: 'Drafts', value: drafts, icon: Clock, color: '#64748B', bg: 'linear-gradient(135deg,#f8fafc,#f1f5f9)', border: '#e2e8f0' },
    { label: 'Issues', value: issues, icon: AlertTriangle, color: '#E5484D', bg: 'linear-gradient(135deg,#fff1f2,#ffe4e6)', border: '#fecdd3' },
    { label: 'Videos', value: videos, icon: TrendingUp, color: '#7357D9', bg: 'linear-gradient(135deg,#faf5ff,#ede9fe)', border: '#ddd6fe' },
    { label: 'Solutions', value: solutions, icon: Archive, color: '#10A99A', bg: 'linear-gradient(135deg,#f0fdfa,#ccfbf1)', border: '#99f6e4' },
    { label: "Today's", value: todayCount, icon: BarChart3, color: '#12B8D6', bg: 'linear-gradient(135deg,#ecfeff,#cffafe)', border: '#a5f3fc' },
    { label: 'Case Studies', value: cases, icon: BookOpen, color: '#F2A900', bg: 'linear-gradient(135deg,#fffbeb,#fef3c7)', border: '#fde68a' },
  ]

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#12B8D6' }}>
              Operations Center
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white" style={{ fontFamily: 'DM Serif Display, serif', textShadow: '0 2px 12px rgba(7,26,51,0.5)' }}>
              Dashboard
            </h1>
            <p className="text-slate-300 text-sm mt-1">Infrastructure Resilience Watch · Operations</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/admin/advisories/new?kind=advisory')}
            className="btn-3d btn-3d-cyan flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm w-full sm:w-auto"
          >
            <Plus size={17} /> Create Content
          </button>
        </div>

        {/* Status banner */}
        {cloudError ? (
          <div className="mb-6 glass-panel-error rounded-2xl p-4 text-sm flex items-start gap-2">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <span>{cloudError}</span>
          </div>
        ) : cloudEnabled ? (
          <div className="mb-6 glass-panel-success rounded-2xl p-4 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
            Live database connected. Anything you Publish here appears on the User Portal for every visitor.
          </div>
        ) : (
          <div className="mb-6 glass-panel-warning rounded-2xl p-4 text-sm flex items-start gap-2">
            <AlertTriangle size={15} className="shrink-0 mt-0.5" />
            <span>
              Cloud database is not connected. Add <code className="font-mono bg-amber-100 px-1 rounded">VITE_SUPABASE_URL</code> and <code className="font-mono bg-amber-100 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> to connect.
            </span>
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-7">
          {STATS.map(({ label, value, icon: Icon, color, bg, border }, idx) => (
            <div key={label} className={`stat-card rounded-2xl p-4 anim-fade-up delay-${(idx + 1) * 50}`}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: bg, border: `1px solid ${border}` }}>
                <Icon size={17} style={{ color }} />
              </div>
              <div className="text-2xl font-bold mb-0.5 anim-count" style={{ color: '#071A33' }}>{value}</div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
          {/* Recent Content */}
          <div className="lg:col-span-2 glass-panel rounded-2xl overflow-hidden">
            <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(22,141,219,0.12)' }}>
              <div className="flex items-center gap-2">
                <FileText size={15} style={{ color: '#168DDB' }} />
                <h2 className="font-bold text-slate-700 text-sm">Recent Content</h2>
              </div>
              <button
                type="button"
                onClick={() => navigate('/admin/advisories')}
                className="text-xs font-semibold flex items-center gap-0.5 hover:gap-1 transition-all"
                style={{ color: '#168DDB' }}
              >
                View all <ChevronRight size={13} />
              </button>
            </div>
            {recent.length === 0 ? (
              <EmptyBlock msg="No content yet.">
                <button
                  type="button"
                  onClick={() => navigate('/admin/advisories/new?kind=advisory')}
                  className="text-xs font-semibold hover:underline"
                  style={{ color: '#168DDB' }}
                >
                  Create your first entry
                </button>
              </EmptyBlock>
            ) : (
              <div className="divide-y" style={{ borderColor: 'rgba(241,245,249,1)' }}>
                {recent.map(a => (
                  <div
                    key={a.id}
                    onClick={() => navigate(`/admin/advisories/${a.id}/edit`)}
                    className="px-5 py-3.5 flex items-center gap-3 hover:bg-blue-50/50 cursor-pointer transition-colors group"
                  >
                    <HazardIcon hazard={a.hazard} size={14} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <KindBadge kind={a.kind} />
                        <span className="text-sm font-medium text-slate-700 truncate group-hover:text-blue-700">{a.title}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {a.province}{a.district ? ` · ${a.district}` : ''}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <SeverityBadge severity={a.severity} size="sm" />
                      <StatusBadge status={a.status} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Hazard breakdown */}
          <div className="glass-panel rounded-2xl overflow-hidden">
            <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(22,141,219,0.12)' }}>
              <BarChart3 size={15} style={{ color: '#168DDB' }} />
              <h2 className="font-bold text-slate-700 text-sm">Content by Hazard</h2>
            </div>
            {topHazards.length === 0 ? (
              <EmptyBlock msg="No data yet" />
            ) : (
              <div className="p-4 space-y-3">
                {topHazards.map(([hazard, count]) => (
                  <div key={hazard} className="flex items-center gap-3">
                    <HazardIcon hazard={hazard as HazardType} size={13} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-slate-600 truncate">{hazard}</span>
                        <span className="text-xs font-bold text-slate-700 ml-2 shrink-0">{count}</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(226,232,240,0.8)' }}>
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${Math.max(8, (count / Math.max(total, 1)) * 100)}%`,
                            background: `linear-gradient(90deg, ${HAZARD_COLORS[hazard] || '#168DDB'}, ${HAZARD_COLORS[hazard] || '#12B8D6'}88)`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Most viewed */}
          <div className="glass-panel rounded-2xl overflow-hidden">
            <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(22,141,219,0.12)' }}>
              <Eye size={15} style={{ color: '#20B26B' }} />
              <h2 className="font-bold text-slate-700 text-sm">Most Viewed</h2>
            </div>
            {mostViewed.length === 0 ? (
              <EmptyBlock msg="No published content yet" />
            ) : (
              <div className="divide-y" style={{ borderColor: 'rgba(241,245,249,1)' }}>
                {mostViewed.map((a, i) => (
                  <div
                    key={a.id}
                    onClick={() => navigate(`/admin/advisories/${a.id}/edit`)}
                    className="px-5 py-3 flex items-center gap-3 hover:bg-green-50/40 cursor-pointer transition-colors"
                  >
                    <span className="text-xs font-mono font-bold w-5 text-center shrink-0" style={{ color: i === 0 ? '#F2A900' : '#CBD5E1' }}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-700 truncate">{a.title}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Eye size={9} /> {a.viewCount} views
                      </div>
                    </div>
                    <SeverityBadge severity={a.severity} size="sm" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Province breakdown */}
          <div className="glass-panel rounded-2xl overflow-hidden">
            <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(22,141,219,0.12)' }}>
              <BarChart3 size={15} style={{ color: '#10A99A' }} />
              <h2 className="font-bold text-slate-700 text-sm">Content by Province</h2>
            </div>
            {topProvinces.length === 0 ? (
              <EmptyBlock msg="No data yet" />
            ) : (
              <div className="p-4 space-y-3">
                {topProvinces.map(([province, count], i) => (
                  <div key={province} className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold w-4 text-slate-400 shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-slate-600 truncate">{province}</span>
                        <span className="text-xs font-bold text-slate-700 ml-2 shrink-0">{count}</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(226,232,240,0.8)' }}>
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${Math.max(8, (count / Math.max(total, 1)) * 100)}%`,
                            background: 'linear-gradient(90deg,#10A99A,#20B26B)',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {topKinds.length > 0 && (
          <div className="mt-5 glass-panel rounded-2xl overflow-hidden">
            <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(22,141,219,0.12)' }}>
              <BarChart3 size={15} style={{ color: '#7357D9' }} />
              <h2 className="font-bold text-slate-700 text-sm">Content by Type</h2>
            </div>
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {topKinds.map(([kind, count]) => (
                <div key={kind} className="rounded-xl p-3 text-center" style={{ background: 'rgba(241,245,249,0.7)', border: '1px solid rgba(226,232,240,0.8)' }}>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">{kind.replace('-', ' ')}</div>
                  <div className="text-xl font-bold text-slate-800">{count}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

function EmptyBlock({ msg, children }: { msg: string; children?: React.ReactNode }) {
  return (
    <div className="p-8 text-center">
      <p className="text-slate-400 text-sm mb-2">{msg}</p>
      {children}
    </div>
  )
}
