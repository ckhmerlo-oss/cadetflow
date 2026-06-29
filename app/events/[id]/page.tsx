import { redirect } from 'next/navigation'

export default async function EventDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ report?: string; incident?: string }>
}) {
  const { id } = await params
  const query = await searchParams
  const search = new URLSearchParams()
  search.set('event', id)
  if (query.report) search.set('report', query.report)
  if (query.incident) search.set('incident', query.incident)
  redirect(`/incidents?${search.toString()}`)
}
