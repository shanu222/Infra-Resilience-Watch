import { useMemo, useState } from 'react'
import { Shield } from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import FilterBar from '../components/FilterBar'
import WatchCard from '../components/WatchCard'
import { EMPTY_FILTERS, filterContent, isContentLive, sortNewest } from '../utils'
import type { ContentFilters, ContentKind } from '../types'

const SECTIONS: Record<string, { title: string; description: string; kinds: ContentKind[] | null }> = {
  watch: {
    title: "Today's Watch",
    description: 'The latest published infrastructure issues, risks, advisories, solutions and field intelligence.',
    kinds: null,
  },
  issues: {
    title: 'Infrastructure Issues',
    description: 'Problems, risks, damage observations and field notes from across Pakistan.',
    kinds: ['issue', 'observation'],
  },
  advisories: {
    title: 'Advisories',
    description: 'Published infrastructure, emergency, preventive and public-safety advisories.',
    kinds: ['advisory'],
  },
  solutions: {
    title: 'Solutions',
    description: 'Engineering recommendations, preventive measures and Build Back Better practices.',
    kinds: ['solution'],
  },
  videos: {
    title: 'Videos',
    description: 'Field footage, briefings and recorded infrastructure observations.',
    kinds: ['video'],
  },
  'case-studies': {
    title: 'Case Studies',
    description: 'Documented recovery, reconstruction and resilience cases.',
    kinds: ['case-study'],
  },
}

export default function UserBrowse({ section }: { section: keyof typeof SECTIONS }) {
  const { advisories } = useApp()
  const meta = SECTIONS[section]
  const [filters, setFilters] = useState<ContentFilters>(EMPTY_FILTERS)

  const items = useMemo(() => {
    const published = advisories.filter(isContentLive)
    const source = section === 'watch' ? sortNewest(published).slice(0, 12) : published
    const scoped = meta.kinds ? source.filter(a => meta.kinds!.includes(a.kind)) : source
    return sortNewest(filterContent(scoped, filters))
  }, [advisories, filters, meta.kinds, section])

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="glass-panel rounded-2xl p-5 mb-8">
        <div className="text-xs font-bold uppercase tracking-widest text-cyan-700 mb-1">User Portal</div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2" style={{ fontFamily: 'DM Serif Display, serif' }}>
          {meta.title}
        </h1>
        <p className="text-slate-600 text-sm max-w-2xl">{meta.description}</p>
      </div>

      <div className="mb-8">
        <FilterBar filters={filters} onChange={setFilters} showIssueType={section === 'issues' || section === 'watch'} />
      </div>

      {items.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center">
          <Shield size={36} className="mx-auto mb-3 text-slate-300" />
          <h2 className="text-lg font-bold text-slate-700 mb-2" style={{ fontFamily: 'DM Serif Display, serif' }}>
            No infrastructure intelligence published yet
          </h2>
          <p className="text-slate-500 text-sm">Content appears here after an administrator publishes it.</p>
        </div>
      ) : (
        <>
          <div className="text-xs font-semibold user-ink-muted uppercase tracking-wider mb-4">
            {items.length} item{items.length === 1 ? '' : 's'}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map(item => <WatchCard key={item.id} item={item} />)}
          </div>
        </>
      )}
    </div>
  )
}
