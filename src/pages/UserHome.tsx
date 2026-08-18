import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Shield, ArrowRight, AlertTriangle, FileText, Wrench, Play, BookOpen } from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import FilterBar from '../components/FilterBar'
import WatchCard from '../components/WatchCard'
import { BRAND, CONTENT_KINDS } from '../data/constants'
import { EMPTY_FILTERS, filterContent, hasActiveFilters, isContentLive, sortNewest } from '../utils'
import type { ContentFilters, ContentKind } from '../types'

const EXPLORE: {
  kind: ContentKind
  to: string
  icon: typeof FileText
  color: string
  bg: string
  border: string
  accent: string
}[] = [
  { kind: 'issue',      to: '/issues',       icon: AlertTriangle, color: '#E5484D', bg: 'linear-gradient(135deg,#fff1f2,#ffe4e6)', border: '#fecdd3', accent: '#E5484D' },
  { kind: 'advisory',   to: '/advisories',   icon: FileText,      color: '#168DDB', bg: 'linear-gradient(135deg,#eff6ff,#dbeafe)', border: '#bfdbfe', accent: '#168DDB' },
  { kind: 'solution',   to: '/solutions',    icon: Wrench,        color: '#20B26B', bg: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', border: '#bbf7d0', accent: '#20B26B' },
  { kind: 'video',      to: '/videos',       icon: Play,          color: '#7357D9', bg: 'linear-gradient(135deg,#faf5ff,#ede9fe)', border: '#ddd6fe', accent: '#7357D9' },
  { kind: 'case-study', to: '/case-studies', icon: BookOpen,      color: '#F2A900', bg: 'linear-gradient(135deg,#fffbeb,#fef3c7)', border: '#fde68a', accent: '#F2A900' },
]

export default function UserHome() {
  const { advisories, getPublishedByKind } = useApp()
  const published = useMemo(() => sortNewest(advisories.filter(isContentLive)), [advisories])
  const watch = published.slice(0, 6)
  const [filters, setFilters] = useState<ContentFilters>(EMPTY_FILTERS)
  const [applied, setApplied] = useState(false)

  const results = useMemo(() => {
    if (!applied && !hasActiveFilters(filters)) return []
    return sortNewest(filterContent(published, filters))
  }, [applied, filters, published])

  const searching = applied || hasActiveFilters(filters)

  return (
    <div>
      {/* ── Hero section ── */}
      <section className="hero-band relative overflow-hidden">
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.10] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />
        <div className="relative max-w-6xl mx-auto px-4 py-12 md:py-18">
          <div className="text-xs font-bold tracking-[0.28em] uppercase mb-3 section-eyebrow-light">
            Daily Infrastructure Intelligence · Pakistan
          </div>
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight"
            style={{ fontFamily: 'DM Serif Display, serif', textShadow: '0 2px 20px rgba(7,26,51,0.6)' }}
          >
            {BRAND.name}
          </h1>
          <p className="text-slate-200 text-base md:text-lg max-w-2xl mb-7 leading-relaxed">
            {BRAND.heroLine}
          </p>

          <div className="flex flex-wrap gap-2 mb-8">
            {BRAND.pipeline.map(step => (
              <span
                key={step}
                className="text-[10px] font-bold uppercase tracking-widest text-cyan-100 px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(18,184,214,0.14)', border: '1px solid rgba(18,184,214,0.28)' }}
              >
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
          <section className="anim-fade-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold user-ink" style={{ fontFamily: 'DM Serif Display, serif' }}>
                Search results — <span style={{ color: '#168DDB' }}>{results.length}</span>
              </h2>
              <button
                type="button"
                onClick={() => { setFilters(EMPTY_FILTERS); setApplied(false) }}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                style={{ color: '#E5484D', background: 'rgba(229,72,77,0.08)', border: '1px solid rgba(229,72,77,0.2)' }}
              >
                Clear filters
              </button>
            </div>
            {results.length === 0 ? (
              <EmptyState
                title="No matching intelligence"
                body="No infrastructure intelligence matching your filters has been published yet. Try adjusting hazard, location, infrastructure type or search terms."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {results.map((item, i) => <WatchCard key={item.id} item={item} index={i} />)}
              </div>
            )}
          </section>
        ) : (
          <>
            {/* Today's Watch */}
            <section className="mb-12">
              <div className="flex items-end justify-between gap-4 mb-5">
                <div>
                  <div className="section-eyebrow mb-1">Latest published items</div>
                  <h2 className="text-2xl font-bold user-ink" style={{ fontFamily: 'DM Serif Display, serif' }}>
                    {"Today's Watch"}
                  </h2>
                </div>
                <Link
                  to="/watch"
                  className="text-sm font-semibold flex items-center gap-1 transition-all hover:gap-2"
                  style={{ color: '#168DDB' }}
                >
                  View all <ArrowRight size={14} />
                </Link>
              </div>
              {watch.length === 0 ? (
                <EmptyState
                  title={"No items on Today's Watch yet"}
                  body="No infrastructure intelligence published yet. Published issues, advisories and solutions will appear here as soon as administrators release them."
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {watch.map((item, i) => <WatchCard key={item.id} item={item} index={i} />)}
                </div>
              )}
            </section>

            {/* Field Photos */}
            {published.some(a => a.images.length > 0) && (
              <section className="mb-12">
                <div className="section-eyebrow mb-1">Documentation</div>
                <h2 className="text-xl font-bold user-ink mb-5" style={{ fontFamily: 'DM Serif Display, serif' }}>
                  Field Photographs
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {published
                    .flatMap(item => item.images.map(img => ({ img, item })))
                    .slice(0, 8)
                    .map(({ img, item }) => (
                      <Link
                        key={img.id}
                        to={`/content/${item.id}`}
                        className="relative h-36 rounded-xl overflow-hidden group"
                        style={{ background: 'linear-gradient(135deg,#071A33,#123E68)' }}
                      >
                        <img
                          src={img.dataUrl}
                          alt={img.caption || item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-x-0 bottom-0 p-2 text-[11px] text-white truncate"
                          style={{ background: 'linear-gradient(to top,rgba(7,26,51,0.80),transparent)' }}>
                          {item.title}
                        </div>
                      </Link>
                    ))}
                </div>
              </section>
            )}

            {/* Explore cards */}
            <section className="mb-12">
              <div className="section-eyebrow mb-1">Browse by category</div>
              <h2 className="text-xl font-bold user-ink mb-5" style={{ fontFamily: 'DM Serif Display, serif' }}>
                Explore Infrastructure Intelligence
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {EXPLORE.map(({ kind, to, icon: Icon, color, bg, border, accent }, idx) => {
                  const meta = CONTENT_KINDS.find(k => k.id === kind)!
                  const count = getPublishedByKind(kind).length
                  return (
                    <Link
                      key={kind}
                      to={to}
                      className={`premium-card rounded-2xl p-5 group anim-fade-up delay-${(idx + 1) * 50}`}
                      style={{ borderTop: `3px solid ${accent}` }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                        style={{ background: bg, border: `1px solid ${border}` }}
                      >
                        <Icon size={18} style={{ color }} />
                      </div>
                      <div className="text-sm font-bold text-slate-800 mb-1 group-hover:transition-colors" style={{ color: 'inherit' }}>
                        {meta.plural}
                      </div>
                      <div className="text-xs text-slate-500 leading-relaxed mb-3">{meta.description}</div>
                      <div className="text-xs font-bold" style={{ color }}>
                        {count} published
                      </div>
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
    <div className="glass-panel rounded-2xl p-10 sm:p-14 text-center anim-scale">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
        style={{ background: 'linear-gradient(135deg,#eff6ff,#dbeafe)', border: '1px solid #bfdbfe' }}
      >
        <Shield size={28} style={{ color: '#168DDB' }} />
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-2" style={{ fontFamily: 'DM Serif Display, serif' }}>
        {title}
      </h3>
      <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">{body}</p>
    </div>
  )
}
