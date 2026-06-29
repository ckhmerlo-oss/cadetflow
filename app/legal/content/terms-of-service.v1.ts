import type { LegalDocument } from './types'

export const termsOfServiceV1: LegalDocument = {
  docKey: 'terms_of_service',
  version: '2026-06-01',
  effectiveDate: '2026-06-01',
  title: 'Terms of Service',
  sections: [
    {
      title: 'Acceptance',
      body:
        'By creating an account or using CadetFlow, you agree to these Terms of Service and our Privacy Policy. If you do not agree, do not use the service.',
    },
    {
      title: 'Account types',
      body:
        'CadetFlow supports cadet, staff, parent/guardian, and administrative accounts. Each account type has scoped access. You may not share credentials or attempt to access data outside your authorized scope.',
    },
    {
      title: 'Acceptable use',
      body:
        'You agree to use CadetFlow only for legitimate school-related purposes. You may not submit false information, harass others, attempt unauthorized access, or misuse uploaded content.',
    },
    {
      title: 'Education records',
      body:
        'Disciplinary and conduct information displayed in CadetFlow may constitute education records under applicable law. Access is limited to authorized users. Parents/guardians may view information for linked cadets only.',
    },
    {
      title: 'Limitation of liability',
      body:
        'CadetFlow is provided for school operational use. To the extent permitted by law, the school and service operators disclaim warranties and limit liability for indirect damages. This draft requires attorney review before production use.',
    },
    {
      title: 'Changes',
      body:
        'We may update these terms. Material changes may require renewed acceptance before continued use of parent portal features.',
    },
  ],
}
