import { useMemo, useState } from 'react'
import { Shield } from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import FilterBar from '../components/FilterBar'
import WatchCard from '../components/WatchCard'
import { EMPTY_FILTERS, filterContent, isContentLive, sortNewest } from '../utils'
import type { ContentFilters, ContentKind } from '../types'

const SECTIONS: Record<string, {
  title: string
  description: string
  kinds: ContentKind[] | null
  eyebrow: string
  accent: string
}> = {
  watch: {
    title: "Today's Watch",
    description: 'The latest published infrastructure issues, risks, advisories, solutions and field intelligence.',
    kinds: null,
    eyebrow: 'Latest published items',
    accent: '#12B8D6',
  },
  issues: {
    title: 'Infrastructure Issues',
    description: 'Problems, risks, damage observations and field notes from across Pakistan.',
    kinds: ['issue', 'observation'],
    eyebrow: 'Field intelligence',
    accent: '#E5484D',
  },
  advisories: {
    title: 'Advisories',
    description: 'Published infrastructure, emergency, preventive and public-safety advisories.',
    kinds: ['advisory'],
    eyebrow: 'Official guidance',
    accent: '#168DDB',
  },
  solutions: {
    title: 'Solutions',
    description: 'Engineering recommendations, preventive measures and Build Back Better practices.',
    kinds: ['solution'],
    eyebrow: 'Engineering recommendations',
    accent: '#20B26B',
  },
  videos: {
    title: 'Videos',
    description: 'Field footage, briefings and recorded infrastructure observations.',
    kinds: ['video'],
    eyebrow: 'Field footage',
    accent: '#7357D9',
  },
  'case-studies': {
    title: 'Case Studies',
    description: 'Documented recovery, reconstruction and resilience cases.',
    kinds: ['case-study'],
    eyebrow: 'Build Back Better documentation',
    accent: '#F2A900',
  },
}

export default function UserBrowse({ section }: { section: keyof typeof SECTIONS }) {
  const { advisories } = useApp()
  const meta = SECTIONS[section]
  const [filters, setFilters] = useState<ContentFilters>(EMPTY_FILTERS)

  const items = useMemo(() => {
    const published = advisories.filter(isContentLive)
    const source = section === 'watch' ? sortNewest(published).slice(0, 24) : published
    const scoped = meta.kinds ? source.filter(a => meta.kinds!.includes(a.kind)) : source
    return sortNewest(filterContent(scoped, filters))
  }, [advisories, filters, meta.kinds, section])

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Page header */}
      <div className="glass-panel rounded-2xl p-6 mb-7 anim-fade-up" style={{ borderTop: `3px solid ${meta.accent}` }}>
        <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: meta.accent }}>
          {meta.eyebrow}
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2" style={{ fontFamily: 'DM Serif Display, serif' }}>
          {meta.title}
        </h1>
        <p className="text-slate-500 text-sm max-w-2xl leading-relaxed">{meta.description}</p>
      </div>

      <div className="mb-7 anim-fade-up delay-50">
        <FilterBar
          filters={filters}
          onChange={setFilters}
          showIssueType={section === 'issues' || section === 'watch'}
        />
      </div>

      {items.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 sm:p-16 text-center anim-scale">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg,#eff6ff,#dbeafe)', border: '1px solid #bfdbfe' }}
          >
            <Shield size={28} style={{ color: '#168DDB' }} />
          </div>
          <h2 className="text-lg font-bold text-slate-700 mb-2" style={{ fontFamily: 'DM Serif Display, serif' }}>
            No infrastructure intelligence published yet
          </h2>
          <p className="text-slate-500 text-sm max-w-xs mx-auto leading-relaxed">
            Content appears here after an administrator publishes it.
          </p>
        </div>
      ) : (
        <>
          <div className="text-xs font-bold uppercase tracking-wider mb-5" style={{ color: '#475569' }}>
            {items.length} item{items.length === 1 ? '' : 's'}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item, i) => <WatchCard key={item.id} item={item} index={i} />)}
          </div>
        </>
      )}
    </div>
  )
}
