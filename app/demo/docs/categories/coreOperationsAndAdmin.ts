import { topic, type DocCategory } from '../topicHelper'

export const coreOperationsCategory: DocCategory = {
  id: 'core-operations',
  title: 'Core operations',
  topics: [
    topic(
      'green-sheet',
      'Green Sheet (daily reports)',
      'Faculty daily snapshot of demerit activity.',
      {
        basics: [
          'The Green Sheet is a daily roll-up of demerit reports for faculty review—think of it as the day’s conduct newspaper.',
          'It helps instructors and TACs spot patterns quickly each morning or evening.',
          'Why it matters: you catch trends (same cadet, same infraction) before they become bigger issues.',
        ],
        howToUse: [
          'Open Reports → Daily Green Sheet from the navigation (faculty access).',
          'Select the date if your school allows browsing prior days.',
          'Scan new and pending items; click through to approve, kick back, or open full report detail.',
          'Before your duty shift: check yesterday’s sheet if you were off—pending items may still need action.',
        ],
        whatHappensNext: [
          'Actions you take from a report link update the same pending queues as elsewhere—Green Sheet is a view, not a separate system.',
          'Approved items drop off pending lists and appear on cadet ledgers.',
        ],
        whoSeesThis: [
          'Faculty and TAC staff (typically level 50+) view the Green Sheet.',
          'Cadets do not see the faculty Green Sheet—they use their personal ledger instead.',
          'Admins may use it for oversight alongside other reports.',
        ],
        tips: [
          'Use Green Sheet for daily rhythm; use Pending queue when you need filters and bulk triage.',
          'Watch for duplicate filings on the same cadet same day.',
          'Print or export only if your school policy allows—conduct data is sensitive.',
        ],
        tracking: [
          'Reports → Daily: current and past Green Sheets by date.',
          'Reports → Pending: still-open items from any day.',
          'Cadet ledger: cadet-facing view of approved demerits.',
        ],
      },
      { relatedRoutes: ['/reports/daily', '/reports/pending'] },
    ),
    topic(
      'report-lifecycle',
      'Approving and managing reports',
      'How staff move reports from submitted to finalized.',
      {
        basics: [
          'Every demerit and many other reports pass through staff review—approve, reject, kick back, or pull into your queue.',
          'Kickback sends work back to the submitter for fixes without rejecting outright.',
          'Why it matters: consistent review keeps records fair and gives cadets a chance to correct mistakes before final approval.',
        ],
        howToUse: [
          'Open Reports → Pending or click a report from Green Sheet, notifications, or a cadet profile.',
          'Read the full detail—description, category, subject, submitter.',
          'Choose Approve, Reject, Kickback (with note), or Pull if you are taking ownership from another queue.',
          'Before approving: confirm category, cadet, and facts—approved reports are hard to unwind.',
        ],
        whatHappensNext: [
          'Approve: report finalizes on the cadet ledger; notifications go out.',
          'Reject: report closes without ledger impact; submitter is notified.',
          'Kickback: report returns to submitter editable; resubmit sends it back to pending.',
          'Pull: report moves to your queue for action.',
        ],
        whoSeesThis: [
          'Approvers and designated oversight staff perform these actions.',
          'Submitters see status on Reports → Submitted.',
          'Cadets see finalized outcomes on ledger; they do not approve others’ reports.',
        ],
        tips: [
          'Always leave a kickback note—empty kickbacks frustrate submitters.',
          'Pull instead of duplicate-filing when someone else’s pending report needs your attention.',
          'Reject sparingly—kickback fixes most honest mistakes.',
        ],
        tracking: [
          'Reports → Pending: your actionable queue.',
          'Reports → Submitted: items you filed.',
          'Reports → History: finalized archive.',
          'Report detail page (/report/[id]): full audit trail for one item.',
        ],
      },
      { relatedRoutes: ['/reports/pending', '/reports/submitted', '/reports/history', '/report'] },
    ),
    topic(
      'ledger-profile',
      'Ledger & cadet profiles',
      'Personal conduct record and the hub for everything about a cadet.',
      {
        basics: [
          'The ledger is the cadet’s running conduct record—demerits, tours, and summaries for a period.',
          'Profiles add context: company, room, oversight staff, parent links, and history switchers.',
          'Why it matters: one place to prepare for a cadet conference instead of chasing five screens.',
        ],
        howToUse: [
          'Cadets: open Ledger from the nav to see your own record.',
          'Staff: search or browse to a cadet profile from Oversight, Manage, or report links.',
          'Switch academic period when reviewing past terms.',
          'Use profile actions (reports, invites, archive) only if your role shows those buttons.',
          'Before a meeting: pull the ledger for the relevant period and note open pending items separately.',
        ],
        whatHappensNext: [
          'Approved reports appear on the ledger; pending items may show as in-progress elsewhere.',
          'Profile actions (invite parent, file report) open the appropriate workflow prefilled for that cadet.',
        ],
        whoSeesThis: [
          'Cadets see their own ledger and limited profile fields.',
          'Oversight staff see profiles for assigned cadets.',
          'TACs see company cadets including barracks and parent sections.',
          'Cadets cannot open arbitrary peers’ full profiles unless school policy allows limited search.',
        ],
        tips: [
          'Ledger totals may lag pending approvals—always check Pending queue before arguing “zero demerits.”',
          'Profile period switcher does not change which year you are filing new reports into—watch labels.',
          'Parent section on profile is TAC-facing; parents use their own portal.',
        ],
        tracking: [
          'Ledger: personal conduct timeline.',
          'Profile: holistic cadet view with links to history, parent invites, and filings.',
          'Profile → History: multi-year summary when enabled.',
        ],
      },
      { relatedRoutes: ['/ledger', '/profile', '/profile/history'] },
    ),
    topic(
      'classes-sports-band',
      'Classes, sports & band',
      'Rosters that connect cadets to teachers and coaches.',
      {
        basics: [
          'Classes, sports, and band modules maintain who teaches, coaches, or directs whom.',
          'Those rosters feed automatic oversight assignments (Big-3).',
          'Why it matters: correct rosters mean the right adults get notified about the right cadets.',
        ],
        howToUse: [
          'Faculty: open Classes or Sports from the nav to view term or season rosters.',
          'Admins and assigned staff update enrollments and coach assignments at term start.',
          'Band members see band roster where enabled.',
          'Before term rollover: export or verify rosters so oversight links regenerate correctly.',
        ],
        whatHappensNext: [
          'Saving roster changes updates oversight links on the next sync cycle.',
          'Coaches may receive team notification emails if enabled in Preferences.',
        ],
        whoSeesThis: [
          'Classes management: typically faculty level 50–64 and admins.',
          'Sports: coaches and faculty see their teams; cadets see limited views.',
          'Band: band members and designated staff.',
          'Cadets do not edit class or sports rosters.',
        ],
        tips: [
          'Fix roster at source—do not rely only on manual oversight links for whole classes.',
          'Align sports season dates with real practice start/end.',
          'After adding a new course mid-term, verify affected cadets appear in teacher My Cadets.',
        ],
        tracking: [
          'Classes and Sports pages: current rosters.',
          'Oversight: resulting teacher/coach assignments.',
          'Admin tools: term and season configuration.',
        ],
      },
      { relatedRoutes: ['/classes', '/sports', '/band', '/oversight'] },
    ),
    topic(
      'tours-action-items',
      'Tours & action items',
      'Tour scheduling and your personal to-do list in CadetFlow.',
      {
        basics: [
          'Tours track cadet tour obligations—scheduled, completed, and starred tours per school rules.',
          'Action items and dashboard widgets surface tasks needing your attention today.',
          'Why it matters: cadets know their tour balance; staff spot overdue obligations quickly.',
        ],
        howToUse: [
          'Cadets: open Tours from the nav to view schedule and completion status.',
          'Everyone: check the dashboard and Action Items page for open tasks assigned to you.',
          'Staff: manage tour entries per school process from Tours and related profile views.',
          'Before weekend: cadets verify upcoming tour assignments on the Tours page.',
        ],
        whatHappensNext: [
          'Completing or approving tour records updates counts on profile and ledger widgets.',
          'Action items clear when underlying reports or tasks are resolved.',
        ],
        whoSeesThis: [
          'Cadets see their own tours and personal action items.',
          'Staff see action items for their role and oversight cadets’ tour status where permitted.',
          'Tour details follow same privacy as conduct—peers do not browse each other’s tour pages casually.',
        ],
        tips: [
          'Treat dashboard action items as a daily inbox—clear or snooze by actually resolving the source report.',
          'Starred tours (where used) highlight priority assignments—do not ignore them near end of term.',
        ],
        tracking: [
          'Tours page: schedule and history.',
          'Dashboard and Action Items: open tasks.',
          'Profile/ledger widgets: summary counts for cadets.',
        ],
      },
      { relatedRoutes: ['/', '/action-items', '/tours', '/ledger'] },
    ),
  ],
}

