import type { CSSProperties } from 'react'
import type { BackgroundTemplate, DocumentTheme, HazardType, Severity } from '../types'

/**
 * Shared document tokens. The PDF renderer and the browser preview both read these
 * so a published advisory looks the same on screen and on paper.
 */
export const DOC_ACCENT = {
  navy: '#071A33',
  blue: '#168DDB',
  cyan: '#12B8D6',
  teal: '#10A99A',
  green: '#20B26B',
  amber: '#F2A900',
  orange: '#F47B20',
  red: '#E5484D',
  purple: '#7357D9',
  slate: '#475569',
  grey: '#64748B',
}

export const SEVERITY_COLOR: Record<Severity, string> = {
  Normal: '#1D4ED8',
  Low: '#16A34A',
  Moderate: '#D97706',
  High: '#EA580C',
  Critical: '#DC2626',
}

export const HAZARD_COLOR: Record<HazardType, string> = {
  'Flood': DOC_ACCENT.blue,
  'Flash Flood': DOC_ACCENT.blue,
  'Urban Flooding': DOC_ACCENT.cyan,
  'Earthquake': DOC_ACCENT.orange,
  'GLOF': DOC_ACCENT.cyan,
  'Landslide': DOC_ACCENT.amber,
  'Avalanche': DOC_ACCENT.cyan,
  'Cyclone': DOC_ACCENT.blue,
  'Windstorm': DOC_ACCENT.blue,
  'Heavy Rainfall': DOC_ACCENT.blue,
  'Urban Fire': DOC_ACCENT.red,
  'Drought': DOC_ACCENT.amber,
  'Extreme Heat': DOC_ACCENT.orange,
  'Multi-Hazard': DOC_ACCENT.navy,
  'Other': DOC_ACCENT.slate,
}

export function hazardColor(hazard: HazardType): string {
  return HAZARD_COLOR[hazard] || DOC_ACCENT.blue
}

/** Semantic accent per document section, kept identical in the PDF and the preview. */
export const SECTION_COLOR = {
  brief: DOC_ACCENT.blue,
  situation: DOC_ACCENT.cyan,
  problem: DOC_ACCENT.red,
  assets: DOC_ACCENT.orange,
  risk: DOC_ACCENT.amber,
  observations: DOC_ACCENT.blue,
  recommendations: DOC_ACCENT.teal,
  actions: DOC_ACCENT.orange,
  publicConduct: DOC_ACCENT.green,
  visuals: DOC_ACCENT.navy,
  video: DOC_ACCENT.purple,
  guidance: DOC_ACCENT.cyan,
  contact: DOC_ACCENT.slate,
  references: DOC_ACCENT.grey,
}

export const ACTION_PHASE_COLOR = {
  immediate: DOC_ACCENT.red,
  shortTerm: DOC_ACCENT.amber,
  mediumTerm: DOC_ACCENT.blue,
  longTerm: DOC_ACCENT.green,
}

export const DOCUMENT_THEMES: { id: DocumentTheme; label: string; header: string; accent: string; band: string; ink: string }[] = [
  { id: 'blue-engineering', label: 'Blue Engineering', header: '#071A33', accent: '#168DDB', band: '#12B8D6', ink: '#071A33' },
  { id: 'green-resilience', label: 'Green Resilience', header: '#0B3D2E', accent: '#20B26B', band: '#34D399', ink: '#064E3B' },
  { id: 'red-alert', label: 'Red Alert', header: '#3B0A0A', accent: '#E5484D', band: '#F87171', ink: '#7F1D1D' },
  { id: 'orange-recovery', label: 'Orange Recovery', header: '#431407', accent: '#F47B20', band: '#F59E0B', ink: '#7C2D12' },
  { id: 'navy-government', label: 'Navy Government', header: '#071A33', accent: '#123E68', band: '#F2A900', ink: '#071A33' },
  { id: 'clean-professional', label: 'Clean Professional', header: '#123E68', accent: '#168DDB', band: '#12B8D6', ink: '#1E2937' },
]

export const BACKGROUND_TEMPLATES: { id: BackgroundTemplate; label: string; preview: string }[] = [
  { id: 'ndma-blue', label: 'NDMA / Government Blue', preview: 'linear-gradient(160deg, #071A33, #168DDB, #E8F4FC)' },
  { id: 'engineering-grid', label: 'Engineering Grid', preview: 'linear-gradient(160deg, #071A33, #123E68, #DBEAFE)' },
  { id: 'resilience-blue', label: 'Resilience Blue', preview: 'linear-gradient(160deg, #071A33, #168DDB, #12B8D6)' },
  { id: 'infra-technical', label: 'Infrastructure Technical', preview: 'radial-gradient(circle, #12B8D6, #071A33)' },
  { id: 'disaster-alert', label: 'Disaster Alert', preview: 'linear-gradient(160deg, #3B0A0A, #E5484D, #FFF7ED)' },
  { id: 'clean-government', label: 'Clean Government', preview: 'linear-gradient(160deg, #071A33, #123E68, #F5F9FD)' },
  { id: 'green-resilience', label: 'Green Resilience', preview: 'linear-gradient(160deg, #0B3D2E, #20B26B, #ECFDF5)' },
  { id: 'custom', label: 'Custom Background', preview: 'linear-gradient(135deg, #94A3B8, #E2E8F0)' },
]

