import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Shield, ArrowRight, AlertTriangle, FileText, Wrench, Play, BookOpen } from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import FilterBar from '../components/FilterBar'
import WatchCard from '../components/WatchCard'
import { BRAND, CONTENT_KINDS } from '../data/constants'
import { EMPTY_FILTERS, filterContent, hasActiveFilters, sortNewest } from '../utils'
import type { ContentFilters, ContentKind } from '../types'

const EXPLORE: { kind: ContentKind; to: string; icon: typeof FileText }[] = [
  { kind: 'issue', to: '/user/issues', icon: AlertTriangle },
  { kind: 'advisory', to: '/user/advisories', icon: FileText },
  { kind: 'solution', to: '/user/solutions', icon: Wrench },
  { kind: 'video', to: '/user/videos', icon: Play },
  { kind: 'case-study', to: '/user/case-studies', icon: BookOpen },
]

export default function UserHome() {
  const { getPublishedAdvisories, getTodaysWatch, getPublishedByKind } = useApp()
  const published = getPublishedAdvisories()
  const watch = getTodaysWatch().slice(0, 6)
  const [filters, setFilters] = useState<ContentFilters>(EMPTY_FILTERS)
  const [applied, setApplied] = useState(false)

  const results = useMemo(() => {
    if (!applied && !hasActiveFilters(filters)) return []
    return sortNewest(filterContent(published, filters))
  }, [applied, filters, published])

  const searching = applied || hasActiveFilters(filters)

  return (
    <div>
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0A1628 0%, #1E3A5F 55%, #1D4ED8 100%)' }}>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at center, rgba(6,182,212,0.8) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }} />
        <div className="relative max-w-6xl mx-auto px-4 py-12 md:py-16">
          <div className="text-xs font-semibold tracking-[0.28em] text-cyan-300 uppercase mb-3">Daily infrastructure intelligence</div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3" style={{ fontFamily: 'DM Serif Display, serif' }}>
            {BRAND.name}
          </h1>
          <p className="text-slate-300 text-base md:text-lg max-w-2xl mb-8">
            {BRAND.heroLine}
          </p>

          <div className="flex flex-wrap gap-2 mb-8">
            {BRAND.pipeline.map(step => (
              <span key={step} className="text-[10px] font-bold uppercase tracking-widest text-cyan-100 px-3 py-1.5 rounded-full" style={{ background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.25)' }}>
                {step}
              </span>
            ))}
          </div>

          <FilterBar
            filters={filters}
            onChange={next => { setFilters(next); setApplied(true) }}
            onSearch={() => setApplied(true)}
          />
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {searching ? (
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-slate-800" style={{ fontFamily: 'DM Serif Display, serif' }}>
                Search results — {results.length}
              </h2>
              <button
                type="button"
                onClick={() => { setFilters(EMPTY_FILTERS); setApplied(false) }}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear filters
              </button>
            </div>
            {results.length === 0 ? (
              <EmptyState title="No matching intelligence" body="Try adjusting hazard, location, infrastructure type or search terms." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.map(item => <WatchCard key={item.id} item={item} />)}
              </div>
            )}
          </section>
        ) : (
          <>
            <section className="mb-12">
              <div className="flex items-end justify-between gap-4 mb-5">
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-cyan-700 mb-1">Latest published items</div>
                  <h2 className="text-2xl font-bold text-slate-800" style={{ fontFamily: 'DM Serif Display, serif' }}>
                    Today{"'"}s Watch
                  </h2>
                </div>
                <Link to="/user/watch" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  View all <ArrowRight size={14} />
                </Link>
              </div>
              {watch.length === 0 ? (
                <EmptyState title="No items on Today's Watch yet" body="Published issues, advisories and solutions will appear here as soon as administrators release them." />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {watch.map(item => <WatchCard key={item.id} item={item} />)}
                </div>
              )}
            </section>

            {published.some(a => a.images.length > 0) && (
              <section className="mb-12">
                <h2 className="text-xl font-bold text-slate-800 mb-5" style={{ fontFamily: 'DM Serif Display, serif' }}>
                  Field Photographs
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {published.flatMap(item => item.images.map(img => ({ img, item }))).slice(0, 8).map(({ img, item }) => (
                    <Link
                      key={img.id}
                      to={`/user/content/${item.id}`}
                      className="relative h-36 rounded-xl overflow-hidden group bg-slate-100"
                    >
                      <img src={img.dataUrl} alt={img.caption || item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      <div className="absolute inset-x-0 bottom-0 p-2 text-[11px] text-white bg-gradient-to-t from-black/70 to-transparent truncate">
                        {item.title}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <section className="mb-12">
              <h2 className="text-xl font-bold text-slate-800 mb-5" style={{ fontFamily: 'DM Serif Display, serif' }}>
                Explore Infrastructure Intelligence
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {EXPLORE.map(({ kind, to, icon: Icon }) => {
                  const meta = CONTENT_KINDS.find(k => k.id === kind)!
                  const count = getPublishedByKind(kind).length
                  return (
                    <Link
                      key={kind}
                      to={to}
                      className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md hover:border-cyan-200 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: '#ecfeff' }}>
                        <Icon size={18} style={{ color: '#0E7490' }} />
                      </div>
                      <div className="text-sm font-bold text-slate-800 mb-1 group-hover:text-blue-600">{meta.plural}</div>
                      <div className="text-xs text-slate-500 leading-relaxed mb-3">{meta.description}</div>
                      <div className="text-xs font-semibold text-slate-400">{count} published</div>
                    </Link>
                  )
                })}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  )
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
      <Shield size={36} className="mx-auto mb-3 text-slate-300" />
      <h3 className="text-lg font-bold text-slate-600 mb-2" style={{ fontFamily: 'DM Serif Display, serif' }}>{title}</h3>
      <p className="text-slate-400 text-sm max-w-md mx-auto">{body}</p>
    </div>
  )
}
