import { Shield, Eye, Layers, AlertTriangle, BookOpen, Wrench, Zap } from 'lucide-react'
import { BRAND } from '../data/constants'

const PRINCIPLES = [
  {
    title: 'Observe',
    body: 'Capture infrastructure problems, field observations, photographs and damage conditions as they are reported.',
    icon: Eye,
    color: '#12B8D6',
    bg: 'linear-gradient(135deg,#ecfeff,#cffafe)',
    border: '#a5f3fc',
  },
  {
    title: 'Identify',
    body: 'Classify hazards, locations, infrastructure types and issue categories so teams can find the right intelligence quickly.',
    icon: Layers,
    color: '#168DDB',
    bg: 'linear-gradient(135deg,#eff6ff,#dbeafe)',
    border: '#bfdbfe',
  },
  {
    title: 'Assess',
    body: 'Record risks, current situation and affected assets without inventing statistics or unverified claims.',
    icon: AlertTriangle,
    color: '#F2A900',
    bg: 'linear-gradient(135deg,#fffbeb,#fef3c7)',
    border: '#fde68a',
  },
  {
    title: 'Advise',
    body: 'Publish advisories, public guidance and immediate actions for engineers, agencies and communities.',
    icon: Shield,
    color: '#7357D9',
    bg: 'linear-gradient(135deg,#faf5ff,#ede9fe)',
    border: '#ddd6fe',
  },
  {
    title: 'Solve',
    body: 'Share engineering recommendations, recovery measures and practical solutions that can be applied in the field.',
    icon: Wrench,
    color: '#20B26B',
    bg: 'linear-gradient(135deg,#f0fdf4,#dcfce7)',
    border: '#bbf7d0',
  },
  {
    title: 'Build Resilience',
    body: 'Document Build Back Better practices and case studies so reconstruction is stronger than what stood before.',
    icon: Zap,
    color: '#E5484D',
    bg: 'linear-gradient(135deg,#fff1f2,#ffe4e6)',
    border: '#fecdd3',
  },
]

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Platform intro */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 mb-8 anim-fade-up" style={{ borderTop: '3px solid #168DDB' }}>
        <div className="flex items-start gap-4 mb-6">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg,#eff6ff,#dbeafe)', border: '1px solid #bfdbfe' }}
          >
            <Shield size={26} style={{ color: '#168DDB' }} />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#12B8D6' }}>
              About the platform
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 leading-tight" style={{ fontFamily: 'DM Serif Display, serif' }}>
              {BRAND.name}
            </h1>
          </div>
        </div>

        <p className="text-slate-600 leading-relaxed mb-4">{BRAND.description}</p>
        <p className="text-slate-500 text-sm leading-relaxed">
          This is a daily infrastructure intelligence and resilience platform. It is not limited to pre-disaster advisories.
          Authorized administrators publish issues, risks, field observations, disaster-related problems, engineering
          recommendations, videos, photographs, case studies and recovery guidance. The public User Portal shows only
          published content. The Admin Portal is where that content is created, edited and released.
        </p>
      </div>

      {/* Pipeline */}
      <div className="mb-10">
        <div className="text-xs font-bold uppercase tracking-widest mb-1 section-eyebrow">Intelligence Pipeline</div>
        <h2 className="text-xl font-bold user-ink mb-6" style={{ fontFamily: 'DM Serif Display, serif' }}>
          How the platform works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PRINCIPLES.map((p, idx) => {
            const Icon = p.icon
            return (
              <div
                key={p.title}
                className={`glass-panel rounded-2xl p-5 anim-fade-up delay-${(idx + 1) * 50} hover:shadow-lg transition-shadow`}
                style={{ borderLeft: `4px solid ${p.color}` }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: p.bg, border: `1px solid ${p.border}` }}
                  >
                    <Icon size={17} style={{ color: p.color }} />
                  </div>
                  <div className="text-xs font-bold uppercase tracking-widest" style={{ color: p.color }}>
                    {p.title}
                  </div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{p.body}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Content types */}
      <div className="glass-panel rounded-2xl p-6 anim-fade-up delay-300">
        <div className="text-xs font-bold uppercase tracking-widest mb-1 section-eyebrow">Published content</div>
        <h2 className="text-lg font-bold text-slate-800 mb-4" style={{ fontFamily: 'DM Serif Display, serif' }}>
          What is published on this platform
        </h2>
        <ul className="space-y-2 text-sm text-slate-600">
          {[
            'Infrastructure Issues — Problems, risks, field observations',
            'Advisories — Official hazard and infrastructure advisories',
            'Solutions — Engineering recommendations and practices',
            'Videos — Briefings, field footage and recorded observations',
            'Case Studies — Build Back Better and recovery documentation',
            'Field Photographs — On-site visual documentation',
          ].map(item => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-0.5 w-2 h-2 rounded-full shrink-0" style={{ background: '#12B8D6' }} />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
