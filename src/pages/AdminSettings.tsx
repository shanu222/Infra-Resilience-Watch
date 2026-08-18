import { useRef } from 'react'
import AdminLayout from '../components/AdminLayout'
import { useApp } from '../contexts/AppContext'
import { BACKGROUND_TEMPLATES, DOCUMENT_THEMES } from '../data/documentDesign'
import type { BackgroundTemplate, DocumentTheme } from '../types'

export default function AdminSettings() {
  const { settings, updateSettings } = useApp()
  const orgRef = useRef<HTMLInputElement>(null)
  const wingRef = useRef<HTMLInputElement>(null)
  const advRef = useRef<HTMLInputElement>(null)
  const bgRef = useRef<HTMLInputElement>(null)

  function read(file: File, key: 'orgLogo' | 'wingLogo' | 'advisoryLogo' | 'defaultCustomBackground') {
    const reader = new FileReader()
    reader.onload = e => updateSettings({ [key]: e.target?.result as string })
    reader.readAsDataURL(file)
  }

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold portal-heading mb-1" style={{ fontFamily: 'DM Serif Display, serif' }}>Document Settings</h1>
        <p className="portal-subheading text-sm mb-6">Organization logos and default advisory design. Individual advisories can still override these.</p>

        <div className="premium-card rounded-2xl p-5 mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600 mb-4">Logos</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <LogoSlot label="Organization logo" value={settings.orgLogo} onUpload={() => orgRef.current?.click()} onRemove={() => updateSettings({ orgLogo: '' })} />
            <LogoSlot label="Wing logo" value={settings.wingLogo} onUpload={() => wingRef.current?.click()} onRemove={() => updateSettings({ wingLogo: '' })} />
            <LogoSlot label="Advisory logo" value={settings.advisoryLogo} onUpload={() => advRef.current?.click()} onRemove={() => updateSettings({ advisoryLogo: '' })} />
          </div>
          <input ref={orgRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={e => e.target.files?.[0] && read(e.target.files[0], 'orgLogo')} />
          <input ref={wingRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={e => e.target.files?.[0] && read(e.target.files[0], 'wingLogo')} />
          <input ref={advRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={e => e.target.files?.[0] && read(e.target.files[0], 'advisoryLogo')} />
        </div>

        <div className="premium-card rounded-2xl p-5 mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600 mb-4">Default theme</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {DOCUMENT_THEMES.map(t => (
              <button key={t.id} type="button" onClick={() => updateSettings({ defaultTheme: t.id as DocumentTheme })} className="p-3 rounded-xl border text-left" style={{ borderColor: settings.defaultTheme === t.id ? t.accent : '#e2e8f0' }}>
                <div className="h-2 rounded-full mb-2" style={{ background: `linear-gradient(90deg, ${t.header}, ${t.band})` }} />
                <div className="text-xs font-bold">{t.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="premium-card rounded-2xl p-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600 mb-4">Default background</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {BACKGROUND_TEMPLATES.map(t => (
              <button key={t.id} type="button" onClick={() => updateSettings({ defaultBackgroundTemplate: t.id as BackgroundTemplate })} className="rounded-xl overflow-hidden border-2" style={{ borderColor: settings.defaultBackgroundTemplate === t.id ? '#1769AA' : '#e2e8f0' }}>
                <div className="h-14" style={{ background: t.preview }} />
                <div className="px-2 py-1.5 text-[11px] font-semibold">{t.label}</div>
              </button>
            ))}
          </div>
          <input ref={bgRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={e => {
            const f = e.target.files?.[0]
            if (!f) return
            read(f, 'defaultCustomBackground')
            updateSettings({ defaultBackgroundTemplate: 'custom' })
          }} />
          <button type="button" onClick={() => bgRef.current?.click()} className="btn-3d btn-3d-primary px-4 py-2 rounded-xl text-sm">Use as default background (upload)</button>
          {settings.defaultCustomBackground && (
            <button type="button" className="ml-2 text-sm text-red-600" onClick={() => updateSettings({ defaultCustomBackground: '', defaultBackgroundTemplate: 'ndma-blue' })}>Remove default image</button>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

function LogoSlot({ label, value, onUpload, onRemove }: { label: string; value: string; onUpload: () => void; onRemove: () => void }) {
  return (
    <div className="border border-slate-200 rounded-xl p-3">
      <div className="text-xs font-semibold text-slate-600 mb-2">{label}</div>
      {value ? <img src={value} alt="" className="h-14 object-contain mb-2" /> : <div className="h-14 bg-slate-50 rounded mb-2" />}
      <div className="flex gap-2">
        <button type="button" onClick={onUpload} className="text-xs font-semibold text-[#1769AA]">{value ? 'Replace' : 'Upload'}</button>
        {value && <button type="button" onClick={onRemove} className="text-xs text-red-600">Remove</button>}
      </div>
    </div>
  )
}
