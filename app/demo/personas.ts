export type DemoPortal = 'main' | 'ledger' | 'workflow' | 'family'

export type DemoPersona = {
  profileId: string
  email: string
  displayName: string
  roleLabel: string
  company: string | null
  description: string
  portal: DemoPortal
}

export const DEMO_PERSONAS: DemoPersona[] = [
  {
    profileId: 'b0c0e9df-1061-4721-b589-75780bc64f9c',
    email: 'commandant@test.email',
    displayName: 'Col. Commandant',
    roleLabel: 'Commandant',
    company: 'Battalion Staff',
    description: 'Final approval authority and oversight dashboard.',
    portal: 'main',
  },
  {
    profileId: 'f0000000-0000-0000-0000-000000000001',
    email: 'tac@test.email',
    displayName: 'Alpha TAC',
    roleLabel: 'Alpha TAC Officer',
    company: 'Alpha Company',
    description: 'Review demerits, incidents, barracks, and company roster.',
    portal: 'main',
  },
  {
    profileId: '02c82cc1-f3a6-4327-8c97-acb1ffbaf392',
    email: 'platoon@test.email',
    displayName: 'Platoon Leader',
    roleLabel: 'Platoon Leader',
    company: 'Alpha Company',
    description: 'Approve squad reports and manage platoon roster.',
    portal: 'main',
  },
  {
    profileId: 'da77b296-ad3e-489f-94c1-955242db224d',
    email: 'squad@test.email',
    displayName: 'Squad Leader',
    roleLabel: 'Squad Leader',
    company: 'Alpha Company',
    description: 'Submit demerits and view squad ledger.',
    portal: 'ledger',
  },
  {
    profileId: '47bd1324-e8ea-4a4b-8d27-9c1592d71770',
    email: 'cadet1@test.email',
    displayName: 'Cadet One',
    roleLabel: 'Cadet',
    company: 'Alpha Company',
    description: 'View personal conduct history and notifications.',
    portal: 'main',
  },
  {
    profileId: 'f0000000-0000-0000-0000-000000000002',
    email: 'teacher1@test.email',
    displayName: 'Alice Teacher',
    roleLabel: 'Faculty Teacher',
    company: null,
    description: 'Daily reports, classes, and cadet oversight assignments.',
    portal: 'main',
  },
  {
    profileId: 'f0000000-0000-0000-0000-000000000008',
    email: 'maintenance@test.email',
    displayName: 'Mike Maintenance',
    roleLabel: 'Maintenance Staff',
    company: null,
    description: 'WorkFlow portal — triage and manage work orders.',
    portal: 'workflow',
  },
  {
    profileId: 'f0000000-0000-0000-0000-000000000009',
    email: 'parent1@test.email',
    displayName: 'Patricia Private1',
    roleLabel: 'Parent',
    company: null,
    description: 'Family portal — linked cadet conduct and travel requests.',
    portal: 'family',
  },
  {
    profileId: 'f0000000-0000-0000-0000-000000000007',
    email: 'admin@test.email',
    displayName: 'System Admin',
    roleLabel: 'Site Admin',
    company: 'Battalion Staff',
    description: 'Full admin access including settings and year close.',
    portal: 'main',
  },
]

const personaById = new Map(DEMO_PERSONAS.map((persona) => [persona.profileId, persona]))

export function getDemoPersona(profileId: string): DemoPersona | undefined {
  return personaById.get(profileId)
}

export function isAllowedDemoProfileId(profileId: string): boolean {
  return personaById.has(profileId)
}

export const DEMO_PORTAL_LABELS: Record<DemoPortal, string> = {
  main: 'CadetFlow',
  ledger: 'Ledger',
  workflow: 'WorkFlow',
  family: 'CadetFlow Family',
}
