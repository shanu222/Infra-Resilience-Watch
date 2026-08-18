import type { ContentKind } from '../types'
import { KIND_LABEL } from '../data/constants'

const STYLES: Record<ContentKind, { bg: string; text: string; border: string }> = {
  issue: { bg: '#fff7ed', text: '#9a3412', border: '#fed7aa' },
  advisory: { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
  solution: { bg: '#ecfdf5', text: '#065f46', border: '#a7f3d0' },
  video: { bg: '#f5f3ff', text: '#5b21b6', border: '#ddd6fe' },
  'case-study': { bg: '#ecfeff', text: '#155e75', border: '#a5f3fc' },
  observation: { bg: '#f1f5f9', text: '#334155', border: '#cbd5e1' },
}

export default function KindBadge({ kind, size = 'sm' }: { kind: ContentKind; size?: 'sm' | 'md' }) {
  const s = STYLES[kind] || STYLES.observation
  const pad = size === 'md' ? 'px-3 py-1 text-xs' : 'px-2 py-0.5 text-[10px]'
  return (
    <span
      className={`inline-flex items-center rounded-full font-bold uppercase tracking-wider ${pad}`}
      style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}
    >
      {KIND_LABEL[kind] || kind}
    </span>
  )
}
