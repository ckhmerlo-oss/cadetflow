import Link from 'next/link'
import {
  getLinkedCadetsForParent,
  getParentPendingMoveInForms,
} from '@/app/lib/parent-queries'
import { getConductLevelBadgeClass } from '@/app/lib/blueBook'

export default async function ParentDashboardPage() {
  const [cadets, pendingForms] = await Promise.all([
    getLinkedCadetsForParent(),
    getParentPendingMoveInForms(),
  ])

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">My Cadet(s)</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View conduct and submit travel requests for your linked cadet(s).
        </p>
      </div>

      {pendingForms.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase text-muted-foreground tracking-wide">Action needed</h2>
          {pendingForms.map((form) => (
            <Link
              key={form.form_id}
              href={`/move-in/forms/${form.form_id}`}
              className="block bg-primary/10 border border-primary/30 rounded-xl p-4 hover:bg-primary/15 transition-colors"
            >
              <p className="font-medium">Complete move-in inspection</p>
              <p className="text-sm text-muted-foreground">
                Room {form.room_number} · {form.cadet_name} · {form.submission_status}
              </p>
            </Link>
          ))}
        </div>
      )}

      {cadets.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground">
          <p>No linked cadets yet. Use the invite link from your TAC to connect your account.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {cadets.map((cadet) => (
            <div key={cadet.cadet_id} className="bg-card border border-border rounded-xl p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-lg font-semibold">
                    {cadet.first_name} {cadet.last_name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {cadet.company_name ?? '—'}
                    {cadet.room_number ? ` · Room ${cadet.room_number}` : ''}
                  </p>
                </div>
                {cadet.archived && (
                  <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-200">
                    Archived
                  </span>
                )}
              </div>
              {cadet.conduct_status && (
                <span
                  className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getConductLevelBadgeClass(cadet.conduct_status)}`}
                >
                  {cadet.conduct_status}
                </span>
              )}
              <div className="flex flex-wrap gap-2 pt-2">
                <Link
                  href={`/parent/cadets/${cadet.cadet_id}`}
                  className="text-sm px-3 py-1.5 rounded-lg border border-border hover:bg-muted/50"
                >
                  Overview
                </Link>
                <Link
                  href={`/parent/cadets/${cadet.cadet_id}/conduct`}
                  className="text-sm px-3 py-1.5 rounded-lg border border-border hover:bg-muted/50"
                >
                  Conduct
                </Link>
                <Link
                  href={`/parent/cadets/${cadet.cadet_id}/travel`}
                  className="text-sm px-3 py-1.5 rounded-lg border border-border hover:bg-muted/50"
                >
                  Travel
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
