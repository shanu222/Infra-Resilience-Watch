import { Search, ChevronDown, Filter, X } from 'lucide-react'
import { PROVINCE_NAMES, getDistricts } from '../data/pakistan'
import { HAZARDS, INFRA_TYPES, ISSUE_TYPES } from '../data/constants'
import type { ContentFilters, HazardType } from '../types'
import { EMPTY_FILTERS } from '../utils'

const SELECT = [
  'w-full px-3 py-2.5 rounded-xl text-sm text-slate-700 appearance-none transition-all',
  'bg-white/95 border border-white/60 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200',
  'disabled:opacity-50 disabled:cursor-not-allowed',
].join(' ')

export default function FilterBar({
  filters,
  onChange,
  onSearch,
  showIssueType = true,
}: {
  filters: ContentFilters
  onChange: (next: ContentFilters) => void
  onSearch?: () => void
  showIssueType?: boolean
}) {
  const districts = getDistricts(filters.province)
  const hasActive = !!(filters.hazard || filters.province || filters.district || filters.infrastructureType || filters.issueType || filters.keyword)

  function set<K extends keyof ContentFilters>(key: K, value: ContentFilters[K]) {
    const next = { ...filters, [key]: value }
    if (key === 'province') next.district = ''
    onChange(next)
  }

  function reset() {
    onChange({ ...EMPTY_FILTERS })
  }

  return (
    <div className="glass-panel rounded-2xl p-5 backdrop-blur-xl border border-white/60"
      style={{ background: 'rgba(245,249,253,0.94)' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest" style={{ color: '#123E68' }}>
          <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: 'rgba(18,184,214,0.15)' }}>
            <Filter size={11} style={{ color: '#12B8D6' }} />
          </div>
          Explore Infrastructure Intelligence
        </div>
        {hasActive && (
          <button
            type="button"
            onClick={reset}
            className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-red-500 transition-colors"
          >
            <X size={12} /> Reset
          </button>
        )}
      </div>

      <div className={`grid grid-cols-1 sm:grid-cols-2 ${showIssueType ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-3 mb-4`}>
        {[
          { key: 'hazard' as const, placeholder: 'All Hazards', options: HAZARDS },
          { key: 'province' as const, placeholder: 'All Provinces', options: PROVINCE_NAMES },
          { key: 'district' as const, placeholder: 'All Districts', options: districts, disabled: !filters.province },
          { key: 'infrastructureType' as const, placeholder: 'All Infrastructure', options: INFRA_TYPES },
          ...(showIssueType ? [{ key: 'issueType' as const, placeholder: 'All Issue Types', options: ISSUE_TYPES }] : []),
        ].map(({ key, placeholder, options, disabled }) => (
          <div key={key} className="relative">
            <select
              value={(filters as unknown as Record<string, string>)[key] || ''}
              onChange={e => set(key, e.target.value as HazardType & string)}
              disabled={disabled}
              className={SELECT}
              style={{ outline: 'none' }}
            >
              <option value="">{placeholder}</option>
              {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative min-w-0">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search infrastructure issues, advisories, locations or solutions…"
            value={filters.keyword}
            onChange={e => set('keyword', e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onSearch?.()}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-slate-700 bg-white/95 border border-white/60 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200 transition-all"
            style={{ outline: 'none' }}
            aria-label="Search infrastructure intelligence"
          />
        </div>
        {onSearch && (
          <button
            type="button"
            onClick={onSearch}
            className="btn-3d btn-3d-cyan flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm w-full sm:w-auto whitespace-nowrap"
          >
            <Search size={14} /> Search
          </button>
        )}
      </div>
    </div>
  )
}
