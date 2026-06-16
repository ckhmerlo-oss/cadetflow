export const NOTIFICATION_EVENT_TYPES = {
  REPORT_SUBMITTED: 'report.submitted',
  REPORT_FINAL_APPROVED: 'report.final_approved',
  REPORT_REJECTED: 'report.rejected',
  REPORT_KICKBACK: 'report.kickback',
  REPORT_PENDING_APPROVAL: 'report.pending_approval',
  APPEAL_FINAL_APPROVED: 'appeal.final_approved',
  APPEAL_REJECTED: 'appeal.rejected',
  TOUR_ADDED: 'tour.added',
  TOUR_REMOVED: 'tour.removed',
  CONDUCT_CHANGED: 'conduct.changed',
  PROBATION_CHANGED: 'probation.changed',
  OVERSIGHT_REPORT_SUBMITTED: 'oversight.report_submitted',
  OVERSIGHT_TOUR_CHANGED: 'oversight.tour_changed',
  OVERSIGHT_CONDUCT_CHANGED: 'oversight.conduct_changed',
  INCIDENT_PENDING_REVIEW: 'incident.pending_review',
  INCIDENT_ACTIONED: 'incident.actioned',
} as const

export type NotificationEventType =
  (typeof NOTIFICATION_EVENT_TYPES)[keyof typeof NOTIFICATION_EVENT_TYPES]

export type NotificationPreferenceCategory =
  | 'new_report'
  | 'status_change'
  | 'tour_change'
  | 'conduct_change'
  | 'team_alert'

export const PREFERENCE_CATEGORIES: {
  key: NotificationPreferenceCategory
  title: string
  description: string
  emailField: string
  inAppField: string
}[] = [
  {
    key: 'new_report',
    title: 'New Reports',
    description: 'When a report is filed against you, a cadet you oversee receives a report, a report needs your approval, or an incident report needs TAC review.',
    emailField: 'email_new_report',
    inAppField: 'in_app_new_report',
  },
  {
    key: 'status_change',
    title: 'Status Updates',
    description: 'When a report or incident report you submitted is approved, rejected, returned, actioned, or when an appeal is decided.',
    emailField: 'email_status_change',
    inAppField: 'in_app_status_change',
  },
  {
    key: 'tour_change',
    title: 'Tour Sheet Changes',
    description: 'When you are added to or removed from the ED Tour Sheet, or when an oversight cadet tour status changes.',
    emailField: 'email_tour_change',
    inAppField: 'in_app_tour_change',
  },
  {
    key: 'conduct_change',
    title: 'Conduct / Probation Changes',
    description: 'When conduct level or probation status changes for you or an oversight cadet.',
    emailField: 'email_conduct_change',
    inAppField: 'in_app_conduct_change',
  },
  {
    key: 'team_alert',
    title: 'Sports Team Alerts',
    description: 'Alerts regarding athletes on teams you coach.',
    emailField: 'email_team_alert',
    inAppField: 'in_app_team_alert',
  },
]
