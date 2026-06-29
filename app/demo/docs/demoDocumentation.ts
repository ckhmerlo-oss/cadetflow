export type DocSetting = {
  label: string
  where: string
  effect: string
}

export type DocTopic = {
  id: string
  title: string
  summary: string
  body: string[]
  relatedRoutes?: string[]
  settings?: DocSetting[]
  roleNote?: string
  isNew?: boolean
  comingSoon?: boolean
}

export type DocCategory = {
  id: string
  title: string
  topics: DocTopic[]
}

export const DEMO_DOC_CATEGORIES: DocCategory[] = [
  {
    id: 'getting-started',
    title: 'Getting started',
    topics: [
      {
        id: 'demo-environment',
        title: 'Demo environment',
        summary: 'How the CadetFlow demo works and what to expect.',
        body: [
          'The demo site uses a separate Supabase project from production. All data resets nightly at midnight Eastern Time.',
          'On the login page, pick a persona card to sign in instantly—no password required. Each persona maps to a real seeded profile with a specific role level and company.',
          'Use the amber demo banner at the top of the page as a reminder that changes are not permanent.',
        ],
        relatedRoutes: ['/login'],
      },
      {
        id: 'role-levels',
        title: 'Role levels',
        summary: 'Numeric role levels gate navigation, submission, and admin access.',
        body: [
          'Each user has a role with a default level (0–100). Higher levels unlock more features. Cadets typically start around level 15; faculty around 50; TAC around 65; site admin at 90+.',
          'Navigation links, submit tabs, and admin screens check role level (and sometimes role name) before showing content.',
        ],
        settings: [
          {
            label: 'Role definitions',
            where: 'Admin → Roles',
            effect: 'Sets default_role_level and capability flags per role.',
          },
        ],
        relatedRoutes: ['/admin', '/manage/roles'],
      },
    ],
  },
  {
    id: 'reports-submissions',
    title: 'Reports & submissions',
    topics: [
      {
        id: 'submit-hub',
        title: 'Unified submit hub',
        summary: 'Single entry point for demerits, incidents, special reports, and damage requests.',
        body: [
          'The submit hub at /submit groups all filing workflows behind tabs. Available tabs depend on your role level and school-wide submission policy.',
          'Cadets and staff with level 15+ can access the hub; individual tabs may be further restricted by category or incident policy.',
        ],
        relatedRoutes: ['/submit'],
        roleNote: 'Role level 15+; tab visibility varies by policy.',
        settings: [
          {
            label: 'Category restrictions',
            where: 'Admin → Categories',
            effect: 'Controls which demerit categories each role band can submit.',
          },
          {
            label: 'Incident submission bands',
            where: 'Admin → Categories',
            effect: 'Controls who can file incident reports.',
          },
        ],
      },
      {
        id: 'demerit-reports',
        title: 'Demerit reports',
        summary: 'Submit, approve, reject, kickback, and pull demerit reports through the report lifecycle.',
        body: [
          'Demerits are filed from the submit hub or cadet profiles. Reports move through pending → approved/rejected states with kickback and pull actions for approvers.',
          'Approvers see queues on pending reports, daily Green Sheet, and individual report detail pages.',
        ],
        relatedRoutes: ['/submit?tab=demerit', '/reports/pending', '/reports/daily'],
        roleNote: 'Submit: level 15+ with category policy; approve: approver roles.',
      },
      {
        id: 'incident-reports',
        title: 'Incident reports',
        summary: 'File and track incident reports, optionally linked to events.',
        body: [
          'Incident reports document serious conduct events. Submission is gated by incident submission policy bands configured in admin.',
          'TAC and faculty can organize incidents under events from the incidents organizer view.',
        ],
        relatedRoutes: ['/submit?tab=incident', '/incidents'],
        roleNote: 'Incident tab: policy-gated; organizer: level 50+.',
        settings: [
          {
            label: 'Incident submission bands',
            where: 'Admin → Categories',
            effect: 'Defines which role levels can submit incident reports.',
          },
        ],
      },
      {
        id: 'category-restrictions',
        title: 'Category restrictions',
        summary: 'School-wide bands limiting which demerit categories each role can submit.',
        body: [
          'Category 1, 2, and 3 demerits can each be restricted to specific role level bands. Server-side enforcement blocks unauthorized submissions.',
          'The submit form filters available categories client-side; server validates on submit.',
        ],
        relatedRoutes: ['/admin'],
        roleNote: 'Configure: site admin (level 90+).',
        settings: [
          {
            label: 'Demerit category bands',
            where: 'Admin → Categories tab',
            effect: 'Min/max role level per category (Cat 1/2/3).',
          },
        ],
      },
    ],
  },
  {
    id: 'notifications',
    title: 'Notifications & preferences',
    topics: [
      {
        id: 'in-app-notifications',
        title: 'In-app notifications',
        summary: 'Bell icon feed for report lifecycle, oversight, work orders, and more.',
        body: [
          'The notification bell shows unread count and a scrollable feed. Events include report status changes, appeals, oversight assignment changes, work order updates, parent portal activity, and special report reviews.',
          'Notifications are stored per user and marked read when opened.',
        ],
        relatedRoutes: ['/preferences'],
        settings: [
          {
            label: 'In-app toggles',
            where: 'Preferences',
            effect: 'Enable or disable in-app notifications per event category.',
          },
        ],
      },
      {
        id: 'email-notifications',
        title: 'Email notifications',
        summary: 'Queued email delivery with templates and rate limiting.',
        body: [
          'Email notifications mirror many in-app events. Messages are queued and processed by a background worker with delivery logging and rate limits.',
          'Users can set digest frequency and time, plus per-category email toggles.',
        ],
        relatedRoutes: ['/preferences'],
        settings: [
          {
            label: 'Email toggles & digest',
            where: 'Preferences',
            effect: 'Global email on/off per category, digest schedule.',
          },
          {
            label: 'Per-cadet overrides',
            where: 'Preferences (oversight staff)',
            effect: 'Override notification settings for individual cadets you oversee.',
          },
          {
            label: 'Coached sports alerts',
            where: 'Preferences',
            effect: 'Team alert emails for coaches.',
          },
        ],
      },
    ],
  },
  {
    id: 'oversight',
    title: 'Cadet oversight',
    topics: [
      {
        id: 'big3-assignments',
        title: 'Big-3 oversight assignments',
        summary: 'Automatic teacher, coach, and TAC assignments plus manual faculty links.',
        body: [
          'The Big-3 system auto-assigns oversight staff from academic terms, sports seasons, and company TAC assignments. Manual faculty can be added or removed with audit tracking.',
          'Assignment changes emit notifications to affected staff.',
        ],
        relatedRoutes: ['/oversight', '/profile'],
        roleNote: 'My Cadets view: level 50+.',
        settings: [
          {
            label: 'Term & season data',
            where: 'Classes, Sports, Admin',
            effect: 'Drives automatic teacher and coach oversight links.',
          },
          {
            label: 'Company TAC',
            where: 'Profiles / Companies',
            effect: 'Determines TAC oversight per company.',
          },
        ],
      },
    ],
  },
  {
    id: 'archival',
    title: 'Archival & year close',
    topics: [
      {
        id: 'cadet-archive',
        title: 'Cadet archival',
        summary: 'Soft-archive cadets with departure classification while preserving history.',
        body: [
          'Archived cadets are hidden from active roster and hallway views by default. Historical records remain accessible per archive rules.',
          'Departure types include non-return, withdrawn, suspended, and dismissal.',
        ],
        relatedRoutes: ['/manage', '/admin'],
        roleNote: 'Archive actions: TAC/admin with manage rights.',
        settings: [
          {
            label: 'Show archived toggle',
            where: 'Manage roster',
            effect: 'Include archived cadets in roster list.',
          },
          {
            label: 'Archived tab',
            where: 'Admin → Archived',
            effect: 'View and manage archived cadet records.',
          },
        ],
      },
      {
        id: 'year-close',
        title: 'Close school year',
        summary: 'Multi-phase wizard to tag graduates and close the academic year.',
        body: [
          'The year-close wizard walks admins through term configuration, graduated tagging, closeout reminders, pre-flight checks, and execution.',
          'Closing a year auto-pulls demerits, auto-rejects appeals, auto-closes incidents, and preserves work orders across years.',
        ],
        relatedRoutes: ['/admin/year-close'],
        roleNote: 'Site admin (level 90+).',
        settings: [
          {
            label: 'Academic terms',
            where: 'Admin → General',
            effect: 'Term dates and school year boundaries for closeout.',
          },
        ],
      },
    ],
  },
  {
    id: 'history',
    title: 'History & periods',
    topics: [
      {
        id: 'period-queries',
        title: 'Multi-year history views',
        summary: 'Switch academic periods on profiles and ledgers; view school history reports.',
        body: [
          'Period selectors let staff and cadets view conduct data for prior terms and years. Cadet school history reports summarize conduct across enrolled years.',
          'Archive intervals affect which periods are visible for archived cadets.',
        ],
        relatedRoutes: ['/profile', '/ledger', '/profile/history'],
        settings: [
          {
            label: 'Academic terms',
            where: 'Admin → General',
            effect: 'Defines available periods for history queries.',
          },
        ],
      },
    ],
  },
  {
    id: 'work-orders',
    title: 'Work orders',
    topics: [
      {
        id: 'work-order-intake',
        title: 'Work order intake & triage',
        summary: 'Submit barracks or facility issues; TAC triages before maintenance.',
        isNew: true,
        body: [
          'Cadets submit barracks room issues (routed to their company TAC) or other locations (routed directly to maintenance). Status flows: submitted → tac_review → forwarded → assigned → completed (or cancelled).',
          'TACs review company-scoped submissions in the work orders queue. Maintenance staff use a dedicated portal view.',
        ],
        relatedRoutes: ['/work-orders', '/submit?tab=damage', '/maintenance'],
        roleNote: 'Submit: level 15+; triage: TAC (65+) or maintenance role.',
        settings: [
          {
            label: 'Company assignment',
            where: 'Profiles / roster',
            effect: 'Routes barracks submissions to the correct TAC queue.',
          },
          {
            label: 'Maintenance role',
            where: 'Admin → Roles',
            effect: 'Role name containing "maintenance" unlocks maintenance portal.',
          },
        ],
      },
    ],
  },
  {
    id: 'barracks',
    title: 'Barracks & inspections',
    topics: [
      {
        id: 'hallway-view',
        title: 'Hallway view',
        summary: 'Hotel-style room layout with occupancy and printable reference sheet.',
        isNew: true,
        body: [
          'TACs see barracks rooms organized by hallway with top/bottom bunk occupants. Archived cadets are excluded from active occupancy display.',
          'A print-friendly hallway sheet is available for offline reference.',
        ],
        relatedRoutes: ['/barracks/hallway', '/barracks/hallway/print'],
        roleNote: 'TAC+ (level 65+), not maintenance-only nav.',
      },
      {
        id: 'inspection-forms',
        title: 'Move-in / move-out inspections',
        summary: 'Bubble-coded inspection forms with automatic work order creation.',
        isNew: true,
        body: [
          'Move-in forms are completed by cadet or TAC; move-out forms by TAC. Each item uses status bubbles: INS, DAM, CLN, FIX, REP, MIS, OTH, N/A.',
          'Deficiency statuses (DAM, CLN, FIX, REP, MIS—not INS, N/A, or OTH) trigger work orders via idempotent RPC on save. Orders enter the TAC triage queue.',
          'Items are grouped by fixture section (Desk, Mattress, etc.) with Left/Right or Top/Bottom subsections.',
        ],
        relatedRoutes: ['/barracks/rooms', '/barracks/forms'],
        roleNote: 'TAC+ (level 65+).',
      },
      {
        id: 'move-in-invites',
        title: 'Move-in parent invites',
        summary: 'Send parent portal invites from room detail during move-in.',
        isNew: true,
        body: [
          'From a room detail page, TACs can send move-in invites that share the parent invite redemption flow with portal invites.',
          'Invites can be created, resent, revoked, and email-edited from the room UI.',
        ],
        relatedRoutes: ['/barracks/rooms', '/invite/move-in'],
        roleNote: 'TAC+ (level 65+).',
      },
    ],
  },
  {
    id: 'events-special',
    title: 'Events & special reports',
    topics: [
      {
        id: 'events-organizer',
        title: 'Events organizer',
        summary: 'Group incidents and special reports under organizational events.',
        isNew: true,
        body: [
          'Events are containers that group related incidents and special reports for TAC review. Events can carry forward at year close.',
          'The incidents page includes an events organizer for creating, linking, and previewing event filings.',
        ],
        relatedRoutes: ['/incidents', '/events'],
        roleNote: 'Level 50+.',
      },
      {
        id: 'special-reports',
        title: 'Special reports',
        summary: 'Cadet affidavits with staff review workflow.',
        isNew: true,
        body: [
          'Cadets submit special reports (affidavits) from the submit hub. Cadets can view their own submissions at /special-reports.',
          'Staff review and link filings to events. File attachments are UI-stubbed until file storage ships.',
        ],
        relatedRoutes: ['/submit?tab=special', '/special-reports'],
        roleNote: 'Submit: level 15+; review: staff.',
      },
    ],
  },
  {
    id: 'parent-portal',
    title: 'Parent portal',
    topics: [
      {
        id: 'parent-invites',
        title: 'Parent portal invites',
        summary: 'TAC-generated invite links for parent account onboarding.',
        isNew: true,
        body: [
          'TACs generate unique portal invite links from cadet profiles or barracks move-in flows. Invites can be resent, revoked, and email-edited.',
          'Parents redeem tokens at /invite/portal/[token], accept legal agreements, and are linked to their cadet.',
        ],
        relatedRoutes: ['/invite/portal', '/profile'],
        roleNote: 'Generate: TAC+; redeem: parent invitee.',
      },
      {
        id: 'parent-portal-views',
        title: 'Parent portal access',
        summary: 'Scoped read-only conduct, travel requests, and document uploads.',
        isNew: true,
        body: [
          'Parents see a dedicated shell at /parent with cadet conduct history, travel request forms, and document upload UI (upload persistence pending file storage).',
          'Archived cadets: parents retain read-only historical access; travel and uploads are disabled until reactivation.',
          'Parents are isolated from staff/cadet routes via ParentRouteGuard.',
        ],
        relatedRoutes: ['/parent', '/legal/terms-of-service', '/legal/privacy-policy', '/legal/parent-portal-agreement'],
        roleNote: 'Parent role only.',
        settings: [
          {
            label: 'Legal agreements',
            where: '/legal/* pages',
            effect: 'Terms, privacy, and parent portal agreement acceptance recorded on signup.',
          },
        ],
      },
    ],
  },
  {
    id: 'core-operations',
    title: 'Core operations',
    topics: [
      {
        id: 'green-sheet',
        title: 'Green Sheet (daily reports)',
        summary: 'Daily conduct summary for faculty review.',
        body: [
          'The Green Sheet at /reports/daily aggregates daily demerit activity for faculty oversight.',
        ],
        relatedRoutes: ['/reports/daily'],
        roleNote: 'Level 50+.',
      },
      {
        id: 'report-lifecycle',
        title: 'Report lifecycle',
        summary: 'Approve, reject, kickback, and pull reports from detail and queue views.',
        body: [
          'Individual report pages support the full lifecycle with RLS-enforced authorized paths. Pending and submitted queues help approvers triage work.',
        ],
        relatedRoutes: ['/reports/pending', '/reports/submitted', '/reports/history', '/report'],
        roleNote: 'Approvers and oversight staff.',
      },
      {
        id: 'ledger-profile',
        title: 'Ledger & profiles',
        summary: 'Personal conduct ledger and cadet profile hub.',
        body: [
          'Cadets view their ledger; staff view cadet profiles with conduct history, oversight links, parent section, and period switchers.',
        ],
        relatedRoutes: ['/ledger', '/profile'],
      },
      {
        id: 'classes-sports-band',
        title: 'Classes, sports & band',
        summary: 'Operational rosters for academics, athletics, and band.',
        body: [
          'Classes and sports modules manage term/season assignments that feed Big-3 oversight. Band roster is visible to band members and faculty.',
        ],
        relatedRoutes: ['/classes', '/sports', '/band'],
        roleNote: 'Classes: level 50–64; sports/band: logged-in users.',
      },
      {
        id: 'tours-action-items',
        title: 'Tours & action items',
        summary: 'Tour scheduling and personal action item tracking.',
        body: [
          'Tours module handles cadet tour workflows. The dashboard and action items page surface tasks requiring user attention.',
        ],
        relatedRoutes: ['/', '/action-items', '/tours'],
        roleNote: 'Level 15+ for dashboard.',
      },
    ],
  },
  {
    id: 'admin',
    title: 'Admin & configuration',
    topics: [
      {
        id: 'admin-settings',
        title: 'Admin console',
        summary: 'Central configuration for roles, companies, options, and policies.',
        body: [
          'Site admins access /admin for general settings, category restrictions, infractions, notification config, roles, companies, options, and archived cadets.',
        ],
        relatedRoutes: ['/admin'],
        roleNote: 'Site admin (level 90+).',
      },
      {
        id: 'app-options',
        title: 'App options & dropdowns',
        summary: 'Configurable ranks, grades, conduct labels, and form dropdowns.',
        body: [
          'The Options and Infractions tabs control dropdown values used across submit forms, profiles, and reports.',
        ],
        relatedRoutes: ['/admin'],
        settings: [
          {
            label: 'Options tab',
            where: 'Admin → Options',
            effect: 'Ranks, grades, conduct labels, and shared dropdowns.',
          },
          {
            label: 'Infractions tab',
            where: 'Admin → Infractions',
            effect: 'Demerit infraction catalog.',
          },
        ],
      },
      {
        id: 'roster-management',
        title: 'Roster management',
        summary: 'Manage cadet roster, roles, and probation.',
        body: [
          'TAC and admin staff use /manage for roster edits, role assignments at /manage/roles, and probation tracking at /manage/probation.',
        ],
        relatedRoutes: ['/manage', '/manage/roles', '/manage/probation'],
        roleNote: 'Manage rights or level 50+.',
      },
    ],
  },
  {
    id: 'coming-soon',
    title: 'Coming soon',
    topics: [
      {
        id: 'tac-summaries',
        title: 'TAC summaries & parent forwarding',
        summary: 'Monthly and term summary generation with parent delivery.',
        comingSoon: true,
        body: [
          'Planned: TACs will generate monthly/term conduct summaries, review them, and forward approved summaries to linked parents.',
          'Depends on period queries (Day 07), parent portal (Day 11), and email templates (Day 04).',
        ],
        settings: [
          {
            label: 'Email preferences',
            where: 'Preferences (future)',
            effect: 'Will control parent summary delivery notifications.',
          },
        ],
      },
      {
        id: 'onboarding-tour',
        title: 'Onboarding tour',
        summary: 'Re-enabled spotlight tour covering new features.',
        comingSoon: true,
        body: [
          'The onboarding tour is currently disabled (ONBOARDING_TOUR_ENABLED = false). Planned re-enable will walk new users through nav elements and recent feature additions.',
        ],
      },
      {
        id: 'file-storage',
        title: 'File storage foundation',
        summary: 'Avatars, attachments, inspection photos, and parent documents.',
        comingSoon: true,
        body: [
          'Planned Supabase Storage integration with a file_assets table. Will unlock profile avatars, work order photos, inspection form photos, special report attachments, and parent document uploads.',
          'Several UIs are already scaffolded with stubbed upload controls awaiting this epic.',
        ],
        settings: [
          {
            label: 'Inspection photo upload flag',
            where: 'Environment (planned)',
            effect: 'NEXT_PUBLIC_INSPECTION_PHOTO_UPLOAD will gate photo UI.',
          },
        ],
      },
      {
        id: 'profile-overhaul',
        title: 'Profile overhaul',
        summary: 'Avatars, conduct progress widget, and navigation polish.',
        comingSoon: true,
        body: [
          'Planned profile UX refresh including avatar display (depends on file storage), conduct progress visualization, and navigation improvements.',
        ],
      },
      {
        id: 'company-tac-config',
        title: 'Company TAC policy overrides',
        summary: 'Per-company overrides of school-wide submission policy.',
        comingSoon: true,
        body: [
          'Planned /company/settings page for TACs to override category restriction and incident submission bands within their company scope.',
          'Will layer on top of school-wide Admin → Categories settings from Day 05.',
        ],
        settings: [
          {
            label: 'Company policy settings',
            where: '/company/settings (planned)',
            effect: 'Company-scoped submission policy overrides.',
          },
        ],
      },
      {
        id: 'integration-signoff',
        title: 'Integration sign-off',
        summary: 'Cross-epic cleanup and deferred UAT items.',
        comingSoon: true,
        body: [
          'Planned integration pass covering year-close carry-forward sign-off, staff conduct-list roster report, parent portal post-year-close smoke tests, and inspection e2e validation.',
        ],
      },
      {
        id: 'testing-uat',
        title: 'Testing & UAT',
        summary: 'User acceptance testing and load validation.',
        comingSoon: true,
        body: [
          'Planned formal UAT cycle with scripted scenarios across all role personas, plus load testing before production rollout.',
        ],
      },
      {
        id: 'production-rollout',
        title: 'Production rollout & monitoring',
        summary: 'Go-live procedures and post-release monitoring.',
        comingSoon: true,
        body: [
          'Planned production deployment checklist, monitoring dashboards, and post-release verification for the full feature set.',
        ],
      },
    ],
  },
]

export const DEFAULT_DOC_TOPIC_ID = DEMO_DOC_CATEGORIES[0].topics[0].id

export function getDocTopicById(topicId: string): DocTopic | undefined {
  for (const category of DEMO_DOC_CATEGORIES) {
    const topic = category.topics.find((t) => t.id === topicId)
    if (topic) return topic
  }
  return undefined
}

export function getDocCategoryForTopic(topicId: string): DocCategory | undefined {
  return DEMO_DOC_CATEGORIES.find((c) => c.topics.some((t) => t.id === topicId))
}
