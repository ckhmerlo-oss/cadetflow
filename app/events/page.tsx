import { redirect } from 'next/navigation'

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ create?: string; event?: string; report?: string; incident?: string; inbox?: string }>
}) {
  const params = await searchParams
  const search = new URLSearchParams()
  if (params.create) search.set('create', params.create)
  if (params.event) search.set('event', params.event)
  if (params.report) search.set('report', params.report)
  if (params.incident) search.set('incident', params.incident)
  if (params.inbox) search.set('inbox', params.inbox)
  const qs = search.toString()
  redirect(qs ? `/incidents?${qs}` : '/incidents')
}
