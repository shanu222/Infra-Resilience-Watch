import { AlertTriangle, Check, Play, Shield, X } from 'lucide-react'
import type { Advisory } from '../types'
import HazardIcon from './HazardIcon'
import { formatDateLong, getVideoEmbedUrl, locationLabel, sanitizeDocText } from '../utils'
import { BRAND, normalizeSeverity } from '../data/constants'
import {
  ACTION_PHASE_COLOR,
  DOC_ACCENT,
  SECTION_COLOR,
  SEVERITY_COLOR,
  backgroundLayer,
  hazardColor,
  themeOf,
} from '../data/documentDesign'
import { useApp } from '../contexts/AppContext'

/* ------------------------------------------------------------------ *
 * Document primitives — the browser twins of the PDF blocks
 * ------------------------------------------------------------------ */

function SectionHead({ n, title, color }: { n?: string; title: string; color: string }) {
  return (
    <div className="mb-3.5">
      <div className="flex items-center gap-2.5 sm:gap-3">
        {n && (
          <span
            className="shrink-0 w-6 h-6 rounded-md text-white text-[10px] font-bold flex items-center justify-center"
            style={{ background: color }}
          >
            {n}
          </span>
        )}
        <h2
          className="text-[10.5px] sm:text-xs font-bold uppercase tracking-[0.16em] sm:tracking-[0.2em] break-words min-w-0"
          style={{ color }}
        >
          {title}
        </h2>
      </div>
      <div className="mt-2 flex items-end">
        <span className="h-[2px] w-14 sm:w-16 rounded-full" style={{ background: color }} />
        <span className="h-px flex-1 bg-slate-200" />
      </div>
    </div>
  )
}

function Section({
  n,
  title,
  color,
  children,
}: {
  n?: string
  title: string
  color: string
  children: React.ReactNode
}) {
  return (
    <section className="doc-section mb-6">
      <SectionHead n={n} title={title} color={color} />
      {children}
    </section>
  )
}

function Prose({ text }: { text: string }) {
  return (
    <div className="space-y-2.5">
      {text.split('\n').filter(line => line.trim()).map((line, i) => (
        <p key={i} className="text-[13.5px] sm:text-sm leading-relaxed text-slate-700 break-words">{line}</p>
      ))}
    </div>
  )
}

function Callout({ text, color, icon }: { text: string; color: string; icon?: React.ReactNode }) {
  return (
    <div
      className="rounded-lg px-4 py-3 flex gap-3"
      style={{ background: `${color}12`, border: `1px solid ${color}44`, borderLeft: `4px solid ${color}` }}
    >
      {icon && <span className="shrink-0 mt-0.5" style={{ color }}>{icon}</span>}
      <div className="min-w-0 flex-1 space-y-2">
        {text.split('\n').filter(line => line.trim()).map((line, i) => (
          <p key={i} className="text-[13.5px] sm:text-sm leading-relaxed text-slate-700 break-words">{line}</p>
        ))}
      </div>
    </div>
  )
}

function FactCell({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      className="rounded-lg px-3 py-2.5 min-w-0"
      style={{ background: `${color}12`, border: `1px solid ${color}3d`, borderTop: `3px solid ${color}` }}
    >
      <div className="text-[9px] font-bold uppercase tracking-[0.14em] mb-1" style={{ color }}>{label}</div>
      <div className="text-[13px] font-semibold text-slate-800 break-words">{value}</div>
    </div>
  )
}

function ObservationCell({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      className="rounded-lg px-3 py-2.5 min-w-0"
      style={{ background: `${color}0f`, border: `1px solid ${color}33` }}
    >
      <div className="text-[9px] font-bold uppercase tracking-[0.14em] mb-1" style={{ color }}>{label}</div>
      <div className="text-[13px] text-slate-700 break-words">{value}</div>
    </div>
  )
}

