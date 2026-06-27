import {
  getMoveInFormStatus,
  STATUS_BADGE_CLASS,
  type MoveInFormStatusInput,
} from '../lib/move-in-form-status'

export default function MoveInFormStatusBadge({ form }: { form: MoveInFormStatusInput }) {
  const { label, tone } = getMoveInFormStatus(form)
  return (
    <span
      className={[
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        STATUS_BADGE_CLASS[tone],
      ].join(' ')}
    >
      {label}
    </span>
  )
}
