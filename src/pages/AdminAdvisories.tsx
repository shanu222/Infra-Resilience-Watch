import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Eye, Edit3, Copy, Trash2, Archive, Globe, EyeOff, ChevronDown } from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import AdminLayout from '../components/AdminLayout'
import SeverityBadge from '../components/SeverityBadge'
import StatusBadge from '../components/StatusBadge'
import type { Status, HazardType, ContentKind } from '../types'
import KindBadge from '../components/KindBadge'
import { CONTENT_KINDS } from '../data/constants'

export default function AdminAdvisories() {
  const { advisories, deleteAdvisory, publishAdvisory, archiveAdvisory, unpublishAdvisory, duplicateAdvisory } = useApp()
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<Status | 'All'>('All')
  const [filterHazard, setFilterHazard] = useState<HazardType | 'All'>('All')
  const [filterKind, setFilterKind] = useState<ContentKind | 'All'>('All')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const filtered = advisories.filter(a => {
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.hazard.toLowerCase().includes(search.toLowerCase()) || (a.province + a.district).toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'All' || a.status === filterStatus
    const matchHazard = filterHazard === 'All' || a.hazard === filterHazard
    const matchKind = filterKind === 'All' || a.kind === filterKind
    return matchSearch && matchStatus && matchHazard && matchKind
  })

  const uniqueHazards = [...new Set(advisories.map(a => a.hazard))]

  function handleDelete(id: string) {
    deleteAdvisory(id)
    setConfirmDelete(null)
  }

  function handleDuplicate(id: string) {
    const copy = duplicateAdvisory(id)
    navigate(`/admin/advisories/${copy.id}/edit`)
  }

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: 'DM Serif Display, serif' }}>Content</h1>
            <p className="text-slate-500 text-sm mt-1">{advisories.length} issues, advisories, solutions and records</p>
          </div>
          <button
            onClick={() => navigate('/admin/advisories/new')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-lg hover:shadow-xl transition-all"
            style={{ background: 'linear-gradient(135deg, #1D4ED8, #06B6D4)' }}
          >
            <Plus size={18} />
            Create Content
          </button>
        </div>

        {/* Quick create */}
        <div className="flex flex-wrap gap-2 mb-4">
          {CONTENT_KINDS.map(k => (
            <button
              key={k.id}
              type="button"
              onClick={() => navigate(`/admin/advisories/new?kind=${k.id}`)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-700 transition-all"
            >
              + {k.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-48 relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by title, hazard, location..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm border border-slate-200 text-slate-700 placeholder-slate-400 focus:border-blue-400 transition-colors"
                style={{ outline: 'none' }}
              />
            </div>
            <div className="relative">
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value as Status | 'All')}
                className="appearance-none pl-3 pr-8 py-2.5 rounded-xl text-sm border border-slate-200 text-slate-700 bg-white focus:border-blue-400 transition-colors"
                style={{ outline: 'none' }}
              >
                <option value="All">All Status</option>
                {(['Draft', 'Review', 'Published', 'Scheduled', 'Archived'] as Status[]).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={filterHazard}
                onChange={e => setFilterHazard(e.target.value as HazardType | 'All')}
                className="appearance-none pl-3 pr-8 py-2.5 rounded-xl text-sm border border-slate-200 text-slate-700 bg-white focus:border-blue-400 transition-colors"
                style={{ outline: 'none' }}
              >
                <option value="All">All Hazards</option>
                {uniqueHazards.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={filterKind}
                onChange={e => setFilterKind(e.target.value as ContentKind | 'All')}
                className="appearance-none pl-3 pr-8 py-2.5 rounded-xl text-sm border border-slate-200 text-slate-700 bg-white focus:border-blue-400 transition-colors"
                style={{ outline: 'none' }}
              >
                <option value="All">All Types</option>
                {CONTENT_KINDS.map(k => <option key={k.id} value={k.id}>{k.label}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-slate-300 mb-4">
                <Plus size={48} className="mx-auto" />
              </div>
              <p className="text-slate-500 text-sm mb-4">{advisories.length === 0 ? 'No content yet.' : 'No items match your filters.'}</p>
              {advisories.length === 0 && (
                <button
                  onClick={() => navigate('/admin/advisories/new')}
                  className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold"
                  style={{ background: 'linear-gradient(135deg, #1D4ED8, #06B6D4)' }}
                >
                  Create First Entry
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Title</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Type</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Location</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Severity</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Updated</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">v</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map(a => (
                    <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <button
                          onClick={() => navigate(`/admin/advisories/${a.id}/edit`)}
                          className="text-left hover:text-blue-600 transition-colors"
                        >
                          <div className="font-medium text-slate-700 text-sm leading-tight max-w-xs truncate">{a.title}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{a.hazard}{a.issueType ? ` · ${a.issueType}` : ''}</div>
                        </button>
                      </td>
                      <td className="px-3 py-3 hidden sm:table-cell">
                        <KindBadge kind={a.kind || 'advisory'} />
                      </td>
                      <td className="px-3 py-3 text-xs text-slate-500 hidden md:table-cell">
                        {[a.district, a.province].filter(Boolean).join(', ') || '—'}
                      </td>
                      <td className="px-3 py-3">
                        <SeverityBadge severity={a.severity} size="sm" />
                      </td>
                      <td className="px-3 py-3">
                        <StatusBadge status={a.status} size="sm" />
                      </td>
                      <td className="px-3 py-3 text-xs text-slate-400 hidden lg:table-cell">
                        {new Date(a.updatedAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}
                      </td>
                      <td className="px-3 py-3 text-xs font-mono text-slate-400 hidden lg:table-cell">
                        v{a.version}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            title="Preview"
                            onClick={() => navigate(`/user/content/${a.id}`)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            title="Edit"
                            onClick={() => navigate(`/admin/advisories/${a.id}/edit`)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            title="Duplicate"
                            onClick={() => handleDuplicate(a.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                          >
                            <Copy size={14} />
                          </button>
                          {a.status === 'Published' ? (
                            <button
                              title="Unpublish"
                              onClick={() => unpublishAdvisory(a.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all"
                            >
                              <EyeOff size={14} />
                            </button>
                          ) : a.status !== 'Archived' ? (
                            <button
                              title="Publish"
                              onClick={() => publishAdvisory(a.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-green-600 hover:bg-green-50 transition-all"
                            >
                              <Globe size={14} />
                            </button>
                          ) : null}
                          {a.status !== 'Archived' && (
                            <button
                              title="Archive"
                              onClick={() => archiveAdvisory(a.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                            >
                              <Archive size={14} />
                            </button>
                          )}
                          <button
                            title="Delete"
                            onClick={() => setConfirmDelete(a.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setConfirmDelete(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={20} style={{ color: '#DC2626' }} />
            </div>
            <h3 className="text-base font-bold text-slate-800 text-center mb-2">Delete this item?</h3>
            <p className="text-sm text-slate-500 text-center mb-6">This action cannot be undone. The record will be permanently deleted.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                style={{ background: '#DC2626' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
