import { topic, type DocCategory } from '../topicHelper'

export const eventsSpecialCategory: DocCategory = {
  id: 'events-special',
  title: 'Events & special reports',
  topics: [
    topic(
      'events-organizer',
      'Events organizer',
      'Group related incidents and special reports under one named event.',
      {
        basics: [
          'An Event is a folder for related conduct filings—field day issues, weekend incidents, or multi-cadet situations.',
          'Staff review everything linked to an event in one place instead of scattered reports.',
          'Why it matters: leadership gets a complete picture and cadets are not lost in duplicate paperwork.',
        ],
        howToUse: [
          'Open Incidents or Events from the navigation.',
          'Create a new event with a clear title and date range.',
          'Link existing incidents or special reports, or create new filings from within the organizer.',
          'Use preview panels to read filings before resolving.',
          'Before closing an event: confirm all linked reports have final status.',
        ],
        whatHappensNext: [
          'Linked filings appear in the event’s resolved or active lists.',
          'Demerit resolution panels may appear for event-related conduct where configured.',
          'Events can carry forward at year close so multi-week investigations are not lost.',
        ],
        whoSeesThis: [
          'TAC and faculty (typically level 50+) use the events organizer.',
          'Cadets do not create or browse staff events—they see outcomes on their own record.',
          'Linked special reports remain visible to the submitting cadet on their submissions page.',
        ],
        tips: [
          'Name events so others know the situation six months later—“Smith Hall 3 Nov” beats “Event 12.”',
          'Link rather than re-file when two reports describe the same incident.',
          'Archive resolved events after leadership sign-off to keep the open list manageable.',
        ],
        tracking: [
          'Events page: open and resolved events.',
          'Incidents organizer: cross-link view from the incidents workflow.',
          'Individual report pages show event linkage when attached.',
        ],
      },
      {
        relatedRoutes: ['/incidents', '/events'],
        isNew: true,
      },
    ),
    topic(
      'special-reports',
      'Special reports (cadet affidavits)',
      'Let cadets submit their written account for staff review.',
      {
        basics: [
          'Special reports are formal written statements from cadets—often their side of a situation under review.',
          'They follow a staff review path and can be linked to events like incidents.',
          'Why it matters: cadets get a structured way to be heard instead of informal messages that are not recorded.',
        ],
        howToUse: [
          'Cadet: Submit → Special Report tab. Write clearly, stick to facts, include dates and names.',
          'Submit the form and keep a copy of what you wrote mentally—you cannot always edit after submit.',
          'Staff: review open special reports from the events/incidents workflow or dedicated lists.',
          'Before submitting: gather timeline details; emotional drafts are fine to write elsewhere first, then paste a clean version.',
        ],
        whatHappensNext: [
          'Cadet sees confirmation and the report on Special Reports (my submissions).',
          'Staff may flag for review, mark reviewed, or link to an event.',
          'Notifications may alert oversight staff of new submissions.',
          'File attachments will be supported in a future update—descriptions carry the record for now.',
        ],
        whoSeesThis: [
          'Submitting cadet always sees their own special reports.',
          'Review staff and linked oversight see submissions in review queues—not the whole student body.',
          'Parents do not see draft special reports in the parent portal unless school policy shares outcomes separately.',
        ],
        tips: [
          'Cadets: be honest and specific; vague affidavits are hard for staff to act on.',
          'Staff: link to an event early so multiple cadet statements stay together.',
          'Do not use special reports for emergency safety issues—follow school emergency procedures first.',
        ],
        tracking: [
          'Cadets: Special Reports page for my submissions and status.',
          'Staff: Events organizer and incident review tools.',
          'Finalized items appear in conduct history where policy includes them.',
        ],
      },
      {
        relatedRoutes: ['/submit?tab=special', '/special-reports', '/events'],
        isNew: true,
      },
    ),
  ],
}

export const parentPortalCategory: DocCategory = {
  id: 'parent-portal',
  title: 'Parent portal',
  topics: [
    topic(
      'parent-invites',
      'Parent portal invites',
      'How parents get their own CadetFlow login linked to their cadet.',
      {
        basics: [
          'Parents do not self-register—they need an invite link from a TAC tied to a specific cadet.',
          'The link is one-time use per invite and walks them through legal agreements.',
          'Why it matters: families get secure access to conduct and travel tools without sharing cadet passwords.',
        ],
        howToUse: [
          'TAC: open the cadet profile → Parent section (or send from barracks move-in).',
          'Generate a portal invite, enter parent email, and send.',
          'Resend if needed; revoke if the email was wrong.',
          'Parent: open the link from email, accept Terms, Privacy, and Parent Portal Agreement, then set password.',
          'Before sending: verify custody/contact policy at your school—only authorized contacts should receive invites.',
        ],
        whatHappensNext: [
          'Parent account links to the cadet automatically on successful redeem.',
          'Parent lands on the parent home page with conduct and travel options.',
          'TAC sees invite status change to redeemed on the profile.',
        ],
        whoSeesThis: [
          'TACs and authorized staff generate invites.',
          'Only the invited email can redeem—forwarding the link does not bypass that.',
          'Parents never see staff menus or other cadets’ data.',
        ],
        tips: [
          'Revoke old invites before sending to a corrected email.',
          'Parents must re-accept legal terms if policies update—watch for reaccept prompts.',
          'Move-in and portal invites use the same redemption flow—pick whichever entry point fits.',
        ],
        tracking: [
          'Cadet profile → Parent section: invite history and status.',
          'Parents: after login, home page lists linked cadets.',
        ],
      },
      {
        relatedRoutes: ['/invite/portal', '/profile', '/legal/parent-portal-agreement'],
        isNew: true,
      },
    ),
    topic(
      'parent-portal-views',
      'Using the parent portal',
      'What parents can view and do after they join.',
      {
        basics: [
          'The parent portal is a separate, simplified CadetFlow for families—conduct visibility and travel requests.',
          'It is read-only for most conduct data; parents do not approve demerits or edit cadet profiles.',
          'Why it matters: parents stay informed without calling the TAC office for every update.',
        ],
        howToUse: [
          'Sign in at the parent login (after redeeming an invite).',
          'Select your cadet from the home page.',
          'View conduct summary and history tabs allowed by school policy.',
          'Submit travel requests when your cadet plans leave campus (forms vary by school).',
          'Upload documents when the upload feature is enabled (coming soon for some schools).',
        ],
        whatHappensNext: [
          'Travel requests enter staff review; parents see status updates on the travel page.',
          'Conduct views reflect approved records—not in-progress staff drafts.',
          'If the cadet is archived, portal becomes read-only and travel/upload may disable until reactivation.',
        ],
        whoSeesThis: [
          'Each parent sees only cadets linked to their account.',
          'TAC and staff see travel requests on their review tools—not parents’ login screens.',
          'Cadets and staff use the main app; parents are isolated to /parent routes.',
        ],
        tips: [
          'Parents: use travel forms early—last-minute requests stress staff.',
          'Staff: respond to travel requests promptly; parents watch status in the portal.',
          'Keep parent email current on invites—password reset flows depend on it.',
        ],
        tracking: [
          'Parent home: cadet list and quick links.',
          'Parent → Cadet → Conduct: historical conduct view.',
          'Parent → Cadet → Travel: open and past travel requests.',
        ],
      },
      {
        relatedRoutes: ['/parent', '/legal/terms-of-service', '/legal/privacy-policy'],
        isNew: true,
      },
    ),
  ],
}
