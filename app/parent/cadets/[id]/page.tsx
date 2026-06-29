import Link from 'next/link'
import ParentCadetNotFound from '@/app/parent/components/ParentCadetNotFound'
import { assertParentLinkedToCadet, getLinkedCadetsForParent } from '@/app/lib/parent-queries'

export default async function ParentCadetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const linked = await assertParentLinkedToCadet(id)
  if (!linked) return <ParentCadetNotFound />

  const cadets = await getLinkedCadetsForParent()
  const cadet = cadets.find((c) => c.cadet_id === id)
  if (!cadet) return <ParentCadetNotFound />

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
      <Link href="/parent" className="text-sm text-primary hover:underline">
        ← My cadet(s)
      </Link>

      <div>
        <h1 className="text-2xl font-bold">
          {cadet.first_name} {cadet.last_name}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {cadet.company_name ?? '—'}
          {cadet.grade_level ? ` · Grade ${cadet.grade_level}` : ''}
          {cadet.room_number ? ` · Room ${cadet.room_number}` : ''}
        </p>
      </div>

      {cadet.archived && (
        <div className="p-3 text-sm bg-amber-500/10 border border-amber-500/30 rounded-lg">
          This cadet is archived. You have read-only access to historical information.
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        <Link
          href={`/parent/cadets/${id}/conduct`}
          className="bg-card border border-border rounded-xl p-5 hover:bg-muted/30 transition-colors"
        >
          <p className="font-semibold">Conduct</p>
          <p className="text-sm text-muted-foreground mt-1">Demerits, conduct level, and events by term.</p>
        </Link>
        <Link
          href={`/parent/cadets/${id}/travel`}
          className="bg-card border border-border rounded-xl p-5 hover:bg-muted/30 transition-colors"
        >
          <p className="font-semibold">Travel</p>
          <p className="text-sm text-muted-foreground mt-1">
            {cadet.archived ? 'View past requests (read-only).' : 'Submit and track travel requests.'}
          </p>
        </Link>
      </div>
    </div>
  )
}
