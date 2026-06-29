import type { LegalDocument } from './types'

export const privacyPolicyV1: LegalDocument = {
  docKey: 'privacy_policy',
  version: '2026-06-01',
  effectiveDate: '2026-06-01',
  title: 'Privacy Policy',
  sections: [
    {
      title: 'Information we collect',
      body:
        'CadetFlow collects names, email addresses, phone numbers, company/grade assignments, conduct and disciplinary records, room assignments, travel request details, and files you upload (when enabled). Parent accounts store contact information and linkage to cadet records.',
    },
    {
      title: 'How we use information',
      body:
        'Information is used to operate disciplinary workflows, parent communication, barracks inspections, travel processing, and school reporting. We do not sell personal information.',
    },
    {
      title: 'Retention',
      body:
        'Disciplinary and historical conduct records are retained according to school policy and system archive rules. Archived cadet records remain accessible to authorized staff and linked parents in read-only form unless reactivated.',
    },
    {
      title: 'Subprocessors',
      body:
        'CadetFlow relies on infrastructure providers including Supabase (database, authentication, storage), Vercel (application hosting), and Resend (email delivery). Each processes data on our behalf under contractual terms.',
    },
    {
      title: 'Your choices',
      body:
        'Parents may update contact preferences where enabled. Requests to inspect or correct records should be directed to the school in accordance with applicable student privacy laws.',
    },
    {
      title: 'Contact',
      body:
        'For privacy questions, contact your school administration or the CadetFlow operator designated by your school. This draft requires attorney review before production use.',
    },
  ],
}
