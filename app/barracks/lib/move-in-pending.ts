export type MoveInPendingFormInput = {
  cadet_id: string
  cadet_name?: string
  completed_at?: string | null
  submission_status?: string | null
  invite_revoked_at?: string | null
  locked_bunk?: 'top' | 'bottom' | null
}

export function isActivePendingMoveInForm(form: MoveInPendingFormInput): boolean {
  if (form.completed_at) return false
  if (form.submission_status === 'validated') return false
  if (form.invite_revoked_at) return false
  return true
}

export function moveInFormAppliesToBunk(
  form: MoveInPendingFormInput,
  bunk: 'top' | 'bottom',
  occupantId: string | null
): boolean {
  if (!isActivePendingMoveInForm(form)) return false
  if (form.locked_bunk === bunk) return true
  if (!form.locked_bunk && occupantId && form.cadet_id === occupantId) return true
  return false
}

export function findPendingMoveInForBunk<T extends MoveInPendingFormInput>(
  forms: T[],
  bunk: 'top' | 'bottom',
  occupantId: string | null
): T | undefined {
  return forms.find((form) => moveInFormAppliesToBunk(form, bunk, occupantId))
}