export function themeOf(id?: DocumentTheme) {
  return DOCUMENT_THEMES.find(t => t.id === id) || DOCUMENT_THEMES[0]
}

export function backgroundLayer(template: BackgroundTemplate | undefined, custom?: string): CSSProperties {
  if (template === 'custom' && custom) {
    return {
      backgroundImage: `linear-gradient(180deg, rgba(7,26,51,0.55) 0%, rgba(7,26,51,0.25) 40%, rgba(245,249,253,0.88) 100%), url(${custom})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }
  }

  const map: Record<Exclude<BackgroundTemplate, 'custom'>, CSSProperties> = {
    'ndma-blue': {
      backgroundColor: '#E8F4FC',
      backgroundImage: [
        'radial-gradient(circle at 85% 15%, rgba(18,184,214,0.22), transparent 42%)',
        'radial-gradient(circle at 12% 85%, rgba(22,141,219,0.18), transparent 38%)',
        'linear-gradient(180deg, rgba(7,26,51,0.14) 0%, rgba(22,141,219,0.08) 28%, rgba(232,244,252,0.95) 72%)',
        'repeating-linear-gradient(135deg, transparent 0 36px, rgba(22,141,219,0.05) 36px 37px)',
      ].join(','),
    },
    'engineering-grid': {
      backgroundColor: '#F0F7FF',
      backgroundImage: [
        'linear-gradient(180deg, rgba(7,26,51,0.12) 0%, transparent 180px)',
        'repeating-linear-gradient(0deg, transparent 0 23px, rgba(22,141,219,0.08) 23px 24px)',
        'repeating-linear-gradient(90deg, transparent 0 23px, rgba(22,141,219,0.08) 23px 24px)',
        'radial-gradient(circle at 20% 80%, rgba(18,184,214,0.15), transparent 45%)',
      ].join(','),
    },
    'resilience-blue': {
      backgroundColor: '#E0F7FA',
      backgroundImage: [
        'radial-gradient(circle at 10% 20%, rgba(18,184,214,0.25), transparent 40%)',
        'radial-gradient(circle at 90% 70%, rgba(22,141,219,0.20), transparent 42%)',
        'linear-gradient(165deg, rgba(7,26,51,0.16) 0%, rgba(22,141,219,0.10) 35%, rgba(224,247,250,0.92) 70%)',
      ].join(','),
    },
    'infra-technical': {
      backgroundColor: '#F5F9FD',
      backgroundImage: [
        'radial-gradient(circle at 12% 8%, rgba(18,184,214,0.28), transparent 28%)',
        'radial-gradient(circle at 88% 92%, rgba(115,87,217,0.14), transparent 32%)',
        'linear-gradient(180deg, rgba(7,26,51,0.14) 0%, rgba(18,62,104,0.08) 25%, rgba(245,249,253,0.94) 65%)',
      ].join(','),
    },
    'disaster-alert': {
      backgroundColor: '#FFF7ED',
      backgroundImage: [
        'radial-gradient(circle at 80% 10%, rgba(229,72,77,0.18), transparent 40%)',
        'linear-gradient(180deg, rgba(59,10,10,0.14) 0%, rgba(244,123,32,0.10) 30%, rgba(255,247,237,0.95) 65%)',
      ].join(','),
    },
    'clean-government': {
      backgroundColor: '#F5F9FD',
      backgroundImage: [
        'linear-gradient(180deg, rgba(7,26,51,0.12) 0%, rgba(18,62,104,0.06) 22%, rgba(245,249,253,0.96) 55%)',
        'repeating-linear-gradient(90deg, transparent 0 48px, rgba(22,141,219,0.04) 48px 49px)',
      ].join(','),
    },
    'green-resilience': {
      backgroundColor: '#ECFDF5',
      backgroundImage: [
        'radial-gradient(circle at 15% 25%, rgba(32,178,107,0.22), transparent 42%)',
        'linear-gradient(180deg, rgba(11,61,46,0.14) 0%, rgba(32,178,107,0.10) 28%, rgba(236,253,245,0.95) 68%)',
      ].join(','),
    },
  }

  const key = !template || template === 'custom' ? 'ndma-blue' : template
  return map[key]
}
