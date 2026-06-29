import { topic, type DocCategory } from '../topicHelper'

export const comingSoonCategory: DocCategory = {
  id: 'coming-soon',
  title: 'Coming soon',
  topics: [
    topic(
      'tac-summaries',
      'TAC summaries for parents',
      'Monthly and term conduct summaries parents can receive.',
      {
        basics: [
          'Planned feature: TACs will compile period conduct summaries, review them, and send approved versions to linked parents.',
          'Why it will matter: replaces ad-hoc emails with a consistent, school-approved format families can rely on.',
        ],
        howToUse: [
          'Not available in the demo yet.',
          'When launched: TACs will generate a draft summary per cadet or company, edit narrative sections, and click send to parents.',
          'You will need the parent portal linked and email preferences enabled for families.',
        ],
        whatHappensNext: [
          'Parents will receive an email with a link or attached summary per school policy.',
          'Draft summaries will stay editable until explicitly approved and sent.',
        ],
        whoSeesThis: [
          'TACs will create and approve summaries.',
          'Parents will receive only their cadet’s approved summary.',
          'Cadets will not edit parent summaries.',
        ],
        tips: [
          'Until this ships, continue official parent communication through existing school channels.',
          'Keep parent emails current on portal invites so future summaries reach the right inbox.',
        ],
        tracking: [
          'Future: TAC summary queue and sent-history log (planned).',
          'Today: use profile conduct views and manual communication as needed.',
        ],
      },
      { comingSoon: true },
    ),
    topic(
      'onboarding-tour',
      'Interactive onboarding tour',
      'A guided walkthrough of navigation and new features.',
      {
        basics: [
          'A spotlight-style tour that highlights key menu items the first time you log in or after major updates.',
          'Why it will matter: new cadets and staff learn the layout without a separate PDF manual.',
        ],
        howToUse: [
          'Not enabled in the demo today.',
          'When enabled: you will see prompts to Start tour from the dashboard or a dismissible banner.',
          'Follow each step; you can skip and reopen later from help settings (planned).',
        ],
        whatHappensNext: [
          'Tour completion will be remembered on your account so repeats are optional.',
          'Updates after new features may offer a short delta tour only.',
        ],
        whoSeesThis: [
          'Each user gets their own tour progress.',
          'Role-specific steps may show only relevant navigation for cadets vs. staff.',
        ],
        tips: [
          'Use this demo guide (? button) until the interactive tour returns.',
          'Admins: plan a five-minute staff meeting when tour launches so everyone completes it once.',
        ],
        tracking: [
          'Future: tour progress on profile or preferences (planned).',
        ],
      },
      { comingSoon: true },
    ),
    topic(
      'file-storage',
      'Photos & file attachments',
      'Upload avatars, inspection photos, report attachments, and parent documents.',
      {
        basics: [
          'Planned file storage for profile photos, work order pictures, inspection images, special report attachments, and parent uploads.',
          'Why it will matter: a picture of damage beats a paragraph; avatars help staff recognize cadets in lists.',
        ],
        howToUse: [
          'Several upload buttons in the demo are placeholders—descriptions still carry the record today.',
          'When launched: you will pick a file, see upload progress, and attach before submit.',
          'Supported types and size limits will be shown on each form.',
        ],
        whatHappensNext: [
          'Files will link to the report, work order, or profile that uploaded them.',
          'Staff reviewers will open attachments inline from detail pages.',
        ],
        whoSeesThis: [
          'Visibility will match the parent record—same as the report or work order today.',
          'Parents will upload only to their portal document area when enabled.',
        ],
        tips: [
          'Until uploads live, write extra detail in text fields for damage and special reports.',
          'Avoid pasting sensitive images into external chat—wait for secure in-app storage.',
        ],
        tracking: [
          'Future: attachment list on each detail page (planned).',
        ],
      },
      { comingSoon: true },
    ),
    topic(
      'profile-overhaul',
      'Profile page refresh',
      'Clearer profiles with progress widgets and avatars.',
      {
        basics: [
          'Planned visual refresh of cadet profiles—avatar, conduct progress widget, and easier navigation between tabs.',
          'Why it will matter: faster scanning during conferences and hallway checks on phones.',
        ],
        howToUse: [
          'Not fully released—current profiles already include conduct, oversight, and parent sections.',
          'When launched: upload avatar (requires file storage), view progress ring or chart, and use sticky sub-navigation.',
        ],
        whatHappensNext: [
          'Existing data stays the same—only layout and widgets change.',
          'Avatars will appear in rosters and hallway view where enabled.',
        ],
        whoSeesThis: [
          'Same visibility as today’s profile—role rules unchanged.',
        ],
        tips: [
          'Use ledger and profile period switcher today for conference prep.',
        ],
        tracking: [
          'Profile and ledger remain the source of truth before and after the refresh.',
        ],
      },
      { comingSoon: true },
    ),
    topic(
      'company-tac-config',
      'Company-level policy overrides',
      'Let TACs tune submission rules within their company.',
      {
        basics: [
          'Planned page for company TACs to override school-wide demerit category and incident filing rules for their company only.',
          'Why it will matter: Alpha and Bravo companies can differ slightly while one admin keeps global defaults.',
        ],
        howToUse: [
          'Not available yet—today all changes happen in Admin → Categories school-wide.',
          'When launched: TAC opens Company settings, adjusts allowed bands within admin-defined limits, saves.',
        ],
        whatHappensNext: [
          'Company cadets immediately see updated submit options.',
          'Overrides will stack beneath school defaults—cannot bypass hard admin locks (planned behavior).',
        ],
        whoSeesThis: [
          'Company TACs edit their company.',
          'Site admins set maximum allowed ranges.',
          'Cadets see resulting submit tabs only.',
        ],
        tips: [
          'Document company overrides in TAC handbooks to avoid confusion during joint events.',
        ],
        tracking: [
          'Future: Company settings audit log (planned).',
          'Today: Admin → Categories for global view.',
        ],
      },
      { comingSoon: true },
    ),
    topic(
      'integration-signoff',
      'Full-system integration testing',
      'Cross-feature checks before go-live.',
      {
        basics: [
          'Planned formal pass linking year close, parent portal, barracks inspections, and reports end-to-end.',
          'Why it will matter: catches gaps that single-feature testing misses—like parent view after year close.',
        ],
        howToUse: [
          'For evaluators: use demo personas to walk critical paths listed in school UAT scripts (when published).',
          'Report issues via your school’s feedback channel—not the demo reset button.',
        ],
        whatHappensNext: [
          'Issues found become fix tickets before production rollout.',
        ],
        whoSeesThis: [
          'QA staff and school leadership—not daily cadet operation.',
        ],
        tips: [
          'Try year-close smoke test on demo after nightly reset with fresh personas.',
        ],
        tracking: [
          'School UAT checklist (external to app, planned distribution).',
        ],
      },
      { comingSoon: true },
    ),
    topic(
      'testing-uat',
      'User acceptance testing',
      'Structured testing with real school scenarios.',
      {
        basics: [
          'Formal UAT cycle where each role runs scripted scenarios—submit demerit, TAC triage work order, parent travel request, etc.',
          'Why it will matter: confidence that CadetFlow matches your handbook workflows before cadets use it live.',
        ],
        howToUse: [
          'When invited: follow scenario PDFs, record pass/fail, note screen and persona used.',
          'Use demo site for destructive tests; use production only for read-only checks until go-live.',
        ],
        whatHappensNext: [
          'Failed scenarios return to dev team; passed scenarios sign off that feature for launch.',
        ],
        whoSeesThis: [
          'Designated testers per role—cadet, TAC, parent, admin representatives.',
        ],
        tips: [
          'Test on mobile if cadets will use phones in barracks.',
          'Include one “busy day” scenario with ten notifications.',
        ],
        tracking: [
          'UAT spreadsheet or ticket system (school-managed, planned).',
        ],
      },
      { comingSoon: true },
    ),
    topic(
      'production-rollout',
      'Production go-live',
      'Launch procedures and post-release monitoring.',
      {
        basics: [
          'Checklist for switching staff and cadets from old processes to CadetFlow production—including training, support contacts, and first-week monitoring.',
          'Why it will matter: smooth launch reduces duplicate filing in old spreadsheets “just in case.”',
        ],
        howToUse: [
          'School leadership follows go-live runbook (communications, login help desk, freeze on handbook changes).',
          'Users bookmark production URL—not demo—for real records.',
        ],
        whatHappensNext: [
          'Support team watches error reports and pending queue depth first week.',
          'Demo remains available for training new classes later.',
        ],
        whoSeesThis: [
          'Entire school community on production; demo stays separate.',
        ],
        tips: [
          'Keep demo link for new TAC training only—never confuse demo data with real cadets.',
          'Plan office hours the first Friday after launch.',
        ],
        tracking: [
          'School help desk ticket volume and CadetFlow admin dashboards (planned monitoring).',
        ],
      },
      { comingSoon: true },
    ),
  ],
}
