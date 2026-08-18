import { useNavigate } from 'react-router-dom'
import { Plus, FileText, Eye, Clock, Archive, AlertTriangle, TrendingUp, BarChart3 } from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import AdminLayout from '../components/AdminLayout'
import SeverityBadge from '../components/SeverityBadge'
import StatusBadge from '../components/StatusBadge'
import HazardIcon from '../components/HazardIcon'
import type { HazardType } from '../types'

export default function AdminDashboard() {
  const { advisories } = useApp()
  const navigate = useNavigate()

  const total = advisories.length
  const drafts = advisories.filter(a => a.status === 'Draft').length
  const published = advisories.filter(a => a.status === 'Published').length
  const scheduled = advisories.filter(a => a.status === 'Scheduled').length
  const archived = advisories.filter(a => a.status === 'Archived').length
  const review = advisories.filter(a => a.status === 'Review').length

  const recent = [...advisories].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)
  const mostViewed = [...advisories].filter(a => a.status === 'Published').sort((a, b) => b.viewCount - a.viewCount).slice(0, 5)

  // Hazard breakdown
  const hazardCounts: Record<string, number> = {}
  advisories.forEach(a => { hazardCounts[a.hazard] = (hazardCounts[a.hazard] || 0) + 1 })
  const topHazards = Object.entries(hazardCounts).sort((a, b) => b[1] - a[1]).slice(0, 6)

  const kindCounts: Record<string, number> = {}
  advisories.forEach(a => { kindCounts[a.kind || 'advisory'] = (kindCounts[a.kind || 'advisory'] || 0) + 1 })
  const topKinds = Object.entries(kindCounts).sort((a, b) => b[1] - a[1])

  // Province breakdown
  const provinceCounts: Record<string, number> = {}
  advisories.forEach(a => { if (a.province) provinceCounts[a.province] = (provinceCounts[a.province] || 0) + 1 })
  const topProvinces = Object.entries(provinceCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)

  const videos = advisories.filter(a => a.kind === 'video').length
  const issues = advisories.filter(a => a.kind === 'issue' || a.kind === 'observation').length
  const solutions = advisories.filter(a => a.kind === 'solution').length
  const cases = advisories.filter(a => a.kind === 'case-study').length
  const today = new Date().toDateString()
  const todayCount = advisories.filter(a => a.status === 'Published' && new Date(a.publishedAt || a.createdAt).toDateString() === today).length

  const STATS = [
    { label: 'Total Advisories', value: advisories.filter(a => a.kind === 'advisory').length, icon: FileText, color: '#1769AA', bg: '#EFF6FF' },
    { label: 'Published', value: published, icon: Eye, color: '#168A5B', bg: '#ECFDF5' },
    { label: 'Drafts', value: drafts, icon: Clock, color: '#64748B', bg: '#F8FAFC' },
    { label: 'Issues', value: issues, icon: AlertTriangle, color: '#D64545', bg: '#FEF2F2' },
    { label: 'Videos', value: videos, icon: TrendingUp, color: '#5B21B6', bg: '#F5F3FF' },
    { label: 'Solutions', value: solutions, icon: Archive, color: '#168A5B', bg: '#ECFDF5' },
    { label: "Today's Publications", value: todayCount, icon: BarChart3, color: '#16B8D4', bg: '#ECFEFF' },
    { label: 'Case Studies', value: cases, icon: FileText, color: '#0B1F3A', bg: '#F1F5F9' },
  ]

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: 'DM Serif Display, serif' }}>Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">Infrastructure Resilience Watch · Operations</p>
          </div>
          <button
            onClick={() => navigate('/admin/advisories/new')}
            className="btn-3d btn-3d-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm"
          >
            <Plus size={18} />
            Create Content
          </button>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
          {STATS.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="rounded-2xl p-4 bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                  <Icon size={17} style={{ color }} />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-800 mb-0.5">{value}</div>
              <div className="text-xs text-slate-500 font-medium">{label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Recent advisories */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-700 text-sm">Recent Content</h2>
              <button onClick={() => navigate('/admin/advisories')} className="text-xs text-blue-600 hover:text-blue-700 font-medium">View all →</button>
            </div>
            {recent.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                No content yet.{' '}
                <button onClick={() => navigate('/admin/advisories/new')} className="text-blue-600 hover:underline">Create your first entry</button>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {recent.map(a => (
                  <div
                    key={a.id}
                    onClick={() => navigate(`/admin/advisories/${a.id}/edit`)}
                    className="px-5 py-3.5 flex items-center gap-3 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <HazardIcon hazard={a.hazard} size={15} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-700 truncate">{a.title}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{a.province}{a.district ? ` · ${a.district}` : ''}</div>
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
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <BarChart3 size={15} className="text-slate-400" />
              <h2 className="font-semibold text-slate-700 text-sm">Content by Hazard</h2>
            </div>
            {topHazards.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">No data yet</div>
            ) : (
              <div className="p-4 space-y-3">
                {topHazards.map(([hazard, count]) => (
                  <div key={hazard} className="flex items-center gap-3">
                    <HazardIcon hazard={hazard as HazardType} size={13} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-slate-600 truncate">{hazard}</span>
                        <span className="text-xs font-bold text-slate-700 ml-2">{count}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${(count / total) * 100}%`, background: 'linear-gradient(90deg, #1D4ED8, #06B6D4)' }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Most viewed */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <Eye size={15} className="text-slate-400" />
              <h2 className="font-semibold text-slate-700 text-sm">Most Viewed</h2>
            </div>
            {mostViewed.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">No published content yet</div>
            ) : (
              <div className="divide-y divide-slate-50">
                {mostViewed.map((a, i) => (
                  <div key={a.id} className="px-5 py-3 flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-slate-300 w-4">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-700 truncate">{a.title}</div>
                      <div className="text-xs text-slate-400">{a.viewCount} views</div>
                    </div>
                    <SeverityBadge severity={a.severity} size="sm" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Province breakdown */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-700 text-sm">Content by Province</h2>
            </div>
            {topProvinces.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">No data yet</div>
            ) : (
              <div className="p-4 space-y-3">
                {topProvinces.map(([province, count]) => (
                  <div key={province} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-slate-600 truncate">{province}</span>
                        <span className="text-xs font-bold text-slate-700">{count}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-emerald-400" style={{ width: `${(count / total) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {topKinds.length > 0 && (
          <div className="mt-6 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-700 text-sm">Content by Type</h2>
            </div>
            <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {topKinds.map(([kind, count]) => (
                <div key={kind} className="rounded-xl border border-slate-100 p-3">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{kind.replace('-', ' ')}</div>
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
