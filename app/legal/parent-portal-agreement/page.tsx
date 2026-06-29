import { notFound } from 'next/navigation'
import LegalDocumentView from '@/app/legal/LegalDocumentView'
import { getLegalDocument } from '@/app/legal/content'

export default function ParentPortalAgreementPage() {
  const doc = getLegalDocument('parent_portal_agreement')
  if (!doc) notFound()
  return <LegalDocumentView document={doc} />
}
