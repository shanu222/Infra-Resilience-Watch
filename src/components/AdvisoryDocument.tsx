import { MapPin, Calendar, AlertTriangle, CheckCircle, XCircle, Wrench, BookOpen, Phone, Shield, ChevronRight } from 'lucide-react'
import type { Advisory } from '../types'
import HazardIcon from './HazardIcon'
import { severityBgStrong } from './SeverityBadge'
import KindBadge from './KindBadge'
import { getVideoEmbedUrl } from '../utils'
import { BRAND } from '../data/constants'

interface Props {
  advisory: Advisory
  isPrint?: boolean
}

function Section({ title, icon: Icon, children, color = '#1E3A5F' }: { title: string; icon: React.ComponentType<{ size?: number }>; children: React.ReactNode; color?: string }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4 pb-3" style={{ borderBottom: `2px solid ${color}` }}>
        <span className="flex items-center justify-center w-8 h-8 rounded-lg text-white" style={{ background: color }}>
          <Icon size={15} />
        </span>
        <h2 className="text-base font-bold uppercase tracking-widest" style={{ color, fontFamily: 'IBM Plex Sans, sans-serif' }}>{title}</h2>
      </div>
      {children}
    </div>
  )
}

function ListItem({ text, type }: { text: string; type: 'check' | 'cross' | 'bullet' | 'numbered'; index?: number }) {
  if (type === 'check') return (
    <li className="flex gap-3 items-start mb-2">
      <CheckCircle size={16} className="mt-0.5 shrink-0" style={{ color: '#059669' }} />
      <span className="text-slate-700 text-sm leading-relaxed">{text}</span>
    </li>
  )
  if (type === 'cross') return (
    <li className="flex gap-3 items-start mb-2">
      <XCircle size={16} className="mt-0.5 shrink-0" style={{ color: '#DC2626' }} />
      <span className="text-slate-700 text-sm leading-relaxed">{text}</span>
    </li>
  )
  return (
    <li className="flex gap-3 items-start mb-2">
      <ChevronRight size={14} className="mt-0.5 shrink-0 text-slate-400" />
      <span className="text-slate-700 text-sm leading-relaxed">{text}</span>
    </li>
  )
}

