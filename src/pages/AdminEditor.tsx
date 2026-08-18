import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Save, Globe, Eye, ChevronLeft, X, Plus, Trash2, Star, Upload, BookOpen, Check } from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import AdminLayout from '../components/AdminLayout'
import AdvisoryDocument from '../components/AdvisoryDocument'
import { PROVINCE_NAMES, getDistricts } from '../data/pakistan'
import { HAZARD_TEMPLATES } from '../data/templates'
import { HAZARDS, ADVISORY_TYPES, SEVERITIES, INFRA_TYPES, ISSUE_TYPES, CONTENT_KINDS, KIND_LABEL } from '../data/constants'
import { BACKGROUND_TEMPLATES, DOCUMENT_THEMES } from '../data/documentDesign'
import type { Advisory, AdvisoryType, ContentKind, HazardType, IssueType, Severity, AdvisoryImage, DocumentTheme } from '../types'

const AFFECTED_INFRA = INFRA_TYPES

const TABS = [
  { id: 'basic', label: '1. Basic' },
  { id: 'location', label: '2. Location' },
  { id: 'situation', label: '3. Observation' },
  { id: 'content', label: '4. Recommendations' },
  { id: 'media', label: '5. Media' },
  { id: 'design', label: '6. Document Design' },
  { id: 'preview', label: '7. Preview & Publish' },
]

function blankAdvisory(kind: ContentKind = 'issue'): Omit<Advisory, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'viewCount'> {
  return {
    kind, issueType: '', shortSummary: '', videoUrl: '', videoTitle: '', videoDescription: '', videoThumbnail: '', videoDuration: '',
    featured: false, advisoryNumber: '', identifiedProblem: '',
    title: '', type: 'Infrastructure Advisory', hazard: 'Flood', severity: 'Advisory',
    province: '', district: '', specificLocation: '', infrastructureTypes: [],
    currentSituation: '', observedConditions: '', affectedInfrastructure: [],
    weatherCondition: '', rainfallCondition: '', riverCondition: '', groundCondition: '', visibility: '', otherCondition: '',
    risks: '', immediateActions: [''], shortTermMeasures: [''], mediumTermMeasures: [''], longTermMeasures: [''],
    dos: [''], donts: [''], engineeringRecommendations: [''],
    publicGuidance: '', contactInfo: '', images: [], references: '', keyTakeaway: '',
    documentTheme: 'blue-engineering', backgroundTemplate: 'ndma-blue', customBackground: '', orgLogo: '', wingLogo: '',
    status: 'Draft', publishedAt: null, expiryDate: null, publishDate: null,
  }
}

function ListEditor({ label, items, onChange, placeholder }: { label: string; items: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  function update(i: number, v: string) {
    const next = [...items]; next[i] = v; onChange(next)
  }
  function add() { onChange([...items, '']) }
  function remove(i: number) { onChange(items.filter((_, idx) => idx !== i)) }

  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">{label}</label>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input
              type="text"
              value={item}
              onChange={e => update(i, e.target.value)}
              placeholder={placeholder || `Item ${i + 1}`}
              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 focus:border-blue-400 transition-colors"
              style={{ outline: 'none' }}
            />
            <button onClick={() => remove(i)} className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={add}
        className="mt-2 flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium px-2 py-1 rounded-lg hover:bg-blue-50 transition-all"
      >
        <Plus size={13} /> Add item
      </button>
    </div>
  )
}

