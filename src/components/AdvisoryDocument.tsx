import { AlertTriangle, CheckCircle, XCircle, Wrench, BookOpen, Phone, Shield, ChevronRight, Play } from 'lucide-react'
import type { Advisory } from '../types'
import HazardIcon from './HazardIcon'
import { getVideoEmbedUrl, formatDateLong, locationLabel, sanitizeDocText } from '../utils'
import { BRAND } from '../data/constants'
import { backgroundLayer, themeOf } from '../data/documentDesign'
import { useApp } from '../contexts/AppContext'

function DocSection({ n, title, color, children }: { n: string; title: string; color: string; children: React.ReactNode }) {
  return (
    <section
      className="doc-section mb-6 rounded-2xl p-4 sm:p-5"
      style={{
        background: `linear-gradient(135deg, ${color}14 0%, ${color}08 55%, rgba(255,255,255,0.72) 100%)`,
        border: `1px solid ${color}35`,
        boxShadow: `0 4px 18px ${color}12`,
      }}
    >
      <div className="flex items-center gap-3 mb-4 pb-2" style={{ borderBottom: `2px solid ${color}` }}>
        <span
          className="w-8 h-8 rounded-lg text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-sm"
          style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
        >
          {n}
        </span>
        <h2
          className="text-xs sm:text-sm font-bold uppercase tracking-[0.12em] sm:tracking-[0.16em] break-words min-w-0"
          style={{ color, fontFamily: 'IBM Plex Sans, sans-serif' }}
        >
          {title}
        </h2>
      </div>
      {children}
    </section>
  )
}

