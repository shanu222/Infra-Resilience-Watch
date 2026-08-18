import type { CSSProperties } from 'react'
import type { BackgroundTemplate, DocumentTheme } from '../types'

export const DOCUMENT_THEMES: { id: DocumentTheme; label: string; header: string; accent: string; band: string; ink: string }[] = [
  { id: 'blue-engineering', label: 'Blue Engineering', header: '#0B1F3A', accent: '#1769AA', band: '#16B8D4', ink: '#0B1F3A' },
  { id: 'green-resilience', label: 'Green Resilience', header: '#0B3D2E', accent: '#168A5B', band: '#34D399', ink: '#064E3B' },
  { id: 'red-alert', label: 'Red Alert', header: '#3B0A0A', accent: '#D64545', band: '#F87171', ink: '#7F1D1D' },
  { id: 'orange-recovery', label: 'Orange Recovery', header: '#431407', accent: '#EA580C', band: '#F59E0B', ink: '#7C2D12' },
  { id: 'navy-government', label: 'Navy Government', header: '#0B1F3A', accent: '#1E3A5F', band: '#C9A227', ink: '#0B1F3A' },
  { id: 'clean-professional', label: 'Clean Professional', header: '#111827', accent: '#1769AA', band: '#94A3B8', ink: '#1E2937' },
]

export const BACKGROUND_TEMPLATES: { id: BackgroundTemplate; label: string; preview: string }[] = [
  { id: 'ndma-blue', label: 'NDMA / Government Blue', preview: 'linear-gradient(180deg, #0B1F3A 0%, #1769AA 42%, #F4F7FB 42%)' },
  { id: 'engineering-grid', label: 'Engineering Grid', preview: 'linear-gradient(180deg, #0B1F3A 0 28%, #F4F7FB 28%), repeating-linear-gradient(0deg, transparent, transparent 23px, rgba(23,105,170,0.08) 24px)' },
  { id: 'resilience-blue', label: 'Resilience Blue', preview: 'linear-gradient(160deg, #0B1F3A 0%, #1769AA 38%, #16B8D4 100%)' },
  { id: 'infra-technical', label: 'Infrastructure Technical', preview: 'radial-gradient(circle at 20% 20%, #16B8D4 0, transparent 28%), linear-gradient(180deg, #0B1F3A, #12385F)' },
  { id: 'disaster-alert', label: 'Disaster Alert', preview: 'linear-gradient(180deg, #3B0A0A 0%, #D64545 32%, #FFF7ED 32%)' },
  { id: 'clean-government', label: 'Clean Government', preview: 'linear-gradient(180deg, #0B1F3A 0 18%, #FFFFFF 18%)' },
  { id: 'green-resilience', label: 'Green Resilience', preview: 'linear-gradient(180deg, #0B3D2E 0%, #168A5B 34%, #ECFDF5 34%)' },
  { id: 'custom', label: 'Custom Background', preview: 'linear-gradient(135deg, #94A3B8, #E2E8F0)' },
]

export function themeOf(id?: DocumentTheme) {
  return DOCUMENT_THEMES.find(t => t.id === id) || DOCUMENT_THEMES[0]
}

export function backgroundLayer(template: BackgroundTemplate | undefined, custom?: string): CSSProperties {
  if (template === 'custom' && custom) {
    return {
      backgroundImage: `url(${custom})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }
  }
  const map: Record<Exclude<BackgroundTemplate, 'custom'>, CSSProperties> = {
    'ndma-blue': {
      backgroundImage: 'linear-gradient(180deg, #0B1F3A 0%, #12385F 36%, #F4F7FB 36%)',
    },
    'engineering-grid': {
      backgroundColor: '#F4F7FB',
      backgroundImage: 'linear-gradient(180deg, #0B1F3A 0 120px, transparent 120px), repeating-linear-gradient(0deg, transparent 0 23px, rgba(23,105,170,0.07) 23px 24px), repeating-linear-gradient(90deg, transparent 0 23px, rgba(23,105,170,0.07) 23px 24px)',
    },
    'resilience-blue': {
      backgroundImage: 'linear-gradient(165deg, #0B1F3A 0%, #1769AA 45%, #E8F7FB 45%)',
    },
    'infra-technical': {
      backgroundColor: '#F4F7FB',
      backgroundImage: 'radial-gradient(circle at 12% 8%, rgba(22,184,212,0.28), transparent 26%), linear-gradient(180deg, #0B1F3A 0 130px, transparent 130px)',
    },
    'disaster-alert': {
      backgroundImage: 'linear-gradient(180deg, #3B0A0A 0%, #9B1C1C 120px, #FFF7ED 120px)',
    },
    'clean-government': {
      backgroundImage: 'linear-gradient(180deg, #0B1F3A 0 88px, #FFFFFF 88px)',
    },
    'green-resilience': {
      backgroundImage: 'linear-gradient(180deg, #0B3D2E 0%, #168A5B 120px, #ECFDF5 120px)',
    },
  }
  return map[(template || 'ndma-blue') === 'custom' ? 'ndma-blue' : (template || 'ndma-blue')]
}
