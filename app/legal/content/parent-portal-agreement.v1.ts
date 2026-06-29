import type { LegalDocument } from './types'

export const parentPortalAgreementV1: LegalDocument = {
  docKey: 'parent_portal_agreement',
  version: '2026-06-01',
  effectiveDate: '2026-06-01',
  title: 'Parent Portal Agreement',
  sections: [
    {
      title: 'Parent or guardian attestation',
      body:
        'By accepting this agreement, you represent that you are the parent or legal guardian of the cadet linked to your account, or that you are authorized by the school to access the linked cadet\'s information.',
    },
    {
      title: 'Scope of access',
      body:
        'Your portal access is limited to cadets explicitly linked to your account by school staff. You may not attempt to view other students\' records or staff-only information.',
    },
    {
      title: 'Education records notice',
      body:
        'Information available through the parent portal may include education records protected under FERPA and state student privacy laws. Do not disclose conduct or disciplinary details to unauthorized third parties.',
    },
    {
      title: 'Account security',
      body:
        'Keep your login credentials confidential. You are responsible for activity under your account. Notify the school immediately if you suspect unauthorized access.',
    },
    {
      title: 'Travel and documents',
      body:
        'Travel requests and uploaded documents submitted through the portal are shared with authorized school staff for processing. Provide accurate information.',
    },
    {
      title: 'Archived cadets',
      body:
        'When a cadet is archived at year-end or withdrawal, linked parents retain read-only access to historical conduct and previously shared summaries. New travel requests and uploads are disabled until the cadet is reactivated.',
    },
  ],
}
