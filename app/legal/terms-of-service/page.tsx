import { notFound } from 'next/navigation'
import LegalDocumentView from '@/app/legal/LegalDocumentView'
import { getLegalDocument } from '@/app/legal/content'

export default function TermsOfServicePage() {
  const doc = getLegalDocument('terms_of_service')
  if (!doc) notFound()
  return <LegalDocumentView document={doc} />
}
