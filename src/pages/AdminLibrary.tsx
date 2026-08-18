import { useState } from 'react'
import { Plus, Trash2, BookOpen, X } from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import AdminLayout from '../components/AdminLayout'
import type { LibraryItem } from '../types'

const CATEGORIES: LibraryItem['category'][] = ['Measure', 'Do', "Don't", 'Engineering', 'Guidance', 'Reference']
const HAZARDS = ['General', 'Flood', 'Flash Flood', 'Urban Flooding', 'Earthquake', 'GLOF', 'Landslide', 'Avalanche', 'Cyclone', 'Windstorm', 'Heavy Rainfall', 'Urban Fire', 'Drought', 'Extreme Heat', 'Multi-Hazard', 'Other']
const INFRA = ['General', 'Roads', 'Bridges', 'Buildings', 'Schools', 'Hospitals', 'Drainage', 'Water Supply', 'Power', 'Communication']

export default function AdminLibrary() {
  const { library, addLibraryItem, deleteLibraryItem } = useApp()
  const [filterCat, setFilterCat] = useState<LibraryItem['category'] | 'All'>('All')
  const [filterHazard, setFilterHazard] = useState('All')
  const [showAdd, setShowAdd] = useState(false)
  const [newItem, setNewItem] = useState({ category: 'Measure' as LibraryItem['category'], hazard: 'General' as LibraryItem['hazard'], infrastructure: 'General', text: '' })

  const filtered = library.filter(item => {
    const matchCat = filterCat === 'All' || item.category === filterCat
    const matchHazard = filterHazard === 'All' || item.hazard === filterHazard
    return matchCat && matchHazard
  })

  function handleAdd() {
    if (!newItem.text.trim()) return
    addLibraryItem(newItem)
    setNewItem({ category: 'Measure', hazard: 'General', infrastructure: 'General', text: '' })
    setShowAdd(false)
  }

  const CAT_COLORS: Record<LibraryItem['category'], string> = {
    Measure: '#dbeafe',
    Do: '#dcfce7',
    "Don't": '#fee2e2',
    Engineering: '#e0f2fe',
    Guidance: '#faf5ff',
    Reference: '#f8fafc',
  }
  const CAT_TEXT: Record<LibraryItem['category'], string> = {
    Measure: '#1e40af',
    Do: '#14532d',
    "Don't": '#991b1b',
    Engineering: '#0c4a6e',
    Guidance: '#5b21b6',
    Reference: '#374151',
  }

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold portal-heading" style={{ fontFamily: 'DM Serif Display, serif' }}>Content Library</h1>
            <p className="portal-subheading text-sm mt-1">Reusable measures, guidance and engineering notes</p>
          </div>
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="btn-3d btn-3d-primary flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm w-full sm:w-auto"
          >
            <Plus size={18} /> Add Item
          </button>
        </div>

        {/* Filters */}
        <div className="glass-panel rounded-2xl p-4 mb-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex gap-1.5 flex-wrap">
              {(['All', ...CATEGORIES] as const).map(c => (
                <button
                  key={c}
                  onClick={() => setFilterCat(c as any)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: filterCat === c ? '#1D4ED8' : '#f8fafc',
                    color: filterCat === c ? 'white' : '#64748b',
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
            <select
              value={filterHazard}
              onChange={e => setFilterHazard(e.target.value)}
              className="ml-auto px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 bg-white"
              style={{ outline: 'none' }}
            >
              {['All', ...HAZARDS].map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
        </div>

        {/* Items grid */}
        {filtered.length === 0 ? (
          <div className="glass-panel rounded-2xl p-12 text-center">
            <BookOpen size={36} className="mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500 text-sm">No items found. Add items to build your library.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map(item => (
              <div key={item.id} className="glass-panel rounded-xl p-4 group hover:border-slate-200 transition-all">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex gap-1.5 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: CAT_COLORS[item.category], color: CAT_TEXT[item.category] }}>
                      {item.category}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{item.hazard}</span>
                    {item.infrastructure !== 'General' && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{item.infrastructure}</span>
                    )}
                  </div>
                  <button
                    onClick={() => deleteLibraryItem(item.id)}
                    className="p-1 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="glass-panel modal-sheet rounded-2xl shadow-2xl">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-700">Add Library Item</h3>
              <button onClick={() => setShowAdd(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Category</label>
                <select
                  value={newItem.category}
                  onChange={e => setNewItem(p => ({ ...p, category: e.target.value as any }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white"
                  style={{ outline: 'none' }}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Hazard</label>
                  <select
                    value={newItem.hazard}
                    onChange={e => setNewItem(p => ({ ...p, hazard: e.target.value as any }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white"
                    style={{ outline: 'none' }}
                  >
                    {HAZARDS.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Infrastructure</label>
                  <select
                    value={newItem.infrastructure}
                    onChange={e => setNewItem(p => ({ ...p, infrastructure: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white"
                    style={{ outline: 'none' }}
                  >
                    {INFRA.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Content</label>
                <textarea
                  value={newItem.text}
                  onChange={e => setNewItem(p => ({ ...p, text: e.target.value }))}
                  placeholder="Enter the reusable content item..."
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 resize-none"
                  style={{ outline: 'none' }}
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowAdd(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  disabled={!newItem.text.trim()}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
                  style={{ background: newItem.text.trim() ? '#1D4ED8' : '#94a3b8', cursor: newItem.text.trim() ? 'pointer' : 'not-allowed' }}
                >
                  Add to Library
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
