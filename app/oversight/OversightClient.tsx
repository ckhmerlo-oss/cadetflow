'use client'

import Link from 'next/link'
import type { OversightCadet } from './types'

const TYPE_LABELS: Record<string, string> = {
  teacher: 'Teacher',
  coach: 'Coach',
  tac: 'TAC',
  secondary: 'Seminar',
  faculty: 'Faculty',
}

export default function OversightClient({ cadets }: { cadets: OversightCadet[] }) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Cadet</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Company</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Roles</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {cadets.length === 0 ? (
            <tr>
              <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground italic">
                No cadets under your oversight yet.
              </td>
            </tr>
          ) : (
            cadets.map((c) => (
              <tr key={c.cadet_id} className="hover:bg-muted/30">
                <td className="px-4 py-3">
                  <Link href={`/profile/${c.cadet_id}`} className="text-primary hover:underline font-medium">
                    {c.last_name}, {c.first_name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{c.company_name ?? '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {c.assignment_types.map((t) => (
                      <span
                        key={t}
                        className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20"
                      >
                        {TYPE_LABELS[t] ?? t}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