export const adminCategory: DocCategory = {
  id: 'admin',
  title: 'Admin & configuration',
  topics: [
    topic(
      'admin-settings',
      'Admin console',
      'School-wide settings for roles, companies, and policies.',
      {
        basics: [
          'The Admin area is the control room for site administrators—terms, roles, companies, notifications, and conduct catalog.',
          'Changes here affect everyone; use it for configuration, not daily cadet discipline.',
          'Why it matters: one misconfigured term date or role level can block hundreds of users from submitting reports.',
        ],
        howToUse: [
          'Site admin: open Admin from the navigation.',
          'Work tab by tab—General, Categories, Infractions, Roles, Companies, Options, Archived, etc.',
          'Read each screen’s labels before saving; many changes apply immediately.',
          'Before year start: set academic terms, verify role levels, and test submit as a cadet persona.',
        ],
        whatHappensNext: [
          'Saved settings apply on next page load or submit attempt.',
          'Role changes may require users to sign out and back in to see new menus.',
          'Category restriction changes instantly affect who can pick which demerit types.',
        ],
        whoSeesThis: [
          'Only site admins (highest access level) use the full admin console.',
          'TACs use Manage for roster tasks but not global school settings.',
          'Cadets and parents never see Admin.',
        ],
        tips: [
          'Document every admin change in your school’s IT runbook—CadetFlow may not store human-readable change logs for all fields.',
          'Make one change at a time when troubleshooting submission issues.',
          'Use demo personas to verify policy after changes before telling staff.',
        ],
        tracking: [
          'Admin tabs reflect current configuration—there is no separate “draft” mode.',
          'Pair admin checks with Reports → Pending smoke tests after policy updates.',
        ],
      },
      { relatedRoutes: ['/admin'] },
    ),
    topic(
      'app-options',
      'Dropdown options & infraction list',
      'Configure ranks, grades, and offense choices on forms.',
      {
        basics: [
          'Options and Infractions tabs control dropdown values—ranks, grades, conduct labels, demerit offense names.',
          'Submit forms and profiles pull from these lists so the whole school uses the same vocabulary.',
          'Why it matters: consistent labels make reports searchable and Green Sheets readable.',
        ],
        howToUse: [
          'Admin → Options: add or edit ranks, grades, and shared dropdown entries.',
          'Admin → Infractions: maintain the demerit offense catalog staff pick when filing.',
          'Avoid deleting entries in active use mid-year—prefer deprecating or hiding per school policy.',
          'Before adding offenses: align wording with student handbook language.',
        ],
        whatHappensNext: [
          'New options appear on forms after refresh.',
          'Renaming an offense does not rewrite old reports—they keep the label from submission time.',
        ],
        whoSeesThis: [
          'Site admins edit catalogs.',
          'All users see resulting dropdown choices on forms—cannot edit the catalog inline.',
        ],
        tips: [
          'Sort infractions logically (uniform, tardiness, respect) to speed filing.',
          'Do not create duplicate offenses with slightly different spelling.',
          'Coordinate with TACs before shrinking the infraction list.',
        ],
        tracking: [
          'Admin → Options / Infractions: live catalog.',
          'Submit forms: verify new entries appear in dropdowns after changes.',
        ],
      },
      { relatedRoutes: ['/admin', '/submit'] },
    ),
    topic(
      'roster-management',
      'Roster & role management',
      'Day-to-day cadet roster edits, role assignments, and probation.',
      {
        basics: [
          'Manage is where TACs and admins update who is in which company, assign roles, and track probation status.',
          'It is operational—not the same as Admin school-wide policy screens.',
          'Why it matters: wrong company placement breaks barracks routing, TAC queues, and oversight lists.',
        ],
        howToUse: [
          'Open Manage from the navigation.',
          'Search cadet, edit company, role, or status fields you have rights to change.',
          'Manage → Roles for bulk role tools; Manage → Probation for probation tracking.',
          'Before moving a cadet between companies: coordinate room assignment and TAC handoff.',
        ],
        whatHappensNext: [
          'Roster saves update hallway view, work order routing, and oversight links after sync.',
          'Role changes affect navigation on next login.',
          'Probation flags may appear on profiles for authorized staff.',
        ],
        whoSeesThis: [
          'TACs manage their company roster scope.',
          'Admins manage broader roster and role tools.',
          'Cadets see their own profile fields—not Manage screens.',
        ],
        tips: [
          'Update company before assigning barracks room.',
          'Use probation notes consistently for handoffs between TACs.',
          'Show archived toggle only when you intentionally need departed cadets.',
        ],
        tracking: [
          'Manage: active roster.',
          'Manage → Probation: probation list.',
          'Profile: result of each cadet’s assignments.',
        ],
      },
      { relatedRoutes: ['/manage', '/manage/roles', '/manage/probation'] },
    ),
  ],
}