function Figure({ src, alt, label, caption }: { src: string; alt: string; label: string; caption?: string }) {
  return (
    <figure className="min-w-0">
      <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
        <img src={src} alt={alt} className="w-full h-full object-cover block aspect-[17/10]" loading="lazy" />
      </div>
      <figcaption className="mt-1.5 text-[10.5px] italic text-slate-500 break-words">
        {label}{caption ? ` — ${caption}` : ''}
      </figcaption>
    </figure>
  )
}

/* ------------------------------------------------------------------ *
 * Document
 * ------------------------------------------------------------------ */

export default function AdvisoryDocument({ advisory }: { advisory: Advisory; isPrint?: boolean }) {
  const { settings } = useApp()
  const theme = themeOf(advisory.documentTheme)
  const severity = normalizeSeverity(advisory.severity)
  const severityColor = SEVERITY_COLOR[severity]
  const hazardHex = hazardColor(advisory.hazard)

  const coverImage = advisory.images.find(i => i.isCover) || advisory.images[0]
  const gallery = advisory.images.filter(i => i !== coverImage)
  const location = sanitizeDocText(advisory.specificLocation) || locationLabel(advisory)
  const dateStr = formatDateLong(advisory.publishedAt || advisory.createdAt)
  const number = advisory.advisoryNumber || `IRW-${new Date(advisory.createdAt).getFullYear()}-DRAFT`
  const logos = [advisory.orgLogo || settings.orgLogo, advisory.wingLogo || settings.wingLogo, settings.advisoryLogo]
    .filter(Boolean) as string[]
  const embed = getVideoEmbedUrl(advisory.videoUrl)
  const videoLink = /^https?:\/\//i.test(advisory.videoUrl || '')
    && !/vercel\.app|localhost|\/content\//i.test(advisory.videoUrl)
    ? advisory.videoUrl.trim()
    : ''

  const summary = sanitizeDocText(advisory.shortSummary)
  const situation = sanitizeDocText(advisory.currentSituation)
  const problem = sanitizeDocText(advisory.identifiedProblem)
  const risks = sanitizeDocText(advisory.risks)
  const observed = sanitizeDocText(advisory.observedConditions)
  const guidance = sanitizeDocText(advisory.publicGuidance)
  const takeaway = sanitizeDocText(advisory.keyTakeaway)
  const contact = sanitizeDocText(advisory.contactInfo)
  const references = sanitizeDocText(advisory.references)

  const assets = advisory.affectedInfrastructure.filter(Boolean)
  const recommendations = advisory.engineeringRecommendations.filter(Boolean)
  const dos = advisory.dos.filter(Boolean)
  const donts = advisory.donts.filter(Boolean)

  const conditions = [
    { label: 'Weather', value: advisory.weatherCondition },
    { label: 'Rainfall', value: advisory.rainfallCondition },
    { label: 'River / Water', value: advisory.riverCondition },
    { label: 'Ground', value: advisory.groundCondition },
    { label: 'Visibility', value: advisory.visibility },
    { label: 'Other', value: advisory.otherCondition },
  ].filter(item => item.value?.trim())

  const phases = [
    { label: 'Immediate', items: advisory.immediateActions.filter(Boolean), color: ACTION_PHASE_COLOR.immediate },
    { label: 'Short Term', items: advisory.shortTermMeasures.filter(Boolean), color: ACTION_PHASE_COLOR.shortTerm },
    { label: 'Medium Term', items: advisory.mediumTermMeasures.filter(Boolean), color: ACTION_PHASE_COLOR.mediumTerm },
    { label: 'Long Term Resilience', items: advisory.longTermMeasures.filter(Boolean), color: ACTION_PHASE_COLOR.longTerm },
  ].filter(phase => phase.items.length)

  const contactRows = contact
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const match = line.match(/^([A-Za-z][A-Za-z /&()-]{1,26}):\s*(.+)$/)
      return match ? { label: match[1].trim(), value: match[2].trim() } : { label: '', value: line }
    })

  const referenceItems = references
    .split('\n')
    .map(line => line.replace(/^\s*(?:\d+[.)]|-)\s*/, '').trim())
    .filter(Boolean)

  // Section numbers follow the rendered order, exactly like the PDF.
  let counter = 0
  const num = () => String(++counter).padStart(2, '0')

  const meta = [
    { label: 'Date', value: dateStr },
    { label: 'Location', value: location },
    { label: 'District', value: advisory.district },
    { label: 'Province', value: advisory.province },
  ].filter(item => item.value?.trim())

  return (
    <article className="advisory-doc w-full max-w-4xl mx-auto overflow-hidden min-w-0" style={{ background: '#FFFFFF' }}>
      <div className="relative min-h-full">
        <div className="absolute inset-0 pointer-events-none doc-bg-layer opacity-40" style={backgroundLayer(advisory.backgroundTemplate, advisory.customBackground)} />
        <div className="relative doc-content-layer">

          {/* Cover band */}
          <header
            className="doc-header relative overflow-hidden text-white"
            style={{ background: `linear-gradient(105deg, ${theme.header} 0%, ${theme.header} 22%, ${theme.accent} 100%)` }}
          >
            <div className="absolute inset-x-0 top-0 h-1.5" style={{ background: theme.band }} />
            <div className="relative px-4 sm:px-6 md:px-8 pt-5 sm:pt-6 pb-5 sm:pb-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                <div className="min-w-0">
                  <div className="text-[9.5px] sm:text-[10px] font-bold uppercase tracking-[0.28em]" style={{ color: theme.band }}>
                    {BRAND.name}
                  </div>
                  <div className="text-base sm:text-lg font-bold mt-1">{advisory.type || 'Infrastructure Advisory'}</div>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <div className="text-[9px] font-bold uppercase tracking-[0.16em]" style={{ color: `${theme.band}cc` }}>Advisory No</div>
                  <div className="text-[13px] font-bold font-mono break-all">{number}</div>
                  <div className="text-[9px] font-bold uppercase tracking-[0.16em] mt-1.5" style={{ color: `${theme.band}cc` }}>Version</div>
                  <div className="text-[13px] font-bold">{advisory.version}.0</div>
                </div>
              </div>

              {logos.length > 0 && (
                <div className="flex flex-wrap items-center gap-2.5 mb-4">
                  {logos.map((logo, i) => (
                    <span key={i} className="bg-white rounded-md p-1.5 flex items-center">
                      <img src={logo} alt="" className="h-8 sm:h-9 w-auto object-contain" />
                    </span>
                  ))}
                </div>
              )}

              <div className="h-[3px] rounded-full mb-4" style={{ background: theme.band }} />

              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span
                  className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] px-3 py-1.5 rounded-md text-white"
                  style={{ background: hazardHex }}
                >
                  <HazardIcon hazard={advisory.hazard} size={13} />
                  {advisory.hazard}
                </span>
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.14em] px-3 py-1.5 rounded-md text-white"
                  style={{ background: severityColor }}
                >
                  {severity} Severity
                </span>
              </div>

              <h1
                className="text-2xl sm:text-3xl md:text-[34px] font-bold leading-[1.15] break-words"
                style={{ fontFamily: 'DM Serif Display, serif' }}
              >
                {advisory.title || 'Untitled advisory'}
              </h1>
            </div>
          </header>

          {/* Metadata strip */}
          {meta.length > 0 && (
            <div
              className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-200 border-b border-slate-200"
              style={{ background: '#F1F6FB', borderTop: `2px solid ${theme.accent}` }}
            >
              {meta.map(item => (
                <div key={item.label} className="px-3 sm:px-4 py-2.5 min-w-0">
                  <div className="text-[9px] font-bold uppercase tracking-[0.14em] mb-0.5" style={{ color: theme.accent }}>
                    {item.label}
                  </div>
                  <div className="text-[12.5px] font-semibold text-slate-800 break-words">{item.value}</div>
                </div>
              ))}
            </div>
          )}

          <div className="px-4 sm:px-6 md:px-8 py-5 sm:py-7">
            {advisory.infrastructureTypes.filter(Boolean).length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {advisory.infrastructureTypes.filter(Boolean).map(type => (
                  <span
                    key={type}
                    className="text-[9.5px] font-bold uppercase tracking-[0.12em] px-2.5 py-1.5 rounded"
                    style={{ background: `${DOC_ACCENT.slate}12`, color: DOC_ACCENT.slate, border: `1px solid ${DOC_ACCENT.slate}33` }}
                  >
                    {type}
                  </span>
                ))}
              </div>
            )}

            {coverImage && (
              <figure className="mb-6">
                <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                  <img
                    src={coverImage.dataUrl}
                    alt={coverImage.caption || advisory.title}
                    className="w-full object-cover block aspect-[3/1]"
                  />
                </div>
                <figcaption className="mt-1.5 text-[10.5px] italic text-slate-500 break-words">
                  FIGURE 01{coverImage.caption ? ` — ${coverImage.caption}` : ''}
                </figcaption>
              </figure>
            )}

            {(summary || location) && (
              <Section n={num()} title="Executive Brief" color={SECTION_COLOR.brief}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-3">
                  <FactCell label="Hazard" value={advisory.hazard} color={hazardHex} />
                  <FactCell label="Location" value={location} color={DOC_ACCENT.blue} />
                  <FactCell label="Severity" value={severity} color={severityColor} />
                </div>
                {summary && <Callout text={summary} color={SECTION_COLOR.brief} />}
              </Section>
            )}

            {situation && (
              <Section n={num()} title="Situation / Observation" color={SECTION_COLOR.situation}>
                <Prose text={situation} />
              </Section>
            )}

            {problem && (
              <Section n={num()} title="Identified Problem" color={SECTION_COLOR.problem}>
                <Callout text={problem} color={SECTION_COLOR.problem} icon={<AlertTriangle size={16} />} />
              </Section>
            )}

            {assets.length > 0 && (
              <Section n={num()} title="Infrastructure at Risk" color={SECTION_COLOR.assets}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {assets.map(asset => (
                    <div
                      key={asset}
                      className="rounded-lg px-3 py-2.5 flex items-center gap-2.5 min-w-0"
                      style={{
                        background: `${SECTION_COLOR.assets}0f`,
                        border: `1px solid ${SECTION_COLOR.assets}3d`,
                      }}
                    >
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: SECTION_COLOR.assets }} />
                      <span className="text-[13px] font-semibold text-slate-800 break-words min-w-0">{asset}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {risks && (
              <Section n={num()} title="Risk / Potential Impact" color={SECTION_COLOR.risk}>
                <Callout text={risks} color={SECTION_COLOR.risk} icon={<AlertTriangle size={16} />} />
              </Section>
            )}

            {(observed || conditions.length > 0) && (
              <Section n={num()} title="Key Observations" color={SECTION_COLOR.observations}>
                {observed && <div className="mb-3"><Prose text={observed} /></div>}
                {conditions.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {conditions.map(item => (
                      <ObservationCell
                        key={item.label}
                        label={item.label}
                        value={item.value as string}
                        color={SECTION_COLOR.observations}
                      />
                    ))}
                  </div>
                )}
              </Section>
            )}

            {recommendations.length > 0 && (
              <Section n={num()} title="Engineering Recommendations" color={SECTION_COLOR.recommendations}>
                <div className="space-y-2.5">
                  {recommendations.map((rec, i) => (
                    <div
                      key={i}
                      className="rounded-lg px-3 py-2.5 flex gap-3 min-w-0"
                      style={{
                        background: `${SECTION_COLOR.recommendations}0f`,
                        border: `1px solid ${SECTION_COLOR.recommendations}3d`,
                      }}
                    >
                      <span
                        className="shrink-0 w-6 h-5 rounded text-white text-[9px] font-bold flex items-center justify-center mt-0.5"
                        style={{ background: SECTION_COLOR.recommendations }}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="text-[13.5px] sm:text-sm leading-relaxed text-slate-700 break-words min-w-0">{rec}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {phases.length > 0 && (
              <Section n={num()} title="Action Plan" color={SECTION_COLOR.actions}>
                <div className="space-y-4">
                  {phases.map((phase, pi) => (
                    <div key={phase.label} className="relative pl-7">
                      <span
                        className="absolute left-[5px] top-4 bottom-0 w-[2px]"
                        style={{ background: `${phase.color}55`, display: pi === phases.length - 1 ? 'none' : 'block' }}
                      />
                      <span
                        className="absolute left-0 top-1 w-3 h-3 rounded-full border-2 border-white"
                        style={{ background: phase.color, boxShadow: `0 0 0 1px ${phase.color}` }}
                      />
                      <div className="text-[9.5px] font-bold uppercase tracking-[0.18em] mb-1.5" style={{ color: phase.color }}>
                        {phase.label}
                      </div>
                      <ul className="list-none m-0 p-0 space-y-1.5">
                        {phase.items.map((item, i) => (
                          <li key={i} className="flex gap-2 items-start">
                            <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-[7px]" style={{ background: `${phase.color}aa` }} />
                            <span className="text-[13.5px] sm:text-sm leading-relaxed text-slate-700 break-words min-w-0">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {(dos.length > 0 || donts.length > 0) && (
              <Section n={num()} title="Public Do & Do Not" color={SECTION_COLOR.publicConduct}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {dos.length > 0 && (
                    <div
                      className="rounded-lg overflow-hidden"
                      style={{ background: `${DOC_ACCENT.green}0f`, border: `1px solid ${DOC_ACCENT.green}3d` }}
                    >
                      <div className="h-1" style={{ background: DOC_ACCENT.green }} />
                      <div className="px-3.5 py-3">
                        <div className="text-[10px] font-bold uppercase tracking-[0.18em] mb-2" style={{ color: DOC_ACCENT.green }}>Do</div>
                        <ul className="list-none m-0 p-0 space-y-2">
                          {dos.map((item, i) => (
                            <li key={i} className="flex gap-2.5 items-start">
                              <Check size={14} className="shrink-0 mt-[3px]" style={{ color: DOC_ACCENT.green }} strokeWidth={3} />
                              <span className="text-[13px] leading-relaxed text-slate-700 break-words min-w-0">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                  {donts.length > 0 && (
                    <div
                      className="rounded-lg overflow-hidden"
                      style={{ background: `${DOC_ACCENT.red}0f`, border: `1px solid ${DOC_ACCENT.red}3d` }}
                    >
                      <div className="h-1" style={{ background: DOC_ACCENT.red }} />
                      <div className="px-3.5 py-3">
                        <div className="text-[10px] font-bold uppercase tracking-[0.18em] mb-2" style={{ color: DOC_ACCENT.red }}>Do Not</div>
                        <ul className="list-none m-0 p-0 space-y-2">
                          {donts.map((item, i) => (
                            <li key={i} className="flex gap-2.5 items-start">
                              <X size={14} className="shrink-0 mt-[3px]" style={{ color: DOC_ACCENT.red }} strokeWidth={3} />
                              <span className="text-[13px] leading-relaxed text-slate-700 break-words min-w-0">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </Section>
            )}

            {gallery.length > 0 && (
              <Section n={num()} title="Visual Evidence" color={SECTION_COLOR.visuals}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {gallery.map((img, i) => (
                    <Figure
                      key={img.id}
                      src={img.dataUrl}
                      alt={img.caption || 'Field photograph'}
                      label={`FIGURE ${String(i + (coverImage ? 2 : 1)).padStart(2, '0')}`}
                      caption={img.caption}
                    />
                  ))}
                </div>
              </Section>
            )}

            {advisory.videoUrl && (
              <Section n={num()} title="Related Video Briefing" color={SECTION_COLOR.video}>
                <div
                  className="doc-video-block rounded-lg overflow-hidden"
                  style={{ background: `${SECTION_COLOR.video}0f`, border: `1px solid ${SECTION_COLOR.video}3d` }}
                >
                  {embed && (
                    <div className="aspect-video doc-video-embed bg-slate-900">
                      <iframe src={embed} title={advisory.videoTitle || advisory.title} className="w-full h-full" allowFullScreen />
                    </div>
                  )}
                  <div className="px-4 py-3.5 flex gap-3.5">
                    {!embed && (
                      <span
                        className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ background: SECTION_COLOR.video }}
                      >
                        <Play size={16} className="text-white ml-0.5" fill="white" />
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      {advisory.videoTitle && (
                        <div className="text-sm font-bold text-slate-800 break-words">{advisory.videoTitle}</div>
                      )}
                      {advisory.videoDescription && (
                        <p className="text-[12.5px] text-slate-600 mt-1 break-words">{sanitizeDocText(advisory.videoDescription)}</p>
                      )}
                      {videoLink && (
                        <a
                          href={videoLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 mt-2.5 text-[9.5px] font-bold uppercase tracking-[0.16em] text-white px-3 py-2 rounded"
                          style={{ background: SECTION_COLOR.video }}
                        >
                          Watch Video Briefing <span aria-hidden>→</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </Section>
            )}

            {guidance && (
              <Section n={num()} title="Public Guidance" color={SECTION_COLOR.guidance}>
                <Callout text={guidance} color={SECTION_COLOR.guidance} icon={<Shield size={16} />} />
              </Section>
            )}

            {takeaway && (
              <div
                className="doc-section mb-6 rounded-lg overflow-hidden text-white"
                style={{ background: `linear-gradient(105deg, ${theme.header} 0%, ${theme.header} 25%, ${theme.accent} 100%)` }}
              >
                <div className="h-1" style={{ background: theme.band }} />
                <div className="px-4 sm:px-5 py-4">
                  <div className="text-[9.5px] font-bold uppercase tracking-[0.24em] mb-1.5" style={{ color: theme.band }}>
                    Key Takeaway
                  </div>
                  <p className="text-[14px] sm:text-[15px] leading-relaxed break-words whitespace-pre-line">{takeaway}</p>
                </div>
                <div className="h-0.5" style={{ background: theme.band }} />
              </div>
            )}

            {contactRows.length > 0 && (
              <Section n={num()} title="Contact / Escalation" color={SECTION_COLOR.contact}>
                <div className="pl-3" style={{ borderLeft: `3px solid ${SECTION_COLOR.contact}` }}>
                  <dl className="m-0 space-y-1.5">
                    {contactRows.map((row, i) => (
                      <div key={i} className="flex flex-col sm:flex-row sm:gap-4 min-w-0">
                        {row.label && (
                          <dt
                            className="text-[9px] font-bold uppercase tracking-[0.14em] sm:w-32 shrink-0 sm:pt-0.5"
                            style={{ color: SECTION_COLOR.contact }}
                          >
                            {row.label}
                          </dt>
                        )}
                        <dd className="m-0 text-[13px] text-slate-700 break-words min-w-0">{row.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </Section>
            )}

            {referenceItems.length > 0 && (
              <Section n={num()} title="Sources / References" color={SECTION_COLOR.references}>
                <ol className="list-none m-0 p-0 space-y-1.5">
                  {referenceItems.map((item, i) => (
                    <li key={i} className="flex gap-2.5 text-[11.5px] text-slate-500">
                      <span className="font-bold shrink-0">{i + 1}.</span>
                      <span className="break-all min-w-0">{item}</span>
                    </li>
                  ))}
                </ol>
              </Section>
            )}

            <footer className="pt-4 mt-2" style={{ borderTop: `2px solid ${theme.band}` }}>
              <p className="text-[10.5px] leading-relaxed text-slate-500">
                Issued through {BRAND.name}. {BRAND.wing}. Content reflects information entered by authorized
                administrators and should be applied with professional engineering judgement.
              </p>
              <div className="mt-2.5 flex flex-wrap justify-between gap-2 text-[10px] font-semibold text-slate-600">
                <span>{BRAND.shortName}</span>
                <span>{number} · {dateStr}</span>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </article>
  )
}
