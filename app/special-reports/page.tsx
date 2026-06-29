import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getMySpecialReports } from './actions'

const STATUS_LABELS: Record<string, string> = {
  submitted: 'Submitted',
  reviewed: 'Reviewed',
  closed: 'Closed',
}

export default async function SpecialReportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role:roles(default_role_level)')
    .eq('id', user.id)
    .single()

  const roleLevel = (profile?.role as { default_role_level?: number } | null)?.default_role_level ?? 0
  if (roleLevel >= 50) redirect('/incidents')

  const reports = await getMySpecialReports()

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-start mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">My Special Reports</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Read-only view of affidavits you have submitted.
          </p>
        </div>
        <Link href="/submit?tab=special" className="btn-primary font-bold shrink-0">
          + New Report
        </Link>
      </div>

      {reports.length === 0 ? (
        <p className="text-muted-foreground">You have not submitted any special reports yet.</p>
      ) : (
        <ul className="space-y-4">
          {reports.map((report) => (
            <li
              key={report.id}
              className="bg-card border border-border rounded-lg p-4 space-y-2"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium text-foreground">
                  {new Date(report.occurred_at).toLocaleString()}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {STATUS_LABELS[report.status] ?? report.status}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{report.location}</p>
              {(report.subjects?.length ?? 0) > 0 && (
                <p className="text-xs text-muted-foreground">
                  Subjects:{' '}
                  {report.subjects!.map((s) => `${s.last_name}, ${s.first_name}`).join('; ')}
                </p>
              )}
              <p className="text-sm text-foreground line-clamp-3">{report.narrative}</p>
              {report.event && (
                <p className="text-xs text-primary">
                  Linked event: {report.event.title}
                </p>
              )}
              {report.review_notes && (
                <p className="text-xs text-muted-foreground border-t border-border pt-2">
                  Staff notes: {report.review_notes}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
