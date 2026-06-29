import { notFound } from 'next/navigation'
import LegalDocumentView from '@/app/legal/LegalDocumentView'
import { getLegalDocument } from '@/app/legal/content'

export default function PrivacyPolicyPage() {
  const doc = getLegalDocument('privacy_policy')
  if (!doc) notFound()
  return <LegalDocumentView document={doc} />
}