function FieldGroup({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-4">
      {title && <h3 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider">{title}</h3>}
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  )
}

const INPUT_CLS = "w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 focus:border-blue-400 transition-colors bg-white"
const SELECT_CLS = "w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 focus:border-blue-400 transition-colors bg-white appearance-none"
const TEXTAREA_CLS = "w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 focus:border-blue-400 transition-colors bg-white resize-y min-h-24"

export default function AdminEditor() {
  const { advisories, createAdvisory, updateAdvisory, publishAdvisory, nextAdvisoryNumber, settings, library } = useApp()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [params] = useSearchParams()
  const isNew = !id || id === 'new'
  const existing = isNew ? null : advisories.find(a => a.id === id)
  const initialKind = (params.get('kind') as ContentKind) || 'issue'

  const [form, setForm] = useState(() => {
    const base = existing ? { ...blankAdvisory(), ...existing } : blankAdvisory(initialKind)
    if (!existing) {
      base.advisoryNumber = ''
      base.documentTheme = settings.defaultTheme
      base.backgroundTemplate = settings.defaultBackgroundTemplate
      base.customBackground = settings.defaultCustomBackground
      base.orgLogo = settings.orgLogo
      base.wingLogo = settings.wingLogo
    }
    return base
  })
  const [tab, setTab] = useState('basic')
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile' | 'print'>('desktop')
  const [saved, setSaved] = useState(false)
  const [showLibrary, setShowLibrary] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const bgRef = useRef<HTMLInputElement>(null)
  const thumbRef = useRef<HTMLInputElement>(null)
  const logoRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (existing) setForm({ ...blankAdvisory(), ...existing })
  }, [id])

  function set<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function toggleInfra(type: string) {
    set('infrastructureTypes', form.infrastructureTypes.includes(type)
      ? form.infrastructureTypes.filter(t => t !== type)
      : [...form.infrastructureTypes, type])
  }

  function toggleAffected(type: string) {
    set('affectedInfrastructure', form.affectedInfrastructure.includes(type)
      ? form.affectedInfrastructure.filter(t => t !== type)
      : [...form.affectedInfrastructure, type])
  }

  function applyTemplate(templateId: string) {
    const tmpl = HAZARD_TEMPLATES.find(t => t.id === templateId)
    if (!tmpl) return
    setForm(prev => ({
      ...prev,
      hazard: tmpl.hazard,
      risks: tmpl.risks,
      immediateActions: [...tmpl.immediateActions],
      shortTermMeasures: [...tmpl.shortTermMeasures],
      longTermMeasures: [...tmpl.longTermMeasures],
      dos: [...tmpl.dos],
      donts: [...tmpl.donts],
      engineeringRecommendations: [...tmpl.engineeringRecommendations],
    }))
  }

  function handleSave(publish = false) {
    const data = { ...form }
    if (!data.advisoryNumber) data.advisoryNumber = nextAdvisoryNumber()
    if (publish) data.status = 'Published'

    if (isNew) {
      const adv = createAdvisory(data)
      if (publish) publishAdvisory(adv.id)
      navigate(`/admin/advisories/${adv.id}/edit`)
    } else if (existing) {
      updateAdvisory(existing.id, data)
      if (publish) publishAdvisory(existing.id)
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    files.forEach(file => {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return
      const reader = new FileReader()
      reader.onload = ev => {
        const newImg: AdvisoryImage = {
          id: `img_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
          dataUrl: ev.target?.result as string,
          caption: '',
          isCover: form.images.length === 0,
          order: form.images.length,
        }
        setForm(prev => ({ ...prev, images: [...prev.images, newImg] }))
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  function updateImage(imgId: string, updates: Partial<AdvisoryImage>) {
    setForm(prev => ({ ...prev, images: prev.images.map(img => img.id === imgId ? { ...img, ...updates } : img) }))
  }

  function removeImage(imgId: string) {
    setForm(prev => {
      const imgs = prev.images.filter(i => i.id !== imgId)
      if (imgs.length > 0 && !imgs.some(i => i.isCover)) imgs[0].isCover = true
      return { ...prev, images: imgs }
    })
  }

  function setCoverImage(imgId: string) {
    setForm(prev => ({ ...prev, images: prev.images.map(img => ({ ...img, isCover: img.id === imgId })) }))
  }

  const districts = getDistricts(form.province)

  const previewAdvisory: Advisory = {
    ...form,
    id: existing?.id || 'preview',
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: existing?.version || 1,
    viewCount: 0,
  } as Advisory

  return (
    <AdminLayout>
      <div className="flex flex-col min-h-screen">
        {/* Top bar */}
        <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center gap-4 sticky top-0 z-20">
          <button
            onClick={() => navigate('/admin/advisories')}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-slate-800 truncate">{form.title || (isNew ? `New ${KIND_LABEL[form.kind || 'issue']}` : 'Edit Content')}</h1>
            <div className="text-xs text-slate-400">{isNew ? `Creating ${KIND_LABEL[form.kind || 'issue']}` : `v${existing?.version || 1}`}</div>
          </div>

          <div className="flex items-center gap-2">
            {saved && (
              <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                <Check size={13} /> Saved
              </span>
            )}
            <button
              onClick={() => setTab('preview')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-all"
            >
              <Eye size={14} /> Preview
            </button>
            <button
              onClick={() => handleSave(false)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all"
            >
              <Save size={14} /> Save Draft
            </button>
            <button
              onClick={() => handleSave(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #1D4ED8, #06B6D4)' }}
            >
              <Globe size={14} /> Publish
            </button>
          </div>
        </div>

        {/* Template selector */}
        {isNew && (
          <div className="bg-blue-50 border-b border-blue-100 px-6 py-3 flex items-center gap-3 flex-wrap">
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Quick Start:</span>
            {HAZARD_TEMPLATES.map(tmpl => (
              <button
                key={tmpl.id}
                onClick={() => applyTemplate(tmpl.id)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors border border-blue-200"
              >
                {tmpl.name}
              </button>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white border-b border-slate-100 px-6 overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  tab === t.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 max-w-4xl mx-auto w-full">

          {/* BASIC INFO */}
          {tab === 'basic' && (
            <div>
              <FieldGroup title="Content Type">
                <Field label="What are you publishing?" required>
                  <div className="flex flex-wrap gap-2">
                    {CONTENT_KINDS.map(k => (
                      <button
                        key={k.id}
                        type="button"
                        onClick={() => set('kind', k.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                        style={{
                          background: form.kind === k.id ? '#dbeafe' : '#f8fafc',
                          color: form.kind === k.id ? '#1e40af' : '#64748b',
                          border: `1px solid ${form.kind === k.id ? '#93c5fd' : '#e2e8f0'}`,
                        }}
                      >
                        {k.label}
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="Issue Type">
                  <select value={form.issueType || ''} onChange={e => set('issueType', e.target.value as IssueType | '')} className={SELECT_CLS} style={{ outline: 'none' }}>
                    <option value="">— Select if applicable —</option>
                    {ISSUE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </Field>
              </FieldGroup>

              <FieldGroup title="Details">
                <Field label="Title" required>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => set('title', e.target.value)}
                    placeholder="e.g. Flood Risk to Commercial Infrastructure in Attock"
                    className={INPUT_CLS}
                    style={{ outline: 'none' }}
                  />
                </Field>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Advisory Number">
                    <input
                      type="text"
                      value={form.advisoryNumber || ''}
                      onChange={e => set('advisoryNumber', e.target.value)}
                      placeholder="Auto-assigned on save, e.g. IRW-2026-001"
                      className={INPUT_CLS}
                      style={{ outline: 'none' }}
                    />
                  </Field>
                  <Field label="Issue Type">
                    <select value={form.issueType || ''} onChange={e => set('issueType', e.target.value as IssueType | '')} className={SELECT_CLS} style={{ outline: 'none' }}>
                      <option value="">— Select if applicable —</option>
                      {ISSUE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </Field>
                </div>
                <Field label="Short Summary">
                  <textarea
                    value={form.shortSummary || ''}
                    onChange={e => set('shortSummary', e.target.value)}
                    placeholder="One or two sentences for Today's Watch cards..."
                    className={TEXTAREA_CLS}
                    rows={3}
                    style={{ outline: 'none' }}
                  />
                </Field>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Advisory Type" required>
                    <select value={form.type} onChange={e => set('type', e.target.value as AdvisoryType)} className={SELECT_CLS} style={{ outline: 'none' }}>
                      {ADVISORY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </Field>
                  <Field label="Hazard" required>
                    <select value={form.hazard} onChange={e => set('hazard', e.target.value as HazardType)} className={SELECT_CLS} style={{ outline: 'none' }}>
                      {HAZARDS.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </Field>
                </div>
                <Field label="Severity Level" required>
                  <div className="flex gap-3 flex-wrap">
                    {SEVERITIES.map(s => {
                      const colors: Record<Severity, { bg: string; text: string; border: string }> = {
                        Normal: { bg: '#dbeafe', text: '#1e40af', border: '#3b82f6' },
                        Advisory: { bg: '#fef3c7', text: '#92400e', border: '#f59e0b' },
                        High: { bg: '#ffedd5', text: '#9a3412', border: '#f97316' },
                        Critical: { bg: '#fee2e2', text: '#991b1b', border: '#ef4444' },
                      }
                      const c = colors[s]
                      const isActive = form.severity === s
                      return (
                        <button
                          key={s}
                          onClick={() => set('severity', s)}
                          className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                          style={{
                            background: isActive ? c.bg : '#f8fafc',
                            color: isActive ? c.text : '#64748b',
                            border: `2px solid ${isActive ? c.border : '#e2e8f0'}`,
                          }}
                        >
                          {s}
                        </button>
                      )
                    })}
                  </div>
                </Field>
              </FieldGroup>

              <FieldGroup title="Publication Settings">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Publish Date (optional)">
                    <input
                      type="date"
                      value={form.publishDate || ''}
                      onChange={e => set('publishDate', e.target.value || null)}
                      className={INPUT_CLS}
                      style={{ outline: 'none' }}
                    />
                  </Field>
                  <Field label="Expiry Date (optional)">
                    <input
                      type="date"
                      value={form.expiryDate || ''}
                      onChange={e => set('expiryDate', e.target.value || null)}
                      className={INPUT_CLS}
                      style={{ outline: 'none' }}
                    />
                  </Field>
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(form.featured)}
                    onChange={e => set('featured', e.target.checked)}
                  />
                  Feature in Today{"'"}s Watch
                </label>
              </FieldGroup>
            </div>
          )}

          {/* LOCATION */}
          {tab === 'location' && (
            <div>
              <FieldGroup title="Geographic Scope">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Province / Region" required>
                    <select
                      value={form.province}
                      onChange={e => { set('province', e.target.value); set('district', '') }}
                      className={SELECT_CLS}
                      style={{ outline: 'none' }}
                    >
                      <option value="">— Select Province —</option>
                      <option value="National">National (All Pakistan)</option>
                      {PROVINCE_NAMES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </Field>
                  <Field label="District">
                    <select
                      value={form.district}
                      onChange={e => set('district', e.target.value)}
                      className={SELECT_CLS}
                      disabled={!form.province || form.province === 'National'}
                      style={{ outline: 'none' }}
                    >
                      <option value="">— Select District —</option>
                      {districts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </Field>
                </div>
                <Field label="Specific Location / Area">
                  <input
                    type="text"
                    value={form.specificLocation}
                    onChange={e => set('specificLocation', e.target.value)}
                    placeholder="e.g. Downstream Taunsa Barrage, Along N-55 Highway"
                    className={INPUT_CLS}
                    style={{ outline: 'none' }}
                  />
                </Field>
              </FieldGroup>

              <FieldGroup title="Infrastructure / Audience">
                <Field label="Infrastructure Types">
                  <div className="flex flex-wrap gap-2 mt-1">
                    {INFRA_TYPES.map(type => (
                      <button
                        key={type}
                        onClick={() => toggleInfra(type)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{
                          background: form.infrastructureTypes.includes(type) ? '#dbeafe' : '#f8fafc',
                          color: form.infrastructureTypes.includes(type) ? '#1e40af' : '#64748b',
                          border: `1px solid ${form.infrastructureTypes.includes(type) ? '#93c5fd' : '#e2e8f0'}`,
                        }}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </Field>
              </FieldGroup>
            </div>
          )}

          {/* SITUATION */}
          {tab === 'situation' && (
            <div>
              <FieldGroup title="Current Situation">
                <Field label="Current Situation">
                  <textarea
                    value={form.currentSituation}
                    onChange={e => set('currentSituation', e.target.value)}
                    placeholder="Describe the current situation accurately. Do not invent statistics, rainfall amounts, or other specific data."
                    className={TEXTAREA_CLS}
                    rows={5}
                    style={{ outline: 'none' }}
                  />
                </Field>
                <Field label="Identified Problem">
                  <textarea
                    value={form.identifiedProblem || ''}
                    onChange={e => set('identifiedProblem', e.target.value)}
                    placeholder="e.g. Blocked urban drain causing commercial access flooding"
                    className={TEXTAREA_CLS}
                    rows={3}
                    style={{ outline: 'none' }}
                  />
                </Field>
                <Field label="Observed / Reported Conditions">
                  <textarea
                    value={form.observedConditions}
                    onChange={e => set('observedConditions', e.target.value)}
                    placeholder="Conditions observed or reported in the field..."
                    className={TEXTAREA_CLS}
                    rows={4}
                    style={{ outline: 'none' }}
                  />
                </Field>
                <Field label="Affected Infrastructure">
                  <div className="flex flex-wrap gap-2 mt-1">
                    {AFFECTED_INFRA.map(type => (
                      <button
                        key={type}
                        onClick={() => toggleAffected(type)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{
                          background: form.affectedInfrastructure.includes(type) ? '#fee2e2' : '#f8fafc',
                          color: form.affectedInfrastructure.includes(type) ? '#991b1b' : '#64748b',
                          border: `1px solid ${form.affectedInfrastructure.includes(type) ? '#fca5a5' : '#e2e8f0'}`,
                        }}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </Field>
              </FieldGroup>

              <FieldGroup title="Current Conditions (fill only relevant fields)">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Weather Condition">
                    <input type="text" value={form.weatherCondition} onChange={e => set('weatherCondition', e.target.value)} placeholder="e.g. Overcast with heavy rain" className={INPUT_CLS} style={{ outline: 'none' }} />
                  </Field>
                  <Field label="Rainfall Condition">
                    <input type="text" value={form.rainfallCondition} onChange={e => set('rainfallCondition', e.target.value)} placeholder="e.g. Heavy to very heavy rainfall expected" className={INPUT_CLS} style={{ outline: 'none' }} />
                  </Field>
                  <Field label="River / Water Level">
                    <input type="text" value={form.riverCondition} onChange={e => set('riverCondition', e.target.value)} placeholder="e.g. River at high flood level" className={INPUT_CLS} style={{ outline: 'none' }} />
                  </Field>
                  <Field label="Ground Condition">
                    <input type="text" value={form.groundCondition} onChange={e => set('groundCondition', e.target.value)} placeholder="e.g. Saturated, waterlogged" className={INPUT_CLS} style={{ outline: 'none' }} />
                  </Field>
                  <Field label="Visibility">
                    <input type="text" value={form.visibility} onChange={e => set('visibility', e.target.value)} placeholder="e.g. Poor due to fog / rain" className={INPUT_CLS} style={{ outline: 'none' }} />
                  </Field>
                  <Field label="Other Relevant Condition">
                    <input type="text" value={form.otherCondition} onChange={e => set('otherCondition', e.target.value)} placeholder="Any other relevant condition..." className={INPUT_CLS} style={{ outline: 'none' }} />
                  </Field>
                </div>
              </FieldGroup>
            </div>
          )}

          {/* CONTENT */}
          {tab === 'content' && (
            <div>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 mb-4 text-sm text-amber-800">
                <strong>Important:</strong> Only enter information you have verified. The system will not fabricate data. Leave fields blank if information is not available.
              </div>

              {/* Library shortcut */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen size={15} className="text-slate-500" />
                  <span className="text-sm font-semibold text-slate-700">Insert from Content Library</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['immediateActions', 'engineeringRecommendations', 'dos', 'donts', 'shortTermMeasures', 'longTermMeasures'].map(field => (
                    <button
                      key={field}
                      onClick={() => setShowLibrary(field)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-200"
                    >
                      + {field.replace(/([A-Z])/g, ' $1').trim()}
                    </button>
                  ))}
                </div>
              </div>

              <FieldGroup title="Risk Assessment">
                <Field label="Key Risks">
                  <textarea
                    value={form.risks}
                    onChange={e => set('risks', e.target.value)}
                    placeholder="Describe the key risks posed by this hazard to the identified infrastructure..."
                    className={TEXTAREA_CLS}
                    rows={4}
                    style={{ outline: 'none' }}
                  />
                </Field>
              </FieldGroup>

              <FieldGroup title="Actions & Measures">
                <ListEditor label="Immediate Actions" items={form.immediateActions} onChange={v => set('immediateActions', v)} placeholder="Action to take immediately..." />
                <ListEditor label="Short-Term Measures (days to weeks)" items={form.shortTermMeasures} onChange={v => set('shortTermMeasures', v)} placeholder="Short-term measure..." />
                <ListEditor label="Medium-Term Measures (weeks to months)" items={form.mediumTermMeasures} onChange={v => set('mediumTermMeasures', v)} placeholder="Medium-term measure..." />
                <ListEditor label="Long-Term Resilience Measures" items={form.longTermMeasures} onChange={v => set('longTermMeasures', v)} placeholder="Long-term / Build Back Better measure..." />
              </FieldGroup>

              <FieldGroup title="Do's and Don'ts">
                <ListEditor label="DO" items={form.dos} onChange={v => set('dos', v)} placeholder="What to do..." />
                <ListEditor label="DON'T" items={form.donts} onChange={v => set('donts', v)} placeholder="What not to do..." />
              </FieldGroup>

              <FieldGroup title="Engineering & Public Guidance">
                <ListEditor label="Engineering Recommendations" items={form.engineeringRecommendations} onChange={v => set('engineeringRecommendations', v)} placeholder="Engineering recommendation..." />
                <Field label="Public / User Guidance">
                  <textarea
                    value={form.publicGuidance}
                    onChange={e => set('publicGuidance', e.target.value)}
                    placeholder="Guidance for the general public and infrastructure users..."
                    className={TEXTAREA_CLS}
                    rows={3}
                    style={{ outline: 'none' }}
                  />
                </Field>
              </FieldGroup>
            </div>
          )}

          {/* MEDIA */}
          {tab === 'media' && (
            <div>
              <FieldGroup title="Video">
                <Field label="Video URL (YouTube, Vimeo or direct link)">
                  <input type="url" value={form.videoUrl || ''} onChange={e => set('videoUrl', e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className={INPUT_CLS} style={{ outline: 'none' }} />
                </Field>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Video Title">
                    <input type="text" value={form.videoTitle || ''} onChange={e => set('videoTitle', e.target.value)} className={INPUT_CLS} style={{ outline: 'none' }} />
                  </Field>
                  <Field label="Duration">
                    <input type="text" value={form.videoDuration || ''} onChange={e => set('videoDuration', e.target.value)} placeholder="e.g. 3:45" className={INPUT_CLS} style={{ outline: 'none' }} />
                  </Field>
                </div>
                <Field label="Video Description">
                  <textarea value={form.videoDescription || ''} onChange={e => set('videoDescription', e.target.value)} className={TEXTAREA_CLS} rows={2} style={{ outline: 'none' }} />
                </Field>
                <Field label="Thumbnail">
                  <input ref={thumbRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const reader = new FileReader()
                    reader.onload = ev => set('videoThumbnail', ev.target?.result as string)
                    reader.readAsDataURL(file)
                  }} />
                  <div className="flex gap-2">
                    <button type="button" onClick={() => thumbRef.current?.click()} className="px-3 py-2 rounded-xl border text-sm">Upload thumbnail</button>
                    {form.videoThumbnail && <button type="button" onClick={() => set('videoThumbnail', '')} className="px-3 py-2 rounded-xl border text-sm text-red-600">Remove</button>}
                  </div>
                  {form.videoThumbnail && <img src={form.videoThumbnail} alt="" className="mt-2 h-24 object-cover rounded-lg" />}
                </Field>
              </FieldGroup>
              <FieldGroup title="Photographs">
                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
                >
                  <Upload size={24} className="mx-auto mb-2 text-slate-400" />
                  <div className="text-sm font-medium text-slate-600 mb-1">Upload Photos</div>
                  <div className="text-xs text-slate-400">JPG, PNG, WEBP · Click or drag and drop</div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                {form.images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                    {form.images.map(img => (
                      <div key={img.id} className="relative group rounded-xl overflow-hidden border border-slate-200">
                        <img src={img.dataUrl} alt={img.caption || 'Advisory image'} className="w-full h-36 object-cover" />
                        {img.isCover && (
                          <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                            <Star size={10} /> Cover
                          </div>
                        )}
                        <div className="p-2 bg-white">
                          <input
                            type="text"
                            value={img.caption}
                            onChange={e => updateImage(img.id, { caption: e.target.value })}
                            placeholder="Caption..."
                            className="w-full text-xs border-none bg-transparent text-slate-600 placeholder-slate-400"
                            style={{ outline: 'none' }}
                          />
                        </div>
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!img.isCover && (
                            <button
                              onClick={() => setCoverImage(img.id)}
                              title="Set as cover"
                              className="w-7 h-7 rounded-lg bg-white/90 flex items-center justify-center text-amber-500 hover:bg-amber-50 shadow-sm"
                            >
                              <Star size={12} />
                            </button>
                          )}
                          <button
                            onClick={() => removeImage(img.id)}
                            className="w-7 h-7 rounded-lg bg-white/90 flex items-center justify-center text-red-500 hover:bg-red-50 shadow-sm"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </FieldGroup>
            </div>
          )}

          {/* DOCUMENT DESIGN */}
          {tab === 'design' && (
            <div>
              <FieldGroup title="Background Template">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {BACKGROUND_TEMPLATES.map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => set('backgroundTemplate', t.id)}
                      className="rounded-xl overflow-hidden border-2 text-left"
                      style={{ borderColor: form.backgroundTemplate === t.id ? '#1769AA' : '#e2e8f0' }}
                    >
                      <div className="h-16" style={{ background: t.preview }} />
                      <div className="px-2 py-2 text-[11px] font-semibold text-slate-700">{t.label}</div>
                    </button>
                  ))}
                </div>
              </FieldGroup>
              <FieldGroup title="Custom Background">
                <input ref={bgRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  const reader = new FileReader()
                  reader.onload = ev => {
                    setForm(prev => ({ ...prev, customBackground: ev.target?.result as string, backgroundTemplate: 'custom' }))
                  }
                  reader.readAsDataURL(file)
                }} />
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => bgRef.current?.click()} className="btn-3d btn-3d-primary px-4 py-2 rounded-xl text-sm">Upload background</button>
                  {form.customBackground && (
                    <button type="button" onClick={() => { set('customBackground', ''); set('backgroundTemplate', 'ndma-blue') }} className="px-4 py-2 rounded-xl border text-sm">Remove</button>
                  )}
                </div>
                {form.customBackground && <img src={form.customBackground} alt="Custom background" className="mt-3 h-28 w-full object-cover rounded-xl" />}
                <p className="text-xs text-slate-500 mt-2">PNG, JPG or WEBP. A readability overlay is applied automatically so text stays clear.</p>
              </FieldGroup>
              <FieldGroup title="Document Theme">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {DOCUMENT_THEMES.map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => set('documentTheme', t.id as DocumentTheme)}
                      className="px-3 py-3 rounded-xl border text-left"
                      style={{ borderColor: form.documentTheme === t.id ? t.accent : '#e2e8f0', background: form.documentTheme === t.id ? '#F8FAFC' : 'white' }}
                    >
                      <div className="h-2 rounded-full mb-2" style={{ background: `linear-gradient(90deg, ${t.header}, ${t.accent}, ${t.band})` }} />
                      <div className="text-xs font-bold text-slate-700">{t.label}</div>
                    </button>
                  ))}
                </div>
              </FieldGroup>
              <FieldGroup title="Logos for this advisory">
                <input ref={logoRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  const reader = new FileReader()
                  reader.onload = ev => set('orgLogo', ev.target?.result as string)
                  reader.readAsDataURL(file)
                }} />
                <button type="button" onClick={() => logoRef.current?.click()} className="px-4 py-2 rounded-xl border text-sm">Upload organization logo</button>
                {form.orgLogo && <img src={form.orgLogo} alt="" className="mt-2 h-14 object-contain" />}
                <p className="text-xs text-slate-500 mt-2">Default logos can also be set in Document Settings. These override for this advisory only.</p>
              </FieldGroup>
              <FieldGroup title="Key Takeaway & Contacts">
                <Field label="Key Takeaway">
                  <textarea value={form.keyTakeaway} onChange={e => set('keyTakeaway', e.target.value)} className={TEXTAREA_CLS} rows={3} style={{ outline: 'none' }} />
                </Field>
                <Field label="Contact / Escalation">
                  <textarea value={form.contactInfo} onChange={e => set('contactInfo', e.target.value)} className={TEXTAREA_CLS} rows={2} style={{ outline: 'none' }} />
                </Field>
                <Field label="Sources / References">
                  <textarea value={form.references} onChange={e => set('references', e.target.value)} className={TEXTAREA_CLS} rows={2} style={{ outline: 'none' }} />
                </Field>
              </FieldGroup>
            </div>
          )}

          {/* PREVIEW */}
          {tab === 'preview' && (
            <div>
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span className="text-sm text-slate-500">Live document preview</span>
                {(['desktop', 'mobile', 'print'] as const).map(mode => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPreviewMode(mode)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider"
                    style={{ background: previewMode === mode ? '#0B1F3A' : '#e2e8f0', color: previewMode === mode ? 'white' : '#475569' }}
                  >
                    {mode} preview
                  </button>
                ))}
                <button onClick={() => handleSave(false)} className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  <Save size={14} /> Save
                </button>
                <button onClick={() => handleSave(true)} className="btn-3d btn-3d-green flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm">
                  <Globe size={14} /> Publish
                </button>
              </div>
              <div className={`rounded-2xl overflow-hidden border border-slate-200 shadow-lg mx-auto ${previewMode === 'mobile' ? 'max-w-sm' : 'max-w-4xl'}`}>
                <AdvisoryDocument advisory={previewAdvisory} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Library modal */}
      {showLibrary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[80vh] flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-700">Content Library</h3>
              <button onClick={() => setShowLibrary(null)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {library.filter(item => {
                if (showLibrary === 'dos') return item.category === 'Do'
                if (showLibrary === 'donts') return item.category === "Don't"
                if (showLibrary === 'engineeringRecommendations') return item.category === 'Engineering'
                return item.category === 'Measure'
              }).length === 0 ? (
                <div className="text-center text-slate-400 text-sm py-8">No items in library for this category</div>
              ) : (
                library.filter(item => {
                  if (showLibrary === 'dos') return item.category === 'Do'
                  if (showLibrary === 'donts') return item.category === "Don't"
                  if (showLibrary === 'engineeringRecommendations') return item.category === 'Engineering'
                  return item.category === 'Measure'
                }).map(item => (
                  <div key={item.id} className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 cursor-pointer transition-all group"
                    onClick={() => {
                      const field = showLibrary as keyof typeof form
                      const current = form[field] as string[]
                      if (!current.includes(item.text)) {
                        const updated = current.filter(Boolean)
                        set(field as any, [...updated, item.text])
                      }
                      setShowLibrary(null)
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-slate-700 leading-relaxed">{item.text}</div>
                      <div className="text-xs text-slate-400 mt-1">{item.hazard} · {item.infrastructure}</div>
                    </div>
                    <Plus size={14} className="text-blue-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
