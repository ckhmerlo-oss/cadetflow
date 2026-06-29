import { topic, type DocCategory } from '../topicHelper'

export const notificationsCategory: DocCategory = {
  id: 'notifications',
  title: 'Notifications & preferences',
  topics: [
    topic(
      'in-app-notifications',
      'In-app notifications',
      'The bell icon feed that keeps you updated inside CadetFlow.',
      {
        basics: [
          'The notification bell in the header shows a count of unread updates and a scrollable list when opened.',
          'You are alerted when reports change status, work orders move forward, oversight assignments shift, and similar activity.',
          'Why it matters: you do not have to refresh every page—important actions surface where you already work.',
        ],
        howToUse: [
          'Click the bell icon in the header to open your feed.',
          'Read each item and click through to the related report, profile, or work order when you need detail.',
          'Items mark as read when you open them (or when you visit the linked page, depending on the event).',
          'Before relying on alerts: visit Preferences once to turn categories on or off for in-app delivery.',
        ],
        whatHappensNext: [
          'Opening a notification takes you to the relevant screen—pending report, work order detail, profile, etc.',
          'The unread count drops as items are read.',
          'If you disable a category in Preferences, new events in that category stop appearing in the bell (but the underlying activity still happens).',
        ],
        whoSeesThis: [
          'Notifications are private to your account—no one else sees your bell feed.',
          'The events themselves (reports, work orders) follow normal visibility rules for your role.',
          'Parents receive parent-portal notifications separately from staff/cadet feeds.',
        ],
        tips: [
          'Check the bell at the start of each duty day so kickbacks and assignments do not pile up.',
          'If the count looks stuck, refresh the page—rare timing issues clear on reload.',
          'Turn off noisy categories in Preferences rather than ignoring the bell entirely.',
        ],
        tracking: [
          'Bell icon: active/unread feed.',
          'Preferences: control which event types appear in-app going forward.',
        ],
      },
      { relatedRoutes: ['/preferences'] },
    ),
    topic(
      'email-notifications',
      'Email notifications',
      'Optional emails and digests that mirror important CadetFlow activity.',
      {
        basics: [
          'CadetFlow can email you when reports are approved, work orders update, appeals resolve, and more.',
          'You can receive immediate emails or a scheduled digest that bundles multiple updates.',
          'Why it matters: email catches you when you are not logged in—useful for coaches, TACs, and admins on the go.',
        ],
        howToUse: [
          'Open Preferences from the user menu.',
          'Toggle email on or off globally, then fine-tune each event category.',
          'Set digest frequency and time if you prefer a daily summary instead of many individual emails.',
          'Oversight staff: optional per-cadet overrides let you tune alerts for specific cadets you supervise.',
          'Before saving: confirm your profile email is correct—CadetFlow sends to the address on your account.',
        ],
        whatHappensNext: [
          'Immediate toggles apply to new events; digests arrive on the schedule you chose.',
          'Each email links back to CadetFlow for full detail.',
          'If email is off for a category, in-app notifications may still fire unless you disabled those too.',
        ],
        whoSeesThis: [
          'Emails go only to your registered address—never to other users’ inboxes.',
          'Coaches may enable team alert emails for their sport; parents receive parent-portal emails separately.',
          'School-wide notification behavior is configured by admins; users control personal opt-in/out within those bounds.',
        ],
        tips: [
          'Start with digest mode if you get too many individual emails during busy weeks.',
          'Coaches: enable team alerts during season, disable in off-season to reduce noise.',
          'Check spam folders the first week after go-live—whitelist your school’s CadetFlow sender.',
        ],
        tracking: [
          'Preferences shows your current email and digest settings.',
          'The underlying activity is always visible in CadetFlow even if email was off—use Reports, Work Orders, or the bell to catch up.',
        ],
      },
      { relatedRoutes: ['/preferences', '/profile'] },
    ),
  ],
}

export const oversightCategory: DocCategory = {
  id: 'oversight',
  title: 'Cadet oversight',
  topics: [
    topic(
      'big3-assignments',
      'My Cadets (oversight assignments)',
      'See which cadets you supervise as teacher, coach, or TAC.',
      {
        basics: [
          'Oversight links connect staff to cadets they are responsible for—academic teacher, sports coach, and company TAC.',
          'Most links are assigned automatically from class rosters, sports seasons, and company placement.',
          'Why it matters: your My Cadets list drives who appears in your oversight views, notifications, and conduct follow-up.',
        ],
        howToUse: [
          'Open Oversight (or My Cadets) from the navigation when you are level 50+ staff.',
          'Browse cadets assigned to you; click a name to open their profile and conduct history.',
          'TACs and admins can add or remove manual faculty links when automatic assignment is not enough.',
          'Before changing links: confirm with the other staff member to avoid duplicate or conflicting oversight.',
        ],
        whatHappensNext: [
          'When assignments change, affected staff may receive a notification.',
          'The cadet’s profile shows linked oversight staff where policy allows.',
          'Report and incident notifications route to oversight staff based on these links and preferences.',
        ],
        whoSeesThis: [
          'Each staff member sees only their own assigned cadets—not another teacher’s full list.',
          'Cadets see some oversight names on their profile; they do not manage assignments.',
          'TACs see company cadets in barracks and roster tools in addition to oversight links.',
          'Admins can view broader roster data for management tasks.',
        ],
        tips: [
          'If a cadet is missing from My Cadets, check class enrollment, sports roster, or company assignment first.',
          'Manual links are for exceptions—prefer fixing roster data at the source when possible.',
          'At semester turnover, refresh class and sports data before expecting automatic updates.',
        ],
        tracking: [
          'Oversight page: current assignments.',
          'Cadet profile: conduct history, open reports, and linked staff for each cadet you select.',
        ],
      },
      { relatedRoutes: ['/oversight', '/profile'] },
    ),
  ],
}
