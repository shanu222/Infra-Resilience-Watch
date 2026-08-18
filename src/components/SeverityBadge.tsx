import type { Severity } from '../types'
import { normalizeSeverity } from '../data/constants'

const STYLES: Record<Severity, string> = {
  Normal: 'severity-normal',
  Low: 'severity-low',
  Moderate: 'severity-moderate',
  High: 'severity-high',
  Critical: 'severity-critical',
}

const INDICATORS: Record<Severity, string> = {
  Normal: '#1D4ED8',
  Low: '#16A34A',
  Moderate: '#D97706',
  High: '#EA580C',
  Critical: '#DC2626',
}

interface Props {
  severity: Severity | string
  size?: 'sm' | 'md' | 'lg'
  pulse?: boolean
}

export default function SeverityBadge({ severity, size = 'md', pulse = false }: Props) {
  const level = normalizeSeverity(severity)
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : size === 'lg' ? 'text-sm px-4 py-1.5 font-bold' : 'text-xs px-3 py-1'
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold tracking-wide uppercase ${sizeClass} ${STYLES[level]}`}>
      <span
        className={`inline-block rounded-full ${pulse ? 'animate-pulse' : ''}`}
        style={{ width: 6, height: 6, background: INDICATORS[level] }}
      />
      {level}
    </span>
  )
}

export function severityColor(severity: Severity | string): string {
  return INDICATORS[normalizeSeverity(severity)]
}

export function severityBgStrong(severity: Severity | string): string {
  const MAP: Record<Severity, string> = {
    Normal: '#1D4ED8',
    Low: '#16A34A',
    Moderate: '#D97706',
    High: '#EA580C',
    Critical: '#DC2626',
  }
  return MAP[normalizeSeverity(severity)]
}
