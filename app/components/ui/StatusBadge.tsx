import React from 'react'

type StatusBadgeProps = {
  status: string
  type?: 'report' | 'incident' | 'appeal' | 'workorder'
}

export function StatusBadge({ status, type = 'report' }: StatusBadgeProps) {
  const formatStatus = (s: string) => {
    if (!s) return 'Unknown'
    if (s === 'pulled') return 'Pulled'
    return s.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  }

  const getStyle = () => {
    // Incident Special Case
    if (type === 'incident') return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'

    if (type === 'workorder') {
      switch (status) {
        case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
        case 'cancelled': return 'bg-muted text-muted-foreground'
        case 'forwarded':
        case 'assigned': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
        case 'tac_review': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
        default: return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      }
    }
    
    // Appeal Special Cases
    if (type === 'appeal') {
         if (status === 'approved') return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
         if (status === 'rejected_final') return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
         return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    }

    // Standard Report Statuses
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
      case 'pending_approval': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
      case 'needs_revision': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
      case 'pulled': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
    }
  }

  const label =
    type === 'incident'
      ? 'INCIDENT'
      : type === 'appeal'
        ? formatStatus(status).replace('Rejected Final', 'Appeal Denied').replace('Approved', 'Appeal Granted')
        : formatStatus(status);

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStyle()}`}>
      {label}
    </span>
  )
}