export default function AdvisoryDocument({ advisory, isPrint = false }: Props) {
  const coverImage = advisory.images.find(i => i.isCover) || advisory.images[0]
  const otherImages = advisory.images.filter(i => i !== coverImage)
  const severityColor = severityBgStrong(advisory.severity)

  const location = [advisory.district, advisory.province].filter(Boolean).join(', ') || advisory.specificLocation || 'Pakistan'
  const dateStr = advisory.publishedAt
    ? new Date(advisory.publishedAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date(advisory.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="advisory-doc bg-white max-w-4xl mx-auto" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
      {/* Header Banner */}
      <div className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, #0A1628 0%, #1E3A5F 60%, #2563EB 100%)` }}>
        {coverImage && (
          <div className="absolute inset-0 opacity-20">
            <img src={coverImage.dataUrl} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="relative px-8 py-6">
          {/* Org header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-xs font-semibold tracking-widest text-cyan-300 uppercase mb-1">{BRAND.name}</div>
              <div className="text-white text-lg font-bold tracking-tight">Observe · Assess · Advise · Build Resilience</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-300 font-mono">{new Date().getFullYear()}-IRW</div>
              <div className="text-xs text-slate-400 font-mono">v{advisory.version}.0</div>
            </div>
          </div>

          {/* Severity stripe */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-xs font-bold uppercase tracking-widest" style={{ background: severityColor }}>
              <AlertTriangle size={12} />
              {advisory.severity}
            </div>
            <KindBadge kind={advisory.kind || 'advisory'} size="md" />
            {advisory.issueType && (
              <div className="text-xs text-slate-300 uppercase tracking-wider font-medium">{advisory.issueType}</div>
            )}
            <div className="text-xs text-slate-300 uppercase tracking-wider font-medium">{advisory.type}</div>
          </div>

          {/* Hazard + Title */}
          <div className="flex items-start gap-4 mb-4">
            <div className="shrink-0 mt-1">
              <HazardIcon hazard={advisory.hazard} size={28} />
            </div>
            <div>
              <div className="text-cyan-300 text-sm font-bold uppercase tracking-widest mb-1">{advisory.hazard}</div>
              <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight" style={{ fontFamily: 'DM Serif Display, serif' }}>
                {advisory.title}
              </h1>
            </div>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-4 text-xs text-slate-300">
            <span className="flex items-center gap-1.5">
              <MapPin size={12} />
              {location}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar size={12} />
              {dateStr}
            </span>
            {advisory.updatedAt !== advisory.createdAt && (
              <span className="text-slate-400">
                Updated: {new Date(advisory.updatedAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            )}
          </div>
        </div>

        {/* Infrastructure types */}
        {advisory.infrastructureTypes.length > 0 && (
          <div className="px-8 py-3 flex flex-wrap gap-2" style={{ background: 'rgba(0,0,0,0.3)' }}>
            {advisory.infrastructureTypes.map(type => (
              <span key={type} className="text-xs px-2.5 py-1 rounded text-cyan-200 font-medium" style={{ background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)' }}>
                {type}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Cover image (large) */}
      {coverImage && (
        <div className="w-full" style={{ height: 260, background: '#1E3A5F' }}>
          <img src={coverImage.dataUrl} alt={coverImage.caption || advisory.title} className="w-full h-full object-cover" />
          {coverImage.caption && (
            <div className="px-4 py-2 text-xs text-slate-500 italic bg-slate-50 border-b border-slate-100">{coverImage.caption}</div>
          )}
        </div>
      )}

      {/* Body */}
      <div className="px-8 py-8">

        {advisory.videoUrl && (
          <Section title="Video" icon={Shield} color="#5B21B6">
            {getVideoEmbedUrl(advisory.videoUrl) ? (
              <div className="rounded-xl overflow-hidden bg-slate-900 aspect-video">
                <iframe
                  src={getVideoEmbedUrl(advisory.videoUrl)!}
                  title={advisory.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <a href={advisory.videoUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline break-all">
                {advisory.videoUrl}
              </a>
            )}
          </Section>
        )}

        {advisory.shortSummary && (
          <Section title="Summary" icon={BookOpen} color="#0E7490">
            <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">{advisory.shortSummary}</p>
          </Section>
        )}

        {/* Current Situation */}
        {advisory.currentSituation && (
          <Section title="Current Situation" icon={AlertTriangle} color="#1E3A5F">
            <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">{advisory.currentSituation}</p>
            {advisory.observedConditions && (
              <div className="mt-4 p-4 rounded-xl" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Observed / Reported Conditions</div>
                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">{advisory.observedConditions}</p>
              </div>
            )}
          </Section>
        )}

        {/* Weather / Conditions */}
        {(advisory.weatherCondition || advisory.rainfallCondition || advisory.riverCondition || advisory.groundCondition) && (
          <Section title="Current Conditions" icon={Shield} color="#0E7490">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {advisory.weatherCondition && (
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                  <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Weather</div>
                  <div className="text-sm text-slate-700">{advisory.weatherCondition}</div>
                </div>
              )}
              {advisory.rainfallCondition && (
                <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100">
                  <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">Rainfall</div>
                  <div className="text-sm text-slate-700">{advisory.rainfallCondition}</div>
                </div>
              )}
              {advisory.riverCondition && (
                <div className="p-3 rounded-xl bg-cyan-50 border border-cyan-100">
                  <div className="text-xs font-semibold text-cyan-700 uppercase tracking-wider mb-1">River / Water Level</div>
                  <div className="text-sm text-slate-700">{advisory.riverCondition}</div>
                </div>
              )}
              {advisory.groundCondition && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                  <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">Ground Condition</div>
                  <div className="text-sm text-slate-700">{advisory.groundCondition}</div>
                </div>
              )}
              {advisory.visibility && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Visibility</div>
                  <div className="text-sm text-slate-700">{advisory.visibility}</div>
                </div>
              )}
              {advisory.otherCondition && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Other</div>
                  <div className="text-sm text-slate-700">{advisory.otherCondition}</div>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Key Risks */}
        {advisory.risks && (
          <Section title="Key Risks" icon={AlertTriangle} color="#B91C1C">
            <div className="p-4 rounded-xl" style={{ background: '#fff5f5', border: '1px solid #fecaca' }}>
              <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">{advisory.risks}</p>
            </div>
          </Section>
        )}

        {/* Immediate Actions */}
        {advisory.immediateActions.filter(Boolean).length > 0 && (
          <Section title="Immediate Actions" icon={AlertTriangle} color="#EA580C">
            <div className="p-4 rounded-xl" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
              <ul className="list-none m-0 p-0">
                {advisory.immediateActions.filter(Boolean).map((action, i) => (
                  <li key={i} className="flex gap-3 items-start mb-2 last:mb-0">
                    <span className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5" style={{ background: '#EA580C' }}>{i + 1}</span>
                    <span className="text-slate-700 text-sm leading-relaxed">{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Section>
        )}

        {/* Engineering Recommendations */}
        {advisory.engineeringRecommendations.filter(Boolean).length > 0 && (
          <Section title="Recommended Engineering Measures" icon={Wrench} color="#1D4ED8">
            <ul className="list-none m-0 p-0">
              {advisory.engineeringRecommendations.filter(Boolean).map((rec, i) => (
                <li key={i} className="flex gap-3 items-start mb-3 p-3 rounded-lg" style={{ background: '#f0f7ff', border: '1px solid #bfdbfe' }}>
                  <span className="shrink-0 w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white" style={{ background: '#1D4ED8' }}>{i + 1}</span>
                  <span className="text-slate-700 text-sm leading-relaxed">{rec}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Short-term measures */}
        {advisory.shortTermMeasures.filter(Boolean).length > 0 && (
          <Section title="Short-Term Measures" icon={Shield} color="#0369A1">
            <ul className="list-none m-0 p-0">
              {advisory.shortTermMeasures.filter(Boolean).map((m, i) => (
                <ListItem key={i} text={m} type="bullet" />
              ))}
            </ul>
          </Section>
        )}

        {/* Medium-term measures */}
        {advisory.mediumTermMeasures.filter(Boolean).length > 0 && (
          <Section title="Medium-Term Measures" icon={Shield} color="#0E7490">
            <ul className="list-none m-0 p-0">
              {advisory.mediumTermMeasures.filter(Boolean).map((m, i) => (
                <ListItem key={i} text={m} type="bullet" />
              ))}
            </ul>
          </Section>
        )}

        {/* Long-term / Build Back Better */}
        {advisory.longTermMeasures.filter(Boolean).length > 0 && (
          <Section title="Build Back Better — Resilience Measures" icon={Shield} color="#059669">
            <ul className="list-none m-0 p-0">
              {advisory.longTermMeasures.filter(Boolean).map((m, i) => (
                <ListItem key={i} text={m} type="bullet" />
              ))}
            </ul>
          </Section>
        )}

        {/* DOs and DON'Ts */}
        {(advisory.dos.filter(Boolean).length > 0 || advisory.donts.filter(Boolean).length > 0) && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4 pb-3" style={{ borderBottom: '2px solid #334155' }}>
              <span className="flex items-center justify-center w-8 h-8 rounded-lg text-white bg-slate-700">
                <CheckCircle size={15} />
              </span>
              <h2 className="text-base font-bold uppercase tracking-widest text-slate-700" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>Do's and Don'ts</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {advisory.dos.filter(Boolean).length > 0 && (
                <div className="p-4 rounded-xl" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle size={16} style={{ color: '#059669' }} />
                    <span className="text-sm font-bold uppercase tracking-wider" style={{ color: '#059669' }}>Do</span>
                  </div>
                  <ul className="list-none m-0 p-0">
                    {advisory.dos.filter(Boolean).map((d, i) => (
                      <ListItem key={i} text={d} type="check" />
                    ))}
                  </ul>
                </div>
              )}
              {advisory.donts.filter(Boolean).length > 0 && (
                <div className="p-4 rounded-xl" style={{ background: '#fff5f5', border: '1px solid #fecaca' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <XCircle size={16} style={{ color: '#DC2626' }} />
                    <span className="text-sm font-bold uppercase tracking-wider" style={{ color: '#DC2626' }}>Don't</span>
                  </div>
                  <ul className="list-none m-0 p-0">
                    {advisory.donts.filter(Boolean).map((d, i) => (
                      <ListItem key={i} text={d} type="cross" />
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Public Guidance */}
        {advisory.publicGuidance && (
          <Section title="Public / User Guidance" icon={BookOpen} color="#5B21B6">
            <div className="p-4 rounded-xl" style={{ background: '#faf5ff', border: '1px solid #ddd6fe' }}>
              <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">{advisory.publicGuidance}</p>
            </div>
          </Section>
        )}

        {/* Contact */}
        {advisory.contactInfo && (
          <Section title="Contact / Escalation" icon={Phone} color="#374151">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">{advisory.contactInfo}</p>
            </div>
          </Section>
        )}

        {/* Other images */}
        {otherImages.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4 pb-3" style={{ borderBottom: '2px solid #1E3A5F' }}>
              <h2 className="text-base font-bold uppercase tracking-widest text-slate-700">Site Photographs</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {otherImages.map(img => (
                <div key={img.id} className="rounded-xl overflow-hidden bg-slate-100">
                  <img src={img.dataUrl} alt={img.caption || 'Advisory photograph'} className="w-full h-40 object-cover" loading="lazy" />
                  {img.caption && <div className="p-2 text-xs text-slate-500 italic">{img.caption}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Takeaway */}
        {advisory.keyTakeaway && (
          <div className="mb-8 p-6 rounded-2xl" style={{ background: 'linear-gradient(135deg, #0A1628 0%, #1E3A5F 100%)' }}>
            <div className="text-xs font-bold uppercase tracking-widest text-cyan-300 mb-2">Key Takeaway</div>
            <p className="text-white text-sm leading-relaxed whitespace-pre-line">{advisory.keyTakeaway}</p>
          </div>
        )}

        {/* References */}
        {advisory.references && (
          <Section title="Sources / References" icon={BookOpen} color="#64748B">
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{advisory.references}</p>
          </Section>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
            <div>
              <span className="font-semibold text-slate-500">{BRAND.name}</span>
              <span className="mx-2">·</span>
              <span>Version {advisory.version}.0</span>
              {advisory.publishedAt && (
                <>
                  <span className="mx-2">·</span>
                  <span>Published {new Date(advisory.publishedAt).toLocaleDateString('en-PK')}</span>
                </>
              )}
            </div>
            <div className="font-mono">{advisory.id.slice(0, 12).toUpperCase()}</div>
          </div>
          <p className="mt-3 text-xs text-slate-400 leading-relaxed">
            This brief is issued through Infrastructure Resilience Watch. Content is based on information provided by authorized administrators and should be used together with professional engineering assessment. For emergency situations, contact relevant authorities immediately.
          </p>
        </div>
      </div>
    </div>
  )
}
