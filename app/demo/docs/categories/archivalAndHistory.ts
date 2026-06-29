import { topic, type DocCategory } from '../topicHelper'

export const archivalCategory: DocCategory = {
  id: 'archival',
  title: 'Archival & year close',
  topics: [
    topic(
      'cadet-archive',
      'Archiving cadets',
      'Mark cadets who leave mid-year while keeping their history available.',
      {
        basics: [
          'Archiving removes a cadet from active rosters and hallway views without deleting their conduct history.',
          'Departure reasons include non-return, withdrawal, suspension, and dismissal—each helps reporting later.',
          'Why it matters: active lists stay accurate for daily operations while past records remain available for transcripts and appeals.',
        ],
        howToUse: [
          'TAC or admin: open Manage or the cadet profile and choose the archive action when a cadet departs.',
          'Select the correct departure type and effective date.',
          'Confirm the cadet should no longer appear on active rosters or barracks occupancy.',
          'Before archiving: finish or transfer open work orders and pending reports tied to the cadet when possible.',
        ],
        whatHappensNext: [
          'The cadet disappears from default roster and hallway views.',
          'Historical demerits, incidents, and ledger entries remain viewable per school policy.',
          'Parent portal access may become read-only for archived cadets until reactivation.',
        ],
        whoSeesThis: [
          'TACs and admins perform archive actions for their scope.',
          'Staff with history access can view archived cadets when using “show archived” toggles or the Admin archived tab.',
          'Regular cadets do not browse archived peers.',
          'Parents retain limited historical view for their cadet per parent portal rules.',
        ],
        tips: [
          'Do not archive a cadet who is merely changing rooms—use roster edits instead.',
          'Use the archived tab in Admin to audit departures at end of term.',
          'Reactivate only when a cadet officially returns mid-year.',
        ],
        tracking: [
          'Manage roster: toggle show archived to find past cadets.',
          'Admin → Archived: centralized list for admins.',
          'Profile and ledger: switch academic period to view conduct from when the cadet was active.',
        ],
      },
      { relatedRoutes: ['/manage', '/admin', '/profile'] },
    ),
    topic(
      'year-close',
      'Close school year',
      'End-of-year wizard for graduates and year rollover.',
      {
        basics: [
          'Closing the school year finalizes conduct records, tags graduates, and prepares the system for the next academic cycle.',
          'The wizard walks admins through checks so nothing critical is left open by accident.',
          'Why it matters: a clean close protects historical accuracy and prevents last year’s open reports from lingering forever.',
        ],
        howToUse: [
          'Site admin: open Admin → Close School Year (year-close wizard).',
          'Follow each phase—review terms, tag graduates, run pre-flight checks, read reminders, then execute.',
          'Before starting: confirm academic term dates in Admin → General match your calendar.',
          'Coordinate with TACs so major open incidents and appeals are resolved or documented.',
        ],
        whatHappensNext: [
          'Open demerits may be auto-pulled, appeals auto-rejected, and incidents auto-closed per school configuration.',
          'Graduates are marked; returning cadets roll forward to the new year context.',
          'Some records (like work orders) may carry forward rather than disappear—review wizard summaries carefully.',
        ],
        whoSeesThis: [
          'Only site admins run year close—other roles see resulting read-only history afterward.',
          'Cadets and staff continue using the system during the year; close is an admin end-of-year action.',
          'Parents see updated historical views after close; they do not run the wizard.',
        ],
        tips: [
          'Never run year close on a live day mid-semester—reserve it for official end-of-year.',
          'Export or print key reports before close if your school requires offline archives.',
          'Run the wizard’s pre-flight step twice if anything fails—fix blockers before executing.',
        ],
        tracking: [
          'Year-close wizard shows phase completion and blockers.',
          'After close: use period selectors on profiles and ledgers to view prior years.',
          'Admin archived and history reports summarize graduate and departure data.',
        ],
      },
      { relatedRoutes: ['/admin/year-close', '/admin'] },
    ),
  ],
}

export const historyCategory: DocCategory = {
  id: 'history',
  title: 'History & periods',
  topics: [
    topic(
      'period-queries',
      'Viewing past terms and years',
      'Switch time periods to see conduct from earlier in a cadet’s career.',
      {
        basics: [
          'CadetFlow organizes conduct by academic terms and school years—not everything on screen is “this week only.”',
          'Period selectors on profiles and ledgers let you look back at prior terms when you have permission.',
          'Why it matters: conferences, appeals, and parent meetings often require last semester’s context, not just today’s dashboard.',
        ],
        howToUse: [
          'Open a cadet profile or ledger.',
          'Find the period or year dropdown (often near the top of conduct sections).',
          'Select the term or year you need—the page refreshes with data for that window.',
          'Before a meeting: note which year the cadet was in and pick matching period to avoid mixing records.',
        ],
        whatHappensNext: [
          'Demerits, tours, and summary widgets update to reflect the selected period.',
          'Some actions (submit new report) still apply to the current term even while you view an old period—watch labels carefully.',
          'School history reports aggregate multiple years for a single printable view where available.',
        ],
        whoSeesThis: [
          'Cadets see their own ledger across allowed periods.',
          'Oversight staff see periods for cadets assigned to them.',
          'TACs and admins see broader history; parents see parent-portal scoped history for their cadet.',
          'Archived cadets may limit which periods appear based on enrollment intervals.',
        ],
        tips: [
          'If a period is missing, the cadet may not have been enrolled that term—check archive status.',
          'Compare ledger totals to Green Sheet when investigating discrepancies for a specific week.',
          'Use profile history report for a printable multi-year summary when offered.',
        ],
        tracking: [
          'Profile and Ledger: period dropdown for drill-down.',
          'Profile → History (where available): school-wide conduct summary for a cadet.',
          'Reports → History: staff view of finalized reports across time.',
        ],
      },
      { relatedRoutes: ['/profile', '/ledger', '/profile/history', '/reports/history'] },
    ),
  ],
}
