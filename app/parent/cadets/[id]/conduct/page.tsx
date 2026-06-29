import { assertParentLinkedToCadet, getLinkedCadetsForParent } from '@/app/lib/parent-queries'
import ParentCadetNotFound from '@/app/parent/components/ParentCadetNotFound'
import ParentConductClient from '@/app/parent/components/ParentConductClient'

export default async function ParentConductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const linked = await assertParentLinkedToCadet(id)
  if (!linked) return <ParentCadetNotFound />

  const cadets = await getLinkedCadetsForParent()
  const cadet = cadets.find((c) => c.cadet_id === id)
  if (!cadet) return <ParentCadetNotFound />

  return (
    <ParentConductClient
      cadetId={id}
      cadetName={`${cadet.first_name} ${cadet.last_name}`}
      isArchived={cadet.archived}
    />
  )
}
