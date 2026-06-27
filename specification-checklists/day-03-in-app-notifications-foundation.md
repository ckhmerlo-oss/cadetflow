# Day 03 - In-App Notifications Foundation

> **Status:** Implemented (2026-06). Integrated staging sign-off closes in Days 13–14.

## Feature / Update Description
Build the in-app notification system baseline, event taxonomy, and user preference controls for cadets, staff, submitters, and assigned oversight faculty.

## Why This Is Important
In-app notifications are the primary real-time communication channel for action-required workflows and discipline transparency. Preference-aware delivery prevents alert fatigue and aligns with the email notification system built in Day 04.

## General Implementation Approach

### User View
- Users see a notification feed with unread/read states.
- Notifications are contained behind a Bell icon between the feedback and profile icons
- The bell icon gains a marker (either a count or an on/off red bubble) when the user has unread notifications
- Users receive alerts when reports are actioned, when they are affected by discipline events, and when oversight cadets trigger key events.
    - When a report a user submitted is final-approved, or if it is rejected or kicked back and why
    - When a report a user is the subject of is submitted or final-approved.
    - When a user's appeal is approved, final-approved, or rejected
    - When a user is added to the ED Tour Sheet (0 tours -> +X tours) or removed from the tour sheet (+X tours -> 0 Tours)
    - When a user changes conduct level status (Changes conduct level or added to/removed from Probation)
    - When a user's assigned cadet has a report submitted against them, is added to or removed from the tour sheet, or changes conduct level status
- Users can set their own preferences for notifications; what they are notified for, how they are notified, how often they are notified. Tie into preferences page used for email notifications

### Backend Perspective
- Define canonical event types and recipient rules aligned with Day 02 assignment-change events and Day 04 email event mappings.
- Filter notifications through user preferences (event, channel, frequency) to prevent alert fatigue.
- Persist in-app notification records with idempotency keys.
- Support read-state updates and feed queries by role/scope.
- Suppress or skip fan-out for archived users per Day 06 archive state.
- Register **year closeout reminder** events (`archive.pre_close_summary`) for Commandant, TAC, and maintenance recipients with outstanding-work counts (Day 06 Phase A).
- Apply Day 01 RLS patterns to new notification storage and reconcile `notification_queue` write policy for non-admin enqueue paths.
- Provide an extensible event registry so later producers (Days 08, 10, 11, 12) can plug in without schema rewrites.

## Implemented (Key Artifacts)

- Schema: `notification_event_types`, `user_notifications`, `in_app_notification_queue`
- UI: `app/components/NotificationBell.tsx`, `app/lib/notificationActions.ts`
- Event registry: `app/lib/notificationEvents.ts`
- pgTAP: `supabase/tests/database/14_in_app_notifications.sql`, `15_incident_notifications.sql`

## Completion Checklist

- [x] Finalize event taxonomy for required scenarios (report submit/approve/reject/kickback, appeal outcomes, ED tour sheet changes, conduct/probation changes, assignment-linked oversight events, **year closeout reminders**).
- [x] Create in-app notification storage schema, indexes, and RLS policies (Day 01 pattern).
- [x] Reconcile `notification_queue` write/enqueue policy for app-level non-admin contexts (Day 01 deferred follow-up).
- [x] Define and implement user notification options and filter flows on the shared preferences page (aligned with Day 04 email controls).
- [x] Implement event -> recipient fan-out rules.
- [x] Add idempotency safeguards for duplicate event processing.
- [x] Implement unread counts and mark-read behavior.
- [x] Build notification feed API/query path with scope enforcement.
- [x] Add UI notification center/inbox with bell icon, unread marker, and feed between feedback and profile icons.
- [x] Add tests for routing correctness across user types.
- [ ] Sign-off criteria: in-app alerts appear correctly for cadet, submitter, TAC, and assigned faculty in staging scenarios; preference filters and archive suppression behave as expected *(closes in Day 13–14 integrated smoke/UAT)*.
