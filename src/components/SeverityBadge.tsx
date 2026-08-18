import type { Severity } from '../types'

const STYLES: Record<Severity, string> = {
  Normal: 'severity-normal',
  Advisory: 'severity-advisory',
  High: 'severity-high',
  Critical: 'severity-critical',
}

const INDICATORS: Record<Severity, string> = {
  Normal: '#1D4ED8',
  Advisory: '#D97706',
  High: '#EA580C',
  Critical: '#DC2626',
}

interface Props {
  severity: Severity
  size?: 'sm' | 'md' | 'lg'
  pulse?: boolean
}

export default function SeverityBadge({ severity, size = 'md', pulse = false }: Props) {
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : size === 'lg' ? 'text-sm px-4 py-1.5 font-bold' : 'text-xs px-3 py-1'
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold tracking-wide uppercase ${sizeClass} ${STYLES[severity]}`}>
      <span
        className={`inline-block rounded-full ${pulse ? 'animate-pulse' : ''}`}
        style={{ width: 6, height: 6, background: INDICATORS[severity] }}
      />
      {severity}
    </span>
  )
}

export function severityColor(severity: Severity): string {
  return INDICATORS[severity]
}

export function severityBgStrong(severity: Severity): string {
  const MAP: Record<Severity, string> = {
    Normal: '#1D4ED8',
    Advisory: '#D97706',
    High: '#EA580C',
    Critical: '#DC2626',
  }
  return MAP[severity]
}
