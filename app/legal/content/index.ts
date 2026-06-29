import type { LegalDocument } from './types'
import { termsOfServiceV1 } from './terms-of-service.v1'
import { privacyPolicyV1 } from './privacy-policy.v1'
import { parentPortalAgreementV1 } from './parent-portal-agreement.v1'

export const LEGAL_DOCUMENTS: Record<string, LegalDocument> = {
  terms_of_service: termsOfServiceV1,
  privacy_policy: privacyPolicyV1,
  parent_portal_agreement: parentPortalAgreementV1,
}

export function getLegalDocument(docKey: string): LegalDocument | null {
  return LEGAL_DOCUMENTS[docKey] ?? null
}
