import { Search, ChevronDown, Filter } from 'lucide-react'
import { PROVINCE_NAMES, getDistricts } from '../data/pakistan'
import { HAZARDS, INFRA_TYPES, ISSUE_TYPES } from '../data/constants'
import type { ContentFilters, HazardType } from '../types'

const SELECT =
  'w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 appearance-none bg-white focus:border-blue-400 disabled:opacity-50'

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

  function set<K extends keyof ContentFilters>(key: K, value: ContentFilters[K]) {
    const next = { ...filters, [key]: value }
    if (key === 'province') next.district = ''
    onChange(next)
  }

  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
        <Filter size={12} /> Explore Infrastructure Intelligence
      </div>
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${showIssueType ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-3 mb-4`}>
        <div className="relative">
          <select
            value={filters.hazard}
            onChange={e => set('hazard', e.target.value as HazardType | '')}
            className={SELECT}
            style={{ outline: 'none' }}
          >
            <option value="">All Hazards</option>
            {HAZARDS.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
          <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
        <div className="relative">
          <select
            value={filters.province}
            onChange={e => set('province', e.target.value)}
            className={SELECT}
            style={{ outline: 'none' }}
          >
            <option value="">All Provinces</option>
            {PROVINCE_NAMES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
        <div className="relative">
          <select
            value={filters.district}
            onChange={e => set('district', e.target.value)}
            disabled={!filters.province}
            className={SELECT}
            style={{ outline: 'none' }}
          >
            <option value="">All Districts</option>
            {districts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
        <div className="relative">
          <select
            value={filters.infrastructureType}
            onChange={e => set('infrastructureType', e.target.value)}
            className={SELECT}
            style={{ outline: 'none' }}
          >
            <option value="">All Infrastructure</option>
            {INFRA_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
        {showIssueType && (
          <div className="relative">
            <select
              value={filters.issueType}
              onChange={e => set('issueType', e.target.value)}
              className={SELECT}
              style={{ outline: 'none' }}
            >
              <option value="">All Issue Types</option>
              {ISSUE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        )}
      </div>
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search infrastructure issues, advisories, locations or solutions..."
            value={filters.keyword}
            onChange={e => set('keyword', e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onSearch?.()}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 focus:border-blue-400"
            style={{ outline: 'none' }}
          />
        </div>
        {onSearch && (
          <button
            type="button"
            onClick={onSearch}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold whitespace-nowrap"
            style={{ background: 'linear-gradient(135deg, #1D4ED8, #06B6D4)' }}
          >
            <Search size={14} />
            Search
          </button>
        )}
      </div>
    </div>
  )
}
