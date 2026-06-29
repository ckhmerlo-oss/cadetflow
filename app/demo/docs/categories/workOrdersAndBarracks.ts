import { topic, type DocCategory } from '../topicHelper'

export const workOrdersCategory: DocCategory = {
  id: 'work-orders',
  title: 'Work orders',
  topics: [
    topic(
      'work-order-intake',
      'Work orders',
      'Report barracks or facility problems and track them through repair.',
      {
        basics: [
          'Work orders let cadets and staff report physical issues—broken furniture, room damage, facility maintenance needs.',
          'Barracks room issues go to your company TAC first; other locations may go straight to maintenance.',
          'Why it matters: you get a paper trail instead of hallway conversations that get forgotten, and maintenance knows what to fix.',
        ],
        howToUse: [
          'Cadets: Submit → Damage tab, or open Work Orders and create a new request. Describe the problem and location clearly.',
          'Include room number for barracks issues so the right TAC receives it.',
          'TACs: open Work Orders to review company submissions, add notes, forward to maintenance, or resolve locally.',
          'Maintenance staff: use the maintenance portal view to assign, update status, and mark completed.',
          'Before submitting: note whether the issue is urgent (safety) vs. routine—put that in the description.',
        ],
        whatHappensNext: [
          'New orders start as Submitted. TAC reviews (tac_review), may Forward to maintenance, then Assigned and Completed—or Cancelled if invalid.',
          'Each status change can notify the submitter and assigned staff.',
          'Move-in/move-out inspections can automatically create work orders when items are marked deficient.',
        ],
        whoSeesThis: [
          'Submitters see their own requests and company-scoped lists where allowed.',
          'TACs see work orders for cadets in their company.',
          'Maintenance role sees the maintenance queue across locations they serve.',
          'Other cadets do not browse unrelated rooms’ open orders.',
        ],
        tips: [
          'One issue per work order—do not bundle unrelated repairs.',
          'Photos will be supported in a future update; for now, write precise descriptions (location, item, severity).',
          'TACs: forward promptly so cadets are not stuck waiting on room fixes before inspections.',
        ],
        tracking: [
          'Work Orders page: filter by status (open, forwarded, completed).',
          'Click an order for full timeline and comments.',
          'Completed orders remain searchable for history; check before re-filing the same broken item.',
        ],
      },
      {
        relatedRoutes: ['/work-orders', '/submit?tab=damage', '/maintenance'],
        isNew: true,
      },
    ),
  ],
}

