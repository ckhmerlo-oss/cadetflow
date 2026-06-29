import { topic, type DocCategory } from '../topicHelper'

export const reportsSubmissionsCategory: DocCategory = {
  id: 'reports-submissions',
  title: 'Reports & submissions',
  topics: [
    topic(
      'submit-hub',
      'Submit hub',
      'One place to file demerits, incidents, special reports, and damage requests.',
      {
        basics: [
          'The Submit page is your starting point for anything you need to document about conduct or barracks damage.',
          'Tabs group similar workflows so you do not hunt through different menus for each type of report.',
          'Why it matters: filing from one hub keeps your submissions consistent and ensures the right people are notified.',
        ],
        howToUse: [
          'Go to Submit in the navigation (or the dashboard shortcut if shown).',
          'Choose the tab for what you need: Demerit, Incident, Special Report, or Damage / Work Order.',
          'Fill in the form completely—subject, date, description, and category are usually required.',
          'Before submitting: confirm you selected the correct cadet (if filing on someone else) and the correct category.',
          'Review the summary, then submit.',
        ],
        whatHappensNext: [
          'You see a confirmation and are usually returned to the submit page or your dashboard.',
          'The report enters the approval or review queue for your chain of command.',
          'Approvers and oversight staff receive in-app and/or email notifications depending on their preferences.',
        ],
        whoSeesThis: [
          'You always see reports you submitted under Reports → Submitted or on your profile.',
          'Approvers in your chain see pending items in their approval queues and on the Green Sheet.',
          'Not every tab is visible to every user—school rules control who may file demerits vs. incidents.',
          'Cadets typically file on themselves or as directed; staff file on cadets they supervise.',
        ],
        tips: [
          'If a tab is missing, your role may not be allowed to use that report type—ask a TAC or admin rather than guessing.',
          'Write clear, factual descriptions. Vague reports slow approvals and kickbacks.',
          'Check category restrictions before you start—some demerit categories are limited to certain staff levels.',
        ],
        tracking: [
          'Open Reports → Submitted to see everything you filed and its current status.',
          'Click any report to open its detail page for status, comments, and approval history.',
        ],
      },
      { relatedRoutes: ['/submit'] },
    ),
    topic(
      'demerit-reports',
      'Demerit reports',
      'Document minor conduct issues and move them through approval.',
      {
        basics: [
          'A demerit report records a conduct issue—uniform, tardiness, disrespect, and similar infractions.',
          'Reports follow a clear path: submitted → pending approval → approved or rejected (or sent back for edits).',
          'Why it matters: approved demerits appear on the cadet’s conduct record and can affect tours, privileges, and oversight conversations.',
        ],
        howToUse: [
          'From Submit, open the Demerit tab (or start from a cadet profile if you are filing on someone else).',
          'Select the cadet, offense category, date/time, and write a factual description.',
          'Attach context if the school uses additional fields (location, witnesses, etc.).',
          'Before submitting: verify category level (Cat 1, 2, or 3)—some categories are restricted by role.',
          'Submit and note the confirmation.',
        ],
        whatHappensNext: [
          'The report appears in the approver’s pending queue and on the daily Green Sheet.',
          'An approver can approve, reject, kick back for edits, or pull the report into their queue.',
          'The cadet and oversight staff may receive notifications when status changes.',
          'Once approved, the demerit counts toward the cadet’s conduct record and ledger.',
        ],
        whoSeesThis: [
          'The submitting user and approvers in the chain of command see the full report.',
          'The cadet named on the report can see it on their ledger and profile.',
          'Oversight staff (teacher, coach, TAC) linked to the cadet may see related activity in their oversight views.',
          'Other cadets cannot browse each other’s open reports.',
        ],
        tips: [
          'Approvers: add a short note when kicking back so the submitter knows exactly what to fix.',
          'Submitters: respond quickly to kickbacks—reports stay pending until corrected and resubmitted.',
          'Use the correct category; changing category after approval may require admin help.',
        ],
        tracking: [
          'Submitters: Reports → Submitted.',
          'Approvers: Reports → Pending and the daily Green Sheet.',
          'Cadets: Ledger and Profile → conduct history.',
          'Finalized reports: Reports → History and the cadet ledger for the relevant period.',
        ],
      },
      { relatedRoutes: ['/submit?tab=demerit', '/reports/pending', '/reports/daily', '/reports/submitted', '/ledger'] },
    ),
    topic(
      'incident-reports',
      'Incident reports',
      'Document serious conduct events that need formal review.',
      {
        basics: [
          'Incident reports cover more serious situations than routine demerits—major misconduct, safety issues, or events requiring TAC review.',
          'They can stand alone or be grouped under an Event for organized review.',
          'Why it matters: incidents create a formal record that leadership uses for decisions, parent communication, and year-end documentation.',
        ],
        howToUse: [
          'Go to Submit → Incident (if your role is allowed to file incidents).',
          'Enter the involved cadet(s), date, location, and a thorough factual narrative.',
          'Select offense types and any flags your school uses (for example, needs review).',
          'Before submitting: gather witness names, times, and any supporting details—you cannot easily change facts later.',
          'Submit the report.',
        ],
        whatHappensNext: [
          'The incident enters staff review queues and may appear on the Incidents organizer.',
          'TAC and faculty can link the incident to an Event, add notes, and change review status.',
          'Notifications go to oversight staff and approvers based on school notification settings.',
        ],
        whoSeesThis: [
          'Only staff with incident access see open incidents—not general cadets browsing the site.',
          'Named cadets see incident outcomes that affect their record on their profile and ledger.',
          'TAC officers and designated faculty manage the incidents list and events organizer.',
          'Parents do not see raw incident drafts; summarized conduct may appear later through official channels.',
        ],
        tips: [
          'Write objectively—stick to observable facts, not opinions or labels.',
          'If two staff file related incidents, link them under one Event to avoid duplicate review.',
          'If the Incident tab is missing, your school may restrict incident filing to TAC+ roles only.',
        ],
        tracking: [
          'Staff: Incidents page and Events organizer for linked filings.',
          'Submitters: Reports → Submitted for status of your filing.',
          'Historical incidents: Reports → History and cadet profile period views after closure or year processing.',
        ],
      },
      { relatedRoutes: ['/submit?tab=incident', '/incidents', '/events'] },
    ),
    topic(
      'category-restrictions',
      'Who can file which demerit types',
      'School rules that limit certain demerit categories to specific staff levels.',
      {
        basics: [
          'Demerits are grouped into categories (often Cat 1, 2, and 3) with different severity levels.',
          'Your school can restrict who may file each category—for example, only TACs file Cat 3.',
          'Why it matters: these rules protect cadets from improper filings and ensure serious demerits come from authorized staff.',
        ],
        howToUse: [
          'As a submitter: open Submit → Demerit and look at which categories appear in the dropdown—that list is already filtered for you.',
          'If the category you need is missing, stop and ask a higher-level staff member to file or request a policy change.',
          'As an admin: open Admin → Categories to view or adjust which role levels may use each category band.',
          'Before changing rules: confirm with school leadership—restrictions affect daily operations.',
        ],
        whatHappensNext: [
          'When you submit, the system checks your access. Unauthorized categories are blocked even if someone bypasses the form.',
          'After admin changes, users may need to refresh to see updated category lists.',
        ],
        whoSeesThis: [
          'All users see only the categories they are allowed to use—others are hidden, not grayed out with secrets.',
          'Site admins configure restrictions; TACs and instructors work within them.',
          'Cadets see limited or no demerit filing categories depending on school policy.',
        ],
        tips: [
          '“Category missing from dropdown” is almost always a policy limit, not a bug.',
          'Admins: document why each band is set before changing mid-semester.',
          'Train new staff on which categories their role may file before their first shift.',
        ],
        tracking: [
          'Submitters: if blocked, note the error message and escalate to Admin → Categories with your role name.',
          'Admins: Admin → Categories tab shows current bands; change history is an admin responsibility to document offline.',
        ],
      },
      { relatedRoutes: ['/submit?tab=demerit', '/admin'] },
    ),
  ],
}
