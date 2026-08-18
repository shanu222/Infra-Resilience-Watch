import { AlertTriangle, CheckCircle, XCircle, Wrench, BookOpen, Phone, Shield, ChevronRight, Play } from 'lucide-react'
import type { Advisory } from '../types'
import HazardIcon from './HazardIcon'
import { getVideoEmbedUrl, formatDateLong, locationLabel } from '../utils'
import { BRAND } from '../data/constants'
import { backgroundLayer, themeOf } from '../data/documentDesign'
import { useApp } from '../contexts/AppContext'

function DocSection({ n, title, color, children }: { n: string; title: string; color: string; children: React.ReactNode }) {
  return (
    <section className="doc-section mb-7">
      <div className="flex items-center gap-3 mb-4 pb-2" style={{ borderBottom: `2px solid ${color}` }}>
        <span className="w-8 h-8 rounded-lg text-white text-xs font-bold flex items-center justify-center shrink-0" style={{ background: color }}>{n}</span>
        <h2 className="text-sm font-bold uppercase tracking-[0.16em]" style={{ color, fontFamily: 'IBM Plex Sans, sans-serif' }}>{title}</h2>
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

  return (
    <article className="advisory-doc bg-white max-w-4xl mx-auto overflow-hidden" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
      <div className="relative min-h-full">
        <div className="absolute inset-0 pointer-events-none" style={bg} />
        <div className="relative" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.94) 210px, rgba(255,255,255,0.97) 100%)' }}>

          <header className="doc-header relative overflow-hidden text-white" style={{ background: `linear-gradient(135deg, ${theme.header} 0%, ${theme.accent} 100%)` }}>
            <div className="absolute inset-0 opacity-15" style={{
              backgroundImage: 'repeating-linear-gradient(90deg, transparent 0 22px, rgba(255,255,255,0.18) 22px 23px)',
            }} />
            <div className="relative px-8 pt-6 pb-5">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div className="flex items-center gap-3">
                  {orgLogo ? <img src={orgLogo} alt="Organization logo" className="h-12 w-auto object-contain bg-white/10 rounded-md p-1" /> : (
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
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
                <div className="text-right text-[11px] font-mono text-white/80">
                  <div>Advisory No: {number}</div>
                  <div>v{advisory.version}.0</div>
                </div>
              </div>

              <div className="h-1.5 rounded-full mb-5" style={{ background: theme.band }} />

              <div className="flex items-start gap-4">
                <HazardIcon hazard={advisory.hazard} size={26} />
                <div className="min-w-0">
                  <div className="text-[11px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: theme.band }}>{advisory.hazard}</div>
                  <h1 className="text-2xl md:text-3xl font-bold leading-tight" style={{ fontFamily: 'DM Serif Display, serif' }}>{advisory.title || 'Untitled advisory'}</h1>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px]">
                <Meta label="Date" value={dateStr} />
                <Meta label="Location" value={advisory.specificLocation || location} />
                <Meta label="District" value={advisory.district || '—'} />
                <Meta label="Province" value={advisory.province || 'Pakistan'} />
              </div>
            </div>
            {advisory.infrastructureTypes.length > 0 && (
              <div className="px-8 py-3 flex flex-wrap gap-2" style={{ background: 'rgba(0,0,0,0.22)' }}>
                {advisory.infrastructureTypes.map(type => (
                  <span key={type} className="text-[10px] px-2.5 py-1 rounded font-semibold uppercase tracking-wider" style={{ background: 'rgba(255,255,255,0.12)', color: '#E0F7FA' }}>{type}</span>
                ))}
              </div>
            )}
          </header>

          {coverImage && (
            <figure className="w-full bg-slate-900">
              <img src={coverImage.dataUrl} alt={coverImage.caption || advisory.title} className="w-full h-64 object-cover" />
              {coverImage.caption && (
                <figcaption className="px-8 py-2 text-xs italic text-slate-600 bg-white/90">FIGURE 01 · {coverImage.caption}</figcaption>
              )}
            </figure>
          )}

          <div className="px-8 py-8">
            {advisory.shortSummary && (
              <DocSection n="00" title="Executive Brief" color={theme.accent}>
                <p className="text-slate-700 text-sm leading-relaxed">{advisory.shortSummary}</p>
              </DocSection>
            )}

            {advisory.currentSituation && (
              <DocSection n="01" title="Situation / Observation" color={theme.accent}>
                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">{advisory.currentSituation}</p>
              </DocSection>
            )}

            {advisory.identifiedProblem && (
              <DocSection n="02" title="Identified Problem" color="#D64545">
                <div className="p-4 rounded-xl" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
                  <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">{advisory.identifiedProblem}</p>
                </div>
              </DocSection>
            )}

            {advisory.affectedInfrastructure.filter(Boolean).length > 0 && (
              <DocSection n="03" title="Infrastructure at Risk" color="#1769AA">
                <div className="flex flex-wrap gap-2">
                  {advisory.affectedInfrastructure.filter(Boolean).map(item => (
                    <span key={item} className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: '#EFF6FF', color: '#1E3A8A', border: '1px solid #BFDBFE' }}>{item}</span>
                  ))}
                </div>
              </DocSection>
            )}

            {advisory.risks && (
              <DocSection n="04" title="Risk / Potential Impact" color="#D64545">
                <div className="p-4 rounded-xl flex gap-3" style={{ background: '#FFF7ED', border: '1px solid #FED7AA' }}>
                  <AlertTriangle size={18} className="shrink-0 mt-0.5" style={{ color: '#D64545' }} />
                  <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">{advisory.risks}</p>
                </div>
              </DocSection>
            )}

            {advisory.observedConditions && (
              <DocSection n="05" title="Key Observations" color={theme.ink}>
                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">{advisory.observedConditions}</p>
                {(advisory.weatherCondition || advisory.rainfallCondition || advisory.riverCondition || advisory.groundCondition) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                    {advisory.weatherCondition && <Fact label="Weather" value={advisory.weatherCondition} />}
                    {advisory.rainfallCondition && <Fact label="Rainfall" value={advisory.rainfallCondition} />}
                    {advisory.riverCondition && <Fact label="River / Water" value={advisory.riverCondition} />}
                    {advisory.groundCondition && <Fact label="Ground" value={advisory.groundCondition} />}
                    {advisory.visibility && <Fact label="Visibility" value={advisory.visibility} />}
                    {advisory.otherCondition && <Fact label="Other" value={advisory.otherCondition} />}
                  </div>
                )}
              </DocSection>
            )}

            {advisory.engineeringRecommendations.filter(Boolean).length > 0 && (
              <DocSection n="06" title="Recommended Actions" color={theme.accent}>
                <ul className="list-none m-0 p-0 space-y-2">
                  {advisory.engineeringRecommendations.filter(Boolean).map((rec, i) => (
                    <li key={i} className="flex gap-3 items-start p-3 rounded-xl" style={{ background: '#F0F7FF', border: '1px solid #BFDBFE' }}>
                      <Wrench size={15} className="mt-0.5 shrink-0" style={{ color: theme.accent }} />
                      <span className="text-slate-700 text-sm leading-relaxed">{rec}</span>
                    </li>
                  ))}
                </ul>
              </DocSection>
            )}

            {advisory.longTermMeasures.filter(Boolean).length > 0 && (
              <DocSection n="07" title="Resilience Measures" color="#168A5B">
                <ul className="list-none m-0 p-0">
                  {advisory.longTermMeasures.filter(Boolean).map((m, i) => (
                    <li key={i} className="flex gap-3 items-start mb-2">
                      <Shield size={15} className="mt-0.5 shrink-0" style={{ color: '#168A5B' }} />
                      <span className="text-slate-700 text-sm leading-relaxed">{m}</span>
                    </li>
                  ))}
                </ul>
              </DocSection>
            )}

            {advisory.immediateActions.filter(Boolean).length > 0 && (
              <DocSection n="08" title="Immediate Actions" color="#D64545">
                <div className="p-4 rounded-xl" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
                  {advisory.immediateActions.filter(Boolean).map((action, i) => (
                    <div key={i} className="flex gap-3 items-start mb-2 last:mb-0">
                      <span className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: '#D64545' }}>{i + 1}</span>
                      <span className="text-slate-700 text-sm leading-relaxed">{action}</span>
                    </div>
                  ))}
                </div>
              </DocSection>
            )}

            {advisory.shortTermMeasures.filter(Boolean).length > 0 && (
              <DocSection n="09" title="Short-Term Measures" color="#EA580C">
                {advisory.shortTermMeasures.filter(Boolean).map((m, i) => (
                  <div key={i} className="flex gap-3 items-start mb-2">
                    <ChevronRight size={14} className="mt-0.5 text-orange-500" />
                    <span className="text-slate-700 text-sm leading-relaxed">{m}</span>
                  </div>
                ))}
              </DocSection>
            )}

            {advisory.mediumTermMeasures.filter(Boolean).length > 0 && (
              <DocSection n="10" title="Medium-Term Measures" color="#1769AA">
                {advisory.mediumTermMeasures.filter(Boolean).map((m, i) => (
                  <div key={i} className="flex gap-3 items-start mb-2">
                    <ChevronRight size={14} className="mt-0.5" style={{ color: '#1769AA' }} />
                    <span className="text-slate-700 text-sm leading-relaxed">{m}</span>
                  </div>
                ))}
              </DocSection>
            )}

            {advisory.longTermMeasures.filter(Boolean).length > 0 && advisory.engineeringRecommendations.filter(Boolean).length === 0 ? null : null}

            {otherImages.length > 0 && (
              <DocSection n="11" title="Visual Evidence" color={theme.ink}>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {otherImages.map((img, i) => (
                    <figure key={img.id} className="rounded-xl overflow-hidden bg-slate-100">
                      <img src={img.dataUrl} alt={img.caption || 'Field photograph'} className="w-full h-40 object-cover" />
                      <figcaption className="p-2 text-[11px] text-slate-500">
                        FIGURE {String(i + 2).padStart(2, '0')}{img.caption ? ` · ${img.caption}` : ''}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </DocSection>
            )}

            {advisory.videoUrl && (
              <DocSection n="12" title="Related Video" color="#5B21B6">
                <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-900">
                  {embed ? (
                    <div className="aspect-video">
                      <iframe src={embed} title={advisory.videoTitle || advisory.title} className="w-full h-full" allowFullScreen />
                    </div>
                  ) : advisory.videoThumbnail ? (
                    <a href={advisory.videoUrl} target="_blank" rel="noreferrer" className="block relative">
                      <img src={advisory.videoThumbnail} alt="" className="w-full h-48 object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center"><Play className="text-white" size={36} /></div>
                    </a>
                  ) : (
                    <a href={advisory.videoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-4 text-cyan-300 text-sm">
                      <Play size={16} /> Watch field video
                    </a>
                  )}
                  {(advisory.videoTitle || advisory.videoDescription || advisory.videoDuration) && (
                    <div className="p-4 bg-white">
                      {advisory.videoTitle && <div className="text-sm font-bold text-slate-800">{advisory.videoTitle}</div>}
                      {advisory.videoDuration && <div className="text-[11px] text-slate-500 mt-0.5">Duration: {advisory.videoDuration}</div>}
                      {advisory.videoDescription && <p className="text-xs text-slate-600 mt-2">{advisory.videoDescription}</p>}
                    </div>
                  )}
                </div>
              </DocSection>
            )}

            {(advisory.dos.filter(Boolean).length > 0 || advisory.donts.filter(Boolean).length > 0) && (
              <div className="doc-section grid grid-cols-1 md:grid-cols-2 gap-4 mb-7">
                {advisory.dos.filter(Boolean).length > 0 && (
                  <div className="p-4 rounded-xl" style={{ background: '#ECFDF5', border: '1px solid #A7F3D0' }}>
                    <div className="flex items-center gap-2 mb-3 font-bold text-sm" style={{ color: '#168A5B' }}><CheckCircle size={16} /> Do</div>
                    {advisory.dos.filter(Boolean).map((d, i) => <p key={i} className="text-sm text-slate-700 mb-2">{d}</p>)}
                  </div>
                )}
                {advisory.donts.filter(Boolean).length > 0 && (
                  <div className="p-4 rounded-xl" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
                    <div className="flex items-center gap-2 mb-3 font-bold text-sm" style={{ color: '#D64545' }}><XCircle size={16} /> Don{"'"}t</div>
                    {advisory.donts.filter(Boolean).map((d, i) => <p key={i} className="text-sm text-slate-700 mb-2">{d}</p>)}
                  </div>
                )}
              </div>
            )}

            {advisory.publicGuidance && (
              <DocSection n="13" title="Public Guidance" color="#5B21B6">
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{advisory.publicGuidance}</p>
              </DocSection>
            )}

            {advisory.keyTakeaway && (
              <div className="doc-section mb-7 p-6 rounded-2xl text-white" style={{ background: `linear-gradient(135deg, ${theme.header}, ${theme.accent})` }}>
                <div className="text-[10px] font-bold uppercase tracking-[0.22em] mb-2" style={{ color: theme.band }}>Key Takeaway</div>
                <p className="text-sm leading-relaxed whitespace-pre-line">{advisory.keyTakeaway}</p>
              </div>
            )}

            {advisory.contactInfo && (
              <DocSection n="14" title="Contact / Escalation" color="#374151">
                <p className="text-sm text-slate-700 whitespace-pre-line flex gap-2"><Phone size={14} className="mt-0.5" />{advisory.contactInfo}</p>
              </DocSection>
            )}

            {advisory.references && (
              <DocSection n="15" title="Sources / References" color="#64748B">
                <p className="text-sm text-slate-600 whitespace-pre-line flex gap-2"><BookOpen size={14} className="mt-0.5" />{advisory.references}</p>
              </DocSection>
            )}

            <footer className="mt-8 pt-5 border-t border-slate-200 text-[11px] text-slate-500">
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <strong className="text-slate-700">{BRAND.name}</strong>
                  <span className="mx-2">·</span>
                  {number}
                  <span className="mx-2">·</span>
                  {dateStr}
                </div>
                <div className="print-only">Official circulation copy · print/PDF</div>
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
    <div>
      <div className="uppercase tracking-widest text-white/60 mb-0.5">{label}</div>
      <div className="font-semibold text-white">{value}</div>
    </div>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">{label}</div>
      <div className="text-sm text-slate-700">{value}</div>
    </div>
  )
}
