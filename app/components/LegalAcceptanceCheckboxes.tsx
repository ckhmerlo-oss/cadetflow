'use client'

import Link from 'next/link'
import { LEGAL_DOC_LABELS, LEGAL_DOC_PATHS, REQUIRED_LEGAL_DOCS } from '@/app/legal/content/types'

type LegalAcceptanceCheckboxesProps = {
  accepted: Record<string, boolean>
  onChange: (docKey: string, checked: boolean) => void
  disabled?: boolean
}

export default function LegalAcceptanceCheckboxes({
  accepted,
  onChange,
  disabled = false,
}: LegalAcceptanceCheckboxesProps) {
  return (
    <div className="space-y-3 text-sm">
      <p className="font-medium text-foreground">Legal agreements</p>
      {REQUIRED_LEGAL_DOCS.map(({ doc_key }) => (
        <label key={doc_key} className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="mt-1"
            checked={accepted[doc_key] ?? false}
            disabled={disabled}
            onChange={(e) => onChange(doc_key, e.target.checked)}
          />
          <span className="text-muted-foreground">
            I agree to the{' '}
            <Link
              href={LEGAL_DOC_PATHS[doc_key]}
              target="_blank"
              className="text-primary hover:underline"
            >
              {LEGAL_DOC_LABELS[doc_key]}
            </Link>
          </span>
        </label>
      ))}
    </div>
  )
}

export function allLegalDocsAccepted(accepted: Record<string, boolean>): boolean {
  return REQUIRED_LEGAL_DOCS.every(({ doc_key }) => accepted[doc_key])
}
