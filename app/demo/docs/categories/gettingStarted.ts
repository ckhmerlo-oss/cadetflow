import { topic, type DocCategory } from '../topicHelper'

export const gettingStartedCategory: DocCategory = {
  id: 'getting-started',
  title: 'Getting started',
  topics: [
    topic(
      'demo-environment',
      'Demo environment',
      'A safe place to explore CadetFlow without affecting real school records.',
      {
        basics: [
          'CadetFlow Demo is a practice version of the app. Everything you do here is sample data, not your real school.',
          'The demo resets every night at midnight Eastern Time, so you can experiment freely and start fresh the next day.',
          'Why it matters: you can learn the workflows—submitting reports, reviewing conduct, managing barracks—without worrying about permanent mistakes.',
        ],
        howToUse: [
          'Open the login page and pick a persona card (Cadet, Instructor, TAC Officer, etc.). No password is required in the demo.',
          'Each persona signs you in as a different user with a realistic role, company, and permissions.',
          'Look for the amber banner at the top of the page—it reminds you that you are in the demo site.',
          'Before you start: decide which role you want to explore. Switch personas anytime by signing out and picking another card.',
        ],
        whatHappensNext: [
          'After you pick a persona, you land on the dashboard for that user.',
          'Navigation links, submit tabs, and admin screens match what that role can actually do in the real app.',
          'Any reports, work orders, or edits you make stay in the demo until the nightly reset.',
        ],
        whoSeesThis: [
          'The demo is public for evaluators and trainers—anyone with the demo link can sign in with a persona.',
          'Demo data is separate from production. Real cadets, parents, and staff at your school never see demo activity.',
          'Only people you share the demo link with can access this environment.',
        ],
        tips: [
          'Try the same task as both a cadet and a TAC officer to see both sides of a workflow.',
          'If something looks wrong after midnight Eastern, the nightly reset may still be running—wait a minute and refresh.',
          'Use the ? help button in the header anytime to jump back to this guide.',
        ],
        tracking: [
          'Your current persona is shown in the header user menu after sign-in.',
          'To switch roles, sign out from the user menu and choose a different persona on the login page.',
        ],
      },
      { relatedRoutes: ['/login'] },
    ),
    topic(
      'role-levels',
      'Understanding your access level',
      'Why some menu items appear for you and others do not.',
      {
        basics: [
          'Every user in CadetFlow has a role (Cadet, Instructor, TAC Officer, Admin, Parent, etc.) with an access level.',
          'Higher access unlocks more screens—approving reports, managing rosters, closing the school year, and more.',
          'Why it matters: knowing your level helps you understand what you can do today and who to ask when something is missing from your menu.',
        ],
        howToUse: [
          'Sign in and look at the navigation bar and user menu—those links reflect your current access.',
          'If you expected a feature but do not see it, you may need a higher role or a school admin may need to adjust your assignment.',
          'Before requesting access: note the exact screen or action you need (for example, “approve demerits” or “hallway view”).',
        ],
        whatHappensNext: [
          'When an admin updates your role or company assignment, sign out and back in (or refresh) to pick up new menu items.',
          'Submit forms and approval buttons appear or disappear based on your level—attempts outside your access simply will not be offered in the UI.',
        ],
        whoSeesThis: [
          'Cadets (lower access): submit reports, view their own ledger, file work orders, and use limited profile views.',
          'Instructors & coaches (mid access): oversight lists, classes, sports, Green Sheet, and report approval queues.',
          'TAC officers (higher access): company barracks, hallway view, inspections, work order triage, parent invites.',
          'Site admins (highest access): school-wide settings, roles, year close, and archived cadet management.',
          'Parents: a separate, read-only portal—they do not share staff or cadet navigation.',
        ],
        tips: [
          'In the demo, switch personas on the login page to experience different access levels instantly.',
          '“I can see the report but cannot approve it” usually means you are logged in as a cadet or instructor without approver rights.',
          'Company assignment matters for TACs—barracks and work order queues are scoped to your company.',
        ],
        tracking: [
          'Your role name appears in your profile and user menu.',
          'Admins manage roles at Admin → Roles; TACs manage roster assignments at Manage.',
        ],
      },
      { relatedRoutes: ['/admin', '/manage/roles', '/profile'] },
    ),
  ],
}