export default function AdvisoryDocument({ advisory }: { advisory: Advisory; isPrint?: boolean }) {
  const { settings } = useApp()
  const theme = themeOf(advisory.documentTheme)
  const coverImage = advisory.images.find(i => i.isCover) || advisory.images[0]
  const otherImages = advisory.images.filter(i => i !== coverImage)
  const location = locationLabel(advisory)
  const dateStr = formatDateLong(advisory.publishedAt || advisory.createdAt)
  const number = advisory.advisoryNumber || `IRW-${new Date(advisory.createdAt).getFullYear()}-DRAFT`
  const orgLogo = advisory.orgLogo || settings.orgLogo
  const wingLogo = advisory.wingLogo || settings.wingLogo
  const advisoryLogo = settings.advisoryLogo
  const embed = getVideoEmbedUrl(advisory.videoUrl)
  const bg = backgroundLayer(advisory.backgroundTemplate, advisory.customBackground)
  const contentTint = `linear-gradient(180deg, ${theme.header}12 0%, ${theme.accent}0a 40%, ${theme.band}14 100%)`

  return (
    <article
      className="advisory-doc w-full max-w-4xl mx-auto overflow-hidden min-w-0"
      style={{ fontFamily: 'IBM Plex Sans, sans-serif', background: 'transparent' }}
    >
      <div className="relative min-h-full">
        <div className="absolute inset-0 pointer-events-none doc-bg-layer" style={bg} />
        <div className="relative doc-content-layer" style={{ background: contentTint }}>

          <header
            className="doc-header relative overflow-hidden text-white"
            style={{ background: `linear-gradient(135deg, ${theme.header} 0%, ${theme.accent} 55%, ${theme.band}88 100%)` }}
          >
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(90deg, transparent 0 22px, rgba(255,255,255,0.18) 22px 23px), radial-gradient(circle at 90% 10%, rgba(255,255,255,0.15), transparent 40%)',
              }}
            />
            <div className="relative px-4 sm:px-6 md:px-8 pt-5 sm:pt-6 pb-4 sm:pb-5">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-5">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 min-w-0">
                  {orgLogo ? (
                    <img src={orgLogo} alt="Organization logo" className="h-12 w-auto object-contain bg-white/10 rounded-md p-1" />
                  ) : (
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}
                    >
                      <Shield size={22} />
                    </div>
                  )}
                  {wingLogo && <img src={wingLogo} alt="Wing logo" className="h-12 w-auto object-contain bg-white/10 rounded-md p-1" />}
                  {advisoryLogo && <img src={advisoryLogo} alt="Advisory logo" className="h-12 w-auto object-contain bg-white/10 rounded-md p-1" />}
                  <div>
                    <div className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: theme.band }}>{BRAND.name}</div>
                    <div className="text-sm font-semibold tracking-wide">{advisory.type || 'INFRASTRUCTURE ADVISORY'}</div>
                  </div>
                </div>
                <div className="text-left sm:text-right text-[10px] sm:text-[11px] font-mono text-white/80 shrink-0">
                  <div className="break-all sm:break-normal">Advisory No: {number}</div>
                  <div>v{advisory.version}.0</div>
                </div>
              </div>

              <div className="h-1.5 rounded-full mb-5 shadow-sm" style={{ background: theme.band }} />

              <div className="flex items-start gap-4">
                <HazardIcon hazard={advisory.hazard} size={26} />
                <div className="min-w-0">
                  <div className="text-[11px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: theme.band }}>{advisory.hazard}</div>
                  <h1
                    className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight break-words"
                    style={{ fontFamily: 'DM Serif Display, serif' }}
                  >
                    {advisory.title || 'Untitled advisory'}
                  </h1>
                </div>
              </div>

              <div className="mt-4 sm:mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-[10px] sm:text-[11px]">
                <Meta label="Date" value={dateStr} />
                <Meta label="Location" value={advisory.specificLocation || location} />
                <Meta label="District" value={advisory.district || '—'} />
                <Meta label="Province" value={advisory.province || 'Pakistan'} />
              </div>
            </div>
            {advisory.infrastructureTypes.length > 0 && (
              <div className="px-4 sm:px-6 md:px-8 py-3 flex flex-wrap gap-2" style={{ background: 'rgba(0,0,0,0.22)' }}>
                {advisory.infrastructureTypes.map(type => (
                  <span
                    key={type}
                    className="text-[10px] px-2.5 py-1 rounded font-semibold uppercase tracking-wider"
                    style={{ background: 'rgba(255,255,255,0.14)', color: '#E0F7FA', border: '1px solid rgba(255,255,255,0.2)' }}
                  >
                    {type}
                  </span>
                ))}
              </div>
            )}
          </header>

          {coverImage && (
            <figure className="w-full bg-slate-900">
              <img
                src={coverImage.dataUrl}
                alt={coverImage.caption || advisory.title}
                className="w-full h-48 sm:h-56 md:h-64 object-cover"
              />
              {coverImage.caption && (
                <figcaption
                  className="px-4 sm:px-6 md:px-8 py-2 text-xs italic break-words"
                  style={{ color: '#475569', background: 'linear-gradient(90deg, rgba(232,244,252,0.95), rgba(245,249,253,0.95))' }}
                >
                  FIGURE 01 · {coverImage.caption}
                </figcaption>
              )}
            </figure>
          )}

          <div className="px-4 sm:px-6 md:px-8 py-6 sm:py-8">
            {advisory.shortSummary && sanitizeDocText(advisory.shortSummary) && (
              <DocSection n="00" title="Executive Brief" color={theme.accent}>
                <p className="text-slate-700 text-sm leading-relaxed">{sanitizeDocText(advisory.shortSummary)}</p>
              </DocSection>
            )}

            {advisory.currentSituation && (
              <DocSection n="01" title="Situation / Observation" color={theme.accent}>
                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">{sanitizeDocText(advisory.currentSituation)}</p>
              </DocSection>
            )}

            {advisory.identifiedProblem && (
              <DocSection n="02" title="Identified Problem" color="#E5484D">
                <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg,#fff1f2,#ffe4e6)', border: '1px solid #fecdd3' }}>
                  <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">{sanitizeDocText(advisory.identifiedProblem)}</p>
                </div>
              </DocSection>
            )}

            {advisory.affectedInfrastructure.filter(Boolean).length > 0 && (
              <DocSection n="03" title="Infrastructure at Risk" color="#168DDB">
                <div className="flex flex-wrap gap-2">
                  {advisory.affectedInfrastructure.filter(Boolean).map(item => (
                    <span
                      key={item}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                      style={{ background: 'linear-gradient(135deg,#eff6ff,#dbeafe)', color: '#1E3A8A', border: '1px solid #bfdbfe' }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </DocSection>
            )}

            {advisory.risks && (
              <DocSection n="04" title="Risk / Potential Impact" color="#F47B20">
                <div className="p-4 rounded-xl flex gap-3" style={{ background: 'linear-gradient(135deg,#fff7ed,#ffedd5)', border: '1px solid #fed7aa' }}>
                  <AlertTriangle size={18} className="shrink-0 mt-0.5" style={{ color: '#F47B20' }} />
                  <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">{sanitizeDocText(advisory.risks)}</p>
                </div>
              </DocSection>
            )}

            {advisory.observedConditions && (
              <DocSection n="05" title="Key Observations" color={theme.ink}>
                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">{sanitizeDocText(advisory.observedConditions)}</p>
                {(advisory.weatherCondition || advisory.rainfallCondition || advisory.riverCondition || advisory.groundCondition) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                    {advisory.weatherCondition && <Fact label="Weather" value={advisory.weatherCondition} color={theme.accent} />}
                    {advisory.rainfallCondition && <Fact label="Rainfall" value={advisory.rainfallCondition} color="#168DDB" />}
                    {advisory.riverCondition && <Fact label="River / Water" value={advisory.riverCondition} color="#12B8D6" />}
                    {advisory.groundCondition && <Fact label="Ground" value={advisory.groundCondition} color="#10A99A" />}
                    {advisory.visibility && <Fact label="Visibility" value={advisory.visibility} color="#7357D9" />}
                    {advisory.otherCondition && <Fact label="Other" value={advisory.otherCondition} color="#64748B" />}
                  </div>
                )}
              </DocSection>
            )}

            {advisory.engineeringRecommendations.filter(Boolean).length > 0 && (
              <DocSection n="06" title="Recommended Actions" color={theme.accent}>
                <ul className="list-none m-0 p-0 space-y-2">
                  {advisory.engineeringRecommendations.filter(Boolean).map((rec, i) => (
                    <li
                      key={i}
                      className="flex gap-3 items-start p-3 rounded-xl"
                      style={{ background: 'linear-gradient(135deg,#eff6ff,#dbeafe)', border: '1px solid #bfdbfe' }}
                    >
                      <Wrench size={15} className="mt-0.5 shrink-0" style={{ color: theme.accent }} />
                      <span className="text-slate-700 text-sm leading-relaxed">{rec}</span>
                    </li>
                  ))}
                </ul>
              </DocSection>
            )}

            {advisory.longTermMeasures.filter(Boolean).length > 0 && (
              <DocSection n="07" title="Resilience Measures" color="#20B26B">
                <ul className="list-none m-0 p-0">
                  {advisory.longTermMeasures.filter(Boolean).map((m, i) => (
                    <li key={i} className="flex gap-3 items-start mb-2">
                      <Shield size={15} className="mt-0.5 shrink-0" style={{ color: '#20B26B' }} />
                      <span className="text-slate-700 text-sm leading-relaxed">{m}</span>
                    </li>
                  ))}
                </ul>
              </DocSection>
            )}

            {advisory.immediateActions.filter(Boolean).length > 0 && (
              <DocSection n="08" title="Immediate Actions" color="#E5484D">
                <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg,#fff1f2,#ffe4e6)', border: '1px solid #fecdd3' }}>
                  {advisory.immediateActions.filter(Boolean).map((action, i) => (
                    <div key={i} className="flex gap-3 items-start mb-2 last:mb-0">
                      <span
                        className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                        style={{ background: 'linear-gradient(135deg,#E5484D,#c0363b)' }}
                      >
                        {i + 1}
                      </span>
                      <span className="text-slate-700 text-sm leading-relaxed">{action}</span>
                    </div>
                  ))}
                </div>
              </DocSection>
            )}

            {advisory.shortTermMeasures.filter(Boolean).length > 0 && (
              <DocSection n="09" title="Short-Term Measures" color="#F47B20">
                {advisory.shortTermMeasures.filter(Boolean).map((m, i) => (
                  <div key={i} className="flex gap-3 items-start mb-2">
                    <ChevronRight size={14} className="mt-0.5 text-orange-500" />
                    <span className="text-slate-700 text-sm leading-relaxed">{m}</span>
                  </div>
                ))}
              </DocSection>
            )}

            {advisory.mediumTermMeasures.filter(Boolean).length > 0 && (
              <DocSection n="10" title="Medium-Term Measures" color="#168DDB">
                {advisory.mediumTermMeasures.filter(Boolean).map((m, i) => (
                  <div key={i} className="flex gap-3 items-start mb-2">
                    <ChevronRight size={14} className="mt-0.5" style={{ color: '#168DDB' }} />
                    <span className="text-slate-700 text-sm leading-relaxed">{m}</span>
                  </div>
                ))}
              </DocSection>
            )}

            {otherImages.length > 0 && (
              <DocSection n="11" title="Visual Evidence" color={theme.ink}>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {otherImages.map((img, i) => (
                    <figure key={img.id} className="rounded-xl overflow-hidden border border-slate-200/80 shadow-sm">
                      <img src={img.dataUrl} alt={img.caption || 'Field photograph'} className="w-full h-40 object-cover" />
                      <figcaption className="p-2 text-[11px] text-slate-500 break-words" style={{ background: 'rgba(255,255,255,0.85)' }}>
                        FIGURE {String(i + 2).padStart(2, '0')}{img.caption ? ` · ${img.caption}` : ''}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </DocSection>
            )}

            {advisory.videoUrl && (
              <DocSection n="12" title="Related Video" color="#7357D9">
                <div className="rounded-2xl overflow-hidden border border-purple-200 shadow-sm doc-video-block">
                  {embed ? (
                    <div className="aspect-video doc-video-embed bg-slate-900">
                      <iframe src={embed} title={advisory.videoTitle || advisory.title} className="w-full h-full" allowFullScreen />
                    </div>
                  ) : advisory.videoThumbnail ? (
                    <div className="relative doc-video-fallback">
                      <img src={advisory.videoThumbnail} alt="" className="w-full h-48 object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                        <div className="w-14 h-14 rounded-full flex items-center justify-center bg-purple-600/90 border-2 border-white/40">
                          <Play className="text-white ml-1" size={28} fill="white" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="flex items-center gap-3 p-5 doc-video-fallback"
                      style={{ background: 'linear-gradient(135deg,#312e81,#5b21b6)' }}
                    >
                      <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white/15 border border-white/25">
                        <Play size={20} className="text-white ml-0.5" fill="white" />
                      </div>
                      <div className="text-sm font-semibold text-white">Field video briefing included</div>
                    </div>
                  )}
                  {(advisory.videoTitle || advisory.videoDescription) && (
                    <div className="p-4" style={{ background: 'linear-gradient(135deg,#faf5ff,#ede9fe)' }}>
                      {advisory.videoTitle && <div className="text-sm font-bold text-slate-800 break-words">{advisory.videoTitle}</div>}
                      {advisory.videoDescription && (
                        <p className="text-xs text-slate-600 mt-2 break-words">{sanitizeDocText(advisory.videoDescription)}</p>
                      )}
                    </div>
                  )}
                </div>
              </DocSection>
            )}

            {(advisory.dos.filter(Boolean).length > 0 || advisory.donts.filter(Boolean).length > 0) && (
              <div className="doc-section grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {advisory.dos.filter(Boolean).length > 0 && (
                  <div className="p-4 rounded-2xl" style={{ background: 'linear-gradient(135deg,#ecfdf5,#d1fae5)', border: '1px solid #a7f3d0' }}>
                    <div className="flex items-center gap-2 mb-3 font-bold text-sm" style={{ color: '#20B26B' }}>
                      <CheckCircle size={16} /> Do
                    </div>
                    {advisory.dos.filter(Boolean).map((d, i) => <p key={i} className="text-sm text-slate-700 mb-2">{d}</p>)}
                  </div>
                )}
                {advisory.donts.filter(Boolean).length > 0 && (
                  <div className="p-4 rounded-2xl" style={{ background: 'linear-gradient(135deg,#fff1f2,#ffe4e6)', border: '1px solid #fecdd3' }}>
                    <div className="flex items-center gap-2 mb-3 font-bold text-sm" style={{ color: '#E5484D' }}>
                      <XCircle size={16} /> Don{"'"}t
                    </div>
                    {advisory.donts.filter(Boolean).map((d, i) => <p key={i} className="text-sm text-slate-700 mb-2">{d}</p>)}
                  </div>
                )}
              </div>
            )}

            {advisory.publicGuidance && (
              <DocSection n="13" title="Public Guidance" color="#7357D9">
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{sanitizeDocText(advisory.publicGuidance)}</p>
              </DocSection>
            )}

            {advisory.keyTakeaway && (
              <div
                className="doc-section mb-6 p-6 rounded-2xl text-white shadow-lg"
                style={{ background: `linear-gradient(135deg, ${theme.header}, ${theme.accent} 55%, ${theme.band}aa)` }}
              >
                <div className="text-[10px] font-bold uppercase tracking-[0.22em] mb-2" style={{ color: theme.band }}>Key Takeaway</div>
                <p className="text-sm leading-relaxed whitespace-pre-line">{sanitizeDocText(advisory.keyTakeaway)}</p>
              </div>
            )}

            {advisory.contactInfo && (
              <DocSection n="14" title="Contact / Escalation" color="#374151">
                <p className="text-sm text-slate-700 whitespace-pre-line flex gap-2">
                  <Phone size={14} className="mt-0.5 shrink-0" />{sanitizeDocText(advisory.contactInfo)}
                </p>
              </DocSection>
            )}

            {advisory.references && sanitizeDocText(advisory.references) && (
              <DocSection n="15" title="Sources / References" color="#64748B">
                <p className="text-sm text-slate-600 whitespace-pre-line flex gap-2">
                  <BookOpen size={14} className="mt-0.5 shrink-0" />{sanitizeDocText(advisory.references)}
                </p>
              </DocSection>
            )}

            <footer
              className="mt-8 pt-5 rounded-2xl px-4 py-4 text-[11px]"
              style={{
                borderTop: `3px solid ${theme.band}`,
                background: `linear-gradient(135deg, ${theme.header}10, ${theme.accent}08, ${theme.band}12)`,
                color: '#475569',
              }}
            >
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <strong className="text-slate-700">{BRAND.name}</strong>
                  <span className="mx-2">·</span>
                  {number}
                  <span className="mx-2">·</span>
                  {dateStr}
                </div>
                <div className="print-only font-semibold" style={{ color: theme.accent }}>Official circulation copy</div>
              </div>
              <p className="mt-3 leading-relaxed">
                Issued through Infrastructure Resilience Watch. Content is based on information entered by authorized administrators and should be used with professional engineering judgement.
              </p>
            </footer>
          </div>
        </div>
      </div>
    </article>
  )
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="uppercase tracking-widest text-white/60 mb-0.5">{label}</div>
      <div className="font-semibold text-white break-words">{value}</div>
    </div>
  )
}

function Fact({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      className="p-3 rounded-xl"
      style={{ background: `linear-gradient(135deg, ${color}12, rgba(255,255,255,0.85))`, border: `1px solid ${color}35` }}
    >
      <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color }}>{label}</div>
      <div className="text-sm text-slate-700 break-words">{value}</div>
    </div>
  )
}
