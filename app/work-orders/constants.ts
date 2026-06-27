export const WORK_ORDER_ISSUE_PRESETS = [
  'Broken lock',
  'Damaged furniture',
  'Plumbing leak',
  'HVAC / temperature',
  'Electrical issue',
  'Pest concern',
  'Window damage',
  'Lighting fixture',
  'Other',
] as const

export const WORK_ORDER_PRIORITIES = ['low', 'normal', 'high', 'urgent'] as const

export type WorkOrderStatus =
  | 'submitted'
  | 'tac_review'
  | 'forwarded'
  | 'assigned'
  | 'completed'
  | 'cancelled'

export type WorkOrderIssueType = 'barracks' | 'other'
