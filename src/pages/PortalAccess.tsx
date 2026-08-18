import { useNavigate } from 'react-router-dom'
import { Shield, ArrowRight, Lock } from 'lucide-react'
import { BRAND } from '../data/constants'

export default function PortalAccess() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0A1628 0%, #1E3A5F 55%, #162B52 100%)' }}>
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'radial-gradient(circle at center, rgba(6,182,212,0.8) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }} />

      <div className="relative w-full max-w-3xl text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6" style={{ background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)' }}>
          <Shield size={32} style={{ color: '#06B6D4' }} />
        </div>

        <div className="text-xs font-semibold tracking-[0.28em] text-cyan-300 uppercase mb-3">Pakistan Infrastructure Intelligence</div>
        <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4" style={{ fontFamily: 'DM Serif Display, serif' }}>
          {BRAND.name}
        </h1>
        <p className="text-slate-300 text-base md:text-lg max-w-xl mx-auto mb-2">
          {BRAND.landingLine}
        </p>
        <p className="text-cyan-300/80 text-sm tracking-wide mb-10">{BRAND.tagline}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto mb-12">
          <button
            type="button"
            onClick={() => navigate('/user')}
            className="group rounded-2xl px-6 py-6 text-left transition-all hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, #1D4ED8, #06B6D4)', boxShadow: '0 18px 40px rgba(6,182,212,0.25)' }}
          >
            <div className="text-[11px] font-bold uppercase tracking-widest text-white/80 mb-2">Public access</div>
            <div className="text-white text-lg font-bold mb-2">Open User Portal</div>
            <div className="text-white/80 text-sm mb-4">Browse published issues, advisories, solutions and field intelligence.</div>
            <div className="flex items-center gap-2 text-white text-sm font-semibold">
              Enter <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="group rounded-2xl px-6 py-6 text-left transition-all hover:-translate-y-0.5"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', backdropFilter: 'blur(16px)' }}
          >
            <div className="text-[11px] font-bold uppercase tracking-widest text-cyan-300 mb-2 flex items-center gap-1.5">
              <Lock size={11} /> Authorized access
            </div>
            <div className="text-white text-lg font-bold mb-2">Open Admin Portal</div>
            <div className="text-slate-400 text-sm mb-4">Create, edit, publish and manage infrastructure intelligence.</div>
            <div className="flex items-center gap-2 text-cyan-300 text-sm font-semibold">
              Enter <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
          {BRAND.pipeline.map((step, i) => (
            <div key={step} className="flex items-center gap-2 md:gap-3">
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-cyan-200 px-3 py-1.5 rounded-full" style={{ background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.25)' }}>
                {step}
              </span>
              {i < BRAND.pipeline.length - 1 && (
                <span className="text-slate-500 text-xs hidden sm:inline">↓</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
