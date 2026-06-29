export type LegalSection = {
  title: string
  body: string
}

export type LegalDocument = {
  docKey: string
  version: string
  effectiveDate: string
  title: string
  sections: LegalSection[]
}

export const REQUIRED_LEGAL_DOCS = [
  { doc_key: 'terms_of_service', version: '2026-06-01' },
  { doc_key: 'privacy_policy', version: '2026-06-01' },
  { doc_key: 'parent_portal_agreement', version: '2026-06-01' },
] as const

export const LEGAL_DOC_LABELS: Record<string, string> = {
  terms_of_service: 'Terms of Service',
  privacy_policy: 'Privacy Policy',
  parent_portal_agreement: 'Parent Portal Agreement',
}

export const LEGAL_DOC_PATHS: Record<string, string> = {
  terms_of_service: '/legal/terms-of-service',
  privacy_policy: '/legal/privacy-policy',
  parent_portal_agreement: '/legal/parent-portal-agreement',
}
