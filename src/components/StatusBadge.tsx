import type { Status } from '../types'

const STYLES: Record<Status, string> = {
  Draft: 'status-draft',
  Review: 'status-review',
  Published: 'status-published',
  Scheduled: 'status-scheduled',
  Archived: 'status-archived',
}

interface Props {
  status: Status
  size?: 'sm' | 'md'
}

export default function StatusBadge({ status, size = 'md' }: Props) {
  const sz = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1'
  return (
    <span className={`inline-flex items-center rounded-md font-medium ${sz} ${STYLES[status]}`}>
      {status}
    </span>
  )
}