export const barracksCategory: DocCategory = {
  id: 'barracks',
  title: 'Barracks & inspections',
  topics: [
    topic(
      'hallway-view',
      'Hallway view',
      'See who lives in each room at a glance—like a hotel floor chart.',
      {
        basics: [
          'Hallway view shows barracks rooms in a visual layout with top and bottom bunk assignments.',
          'TACs use it for quick headcounts, room changes, and printable reference sheets.',
          'Why it matters: you always know who should be in which bed without opening every profile individually.',
        ],
        howToUse: [
          'Open Barracks → Hallway from the navigation (TAC access required).',
          'Browse hallways and rooms; click a room for detail, move-in/out forms, and parent invites.',
          'Use Print hallway sheet when you need a paper copy for the duty desk or fire drill.',
          'Before room changes: update roster assignments so hallway occupancy stays accurate.',
        ],
        whatHappensNext: [
          'Room detail opens inspection forms, cadet links, and invite tools.',
          'Archived cadets no longer appear as active occupants.',
          'Print view opens a simplified layout suitable for printing.',
        ],
        whoSeesThis: [
          'TAC officers and higher barracks staff see hallway view for their scope.',
          'Cadets do not use hallway view—they see their own room on their profile where shown.',
          'Maintenance-only accounts use the maintenance portal, not hallway layout.',
        ],
        tips: [
          'Refresh after bulk roster moves at the start of term.',
          'Cross-check hallway view with move-in forms before signing off a room.',
          'Keep printouts dated—rerun after any room swap.',
        ],
        tracking: [
          'Barracks → Hallway: live occupancy.',
          'Barracks → Hallway → Print: snapshot sheet.',
          'Individual room pages: inspection history and open work orders for that room.',
        ],
      },
      {
        relatedRoutes: ['/barracks/hallway', '/barracks/hallway/print', '/barracks/rooms'],
        isNew: true,
      },
    ),
    topic(
      'inspection-forms',
      'Move-in & move-out inspections',
      'Room condition checklists that document state and trigger repairs.',
      {
        basics: [
          'Inspection forms record the condition of every fixture in a room—desk, bed, walls, etc.—using simple status bubbles.',
          'Move-in captures starting condition; move-out compares when a cadet leaves.',
          'Why it matters: fair accountability for damage and automatic repair requests when something is not acceptable.',
        ],
        howToUse: [
          'Open the room from Hallway view or Barracks → Rooms.',
          'Start Move-in (cadet or TAC) or Move-out (TAC) form.',
          'Tap each item’s status: INS (inspected OK), DAM (damage), CLN (needs cleaning), FIX, REP, MIS (missing), OTH, or N/A.',
          'Work through sections—Desk, Mattress, etc.—including Left/Right or Top/Bottom where shown.',
          'Before saving: walk the room physically; do not guess from memory.',
          'Save the form—deficient statuses create work orders automatically.',
        ],
        whatHappensNext: [
          'Saving records the inspection and timestamps who completed it.',
          'Deficient items (DAM, CLN, FIX, REP, MIS—not INS, N/A, or OTH) spawn work orders to the TAC queue.',
          'Move-out comparison may assign financial or disciplinary follow-up outside CadetFlow per school policy.',
        ],
        whoSeesThis: [
          'Cadets may complete move-in for their assigned room where allowed.',
          'TACs complete move-out and review all company room forms.',
          'Maintenance sees resulting work orders, not necessarily every bubble on the form.',
          'Admins audit forms through barracks and work order history.',
        ],
        tips: [
          'Mark INS only when you truly inspected the item—future move-out compares against today.',
          'Use OTH sparingly with a note in work order description when status alone is not enough.',
          'Duplicate work orders for the same item are prevented—update the open order instead of re-saving blindly.',
        ],
        tracking: [
          'Room detail page: open and past inspection forms.',
          'Work Orders: auto-created items from deficiencies.',
          'Compare move-in vs. move-out on the same room before checkout meetings.',
        ],
      },
      {
        relatedRoutes: ['/barracks/rooms', '/barracks/forms', '/work-orders'],
        isNew: true,
      },
    ),
    topic(
      'move-in-invites',
      'Move-in parent invites',
      'Invite parents to the portal while a cadet is moving into a room.',
      {
        basics: [
          'When a cadet moves in, TACs can email parents a link to create their parent portal account.',
          'The invite ties the parent to the correct cadet before they ever log in.',
          'Why it matters: parents get access early for travel forms and conduct visibility without manual account setup.',
        ],
        howToUse: [
          'From the room detail page during move-in, open the parent invite section.',
          'Enter the parent email and send the invite.',
          'Resend if they did not receive it; revoke if you sent to the wrong address.',
          'Before sending: confirm email spelling with the cadet or family.',
        ],
        whatHappensNext: [
          'Parent receives an email with a unique link.',
          'They accept legal agreements and land in the parent portal linked to their cadet.',
          'You can see invite status on the room page—pending, redeemed, or revoked.',
        ],
        whoSeesThis: [
          'TACs send invites from barracks room pages.',
          'Only the invited email can redeem the link.',
          'Other staff see invite status on the cadet profile parent section where permitted.',
          'Parents see only their own portal after redeeming—not staff screens.',
        ],
        tips: [
          'Revoke mistaken invites before the wrong person redeems them.',
          'Portal invites from the cadet profile work the same way if not sent from the room.',
          'Remind parents to check spam for the first invite.',
        ],
        tracking: [
          'Room detail: invite list and status.',
          'Cadet profile → Parent section: all portal and move-in invites for that cadet.',
        ],
      },
      {
        relatedRoutes: ['/barracks/rooms', '/invite/move-in', '/profile'],
        isNew: true,
      },
    ),
  ],
}
