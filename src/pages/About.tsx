import { Shield } from 'lucide-react'
import { BRAND } from '../data/constants'

const PRINCIPLES = [
  {
    title: 'Observe',
    body: 'Capture infrastructure problems, field observations, photographs and damage conditions as they are reported.',
  },
  {
    title: 'Identify',
    body: 'Classify hazards, locations, infrastructure types and issue categories so teams can find the right intelligence quickly.',
  },
  {
    title: 'Assess',
    body: 'Record risks, current situation and affected assets without inventing statistics or unverified claims.',
  },
  {
    title: 'Advise',
    body: 'Publish advisories, public guidance and immediate actions for engineers, agencies and communities.',
  },
  {
    title: 'Solve',
    body: 'Share engineering recommendations, recovery measures and practical solutions that can be applied in the field.',
  },
  {
    title: 'Build Resilience',
    body: 'Document Build Back Better practices and case studies so reconstruction is stronger than what stood before.',
  },
]

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: '#ecfeff', border: '1px solid #a5f3fc' }}>
          <Shield size={22} style={{ color: '#0E7490' }} />
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-cyan-700">About the platform</div>
          <h1 className="text-3xl font-bold text-slate-800" style={{ fontFamily: 'DM Serif Display, serif' }}>{BRAND.name}</h1>
        </div>
      </div>

      <p className="text-slate-600 leading-relaxed mb-4">{BRAND.description}</p>
      <p className="text-slate-500 text-sm leading-relaxed mb-10">
        This is a daily infrastructure intelligence and resilience platform. It is not limited to pre-disaster advisories.
        Authorized administrators publish issues, risks, field observations, disaster-related problems, engineering
        recommendations, videos, photographs, case studies and recovery guidance. The public User Portal shows only
        published content. The Admin Portal is where that content is created, edited and released.
      </p>

      <h2 className="text-xl font-bold text-slate-800 mb-5" style={{ fontFamily: 'DM Serif Display, serif' }}>How the platform works</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        {PRINCIPLES.map(p => (
          <div key={p.title} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="text-xs font-bold uppercase tracking-widest text-cyan-700 mb-2">{p.title}</div>
            <p className="text-sm text-slate-600 leading-relaxed">{p.body}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl p-6 text-white" style={{ background: 'linear-gradient(135deg, #0A1628, #1E3A5F)' }}>
        <div className="text-xs font-bold uppercase tracking-widest text-cyan-300 mb-2">Scope</div>
        <p className="text-sm leading-relaxed text-slate-200">
          Coverage is Pakistan-wide: provinces, districts and specific locations, across roads, bridges, buildings,
          schools, hospitals, drainage, water supply, power and communications. Content is based on information entered
          by authorized administrators and should be used together with professional engineering judgement.
        </p>
      </div>
    </div>
  )
}
