import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getInspectionForm, listInspectionTemplates } from '@/app/barracks/actions'
import InspectionFormEditor from '@/app/barracks/components/InspectionFormEditor'

export default async function ExternalMoveInFormPage({
  params,
}: {
  params: Promise<{ formId: string }>
}) {
  const { formId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(`/login?redirect=${encodeURIComponent(`/move-in/forms/${formId}`)}`)

  const [data, templates] = await Promise.all([
    getInspectionForm(formId, 'move_in'),
    listInspectionTemplates(),
  ])

  if (!data) notFound()

  const { form, items } = data

  if (form.submission_status === 'validated') {
    redirect(`/barracks/forms/${formId}?type=move_in`)
  }

  if (form.submission_status === 'submitted') {
    return (
      <div className="max-w-lg mx-auto px-4 py-10 space-y-4 text-center">
        <h1 className="text-xl font-bold">Submitted for review</h1>
        <p className="text-sm text-muted-foreground">
          Your move-in form for room {form.room_number} has been submitted. A TAC will review it before
          work orders are created.
        </p>
      </div>
    )
  }

  if (!form.locked_bunk || !form.locked_desk_side) {
    notFound()
  }

  const cadetName = await supabase
    .from('profiles')
    .select('first_name, last_name')
    .eq('id', form.cadet_id)
    .single()

  const displayName = cadetName.data
    ? cadetName.data.last_name && cadetName.data.first_name
      ? `${cadetName.data.last_name} ${cadetName.data.first_name.charAt(0)}.`
      : `${cadetName.data.first_name} ${cadetName.data.last_name}`.trim()
    : 'Cadet'

  return (
    <div className="max-w-lg mx-auto px-4 py-6 sm:py-8">
      <InspectionFormEditor
        roomId={form.barracks_room_id}
        roomNumber={form.room_number}
        formType="move_in"
        templates={templates}
        editorMode="external"
        formId={formId}
        lockedBunk={form.locked_bunk}
        lockedDeskSide={form.locked_desk_side}
        cadetDisplayName={displayName}
        defaultCadetId={form.cadet_id}
        backHref={`/invite/move-in`}
        successRedirect={`/move-in/forms/${formId}`}
        containerClass="space-y-5 pb-24"
        initialItems={items.map((i) => ({
          id: i.id,
          item_key: i.item_key,
          item_label: i.item_label,
          sort_order: i.sort_order,
          status: i.status,
          notes: i.notes ?? '',
        }))}
        initialNotes={form.notes ?? ''}
      />
    </div>
  )
}
