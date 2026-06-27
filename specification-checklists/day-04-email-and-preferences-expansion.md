# Day 04 - Email Expansion and Preference Controls

> **Status:** Implemented (2026-06). Parent/summary email templates deferred to Days 11–12. Integrated sign-off closes in Days 13–14.

## Feature / Update Description
Expand the email system to cover all required notification events, enforce preference settings (including per-cadet controls for oversight staff), and share a canonical event taxonomy with Day 03 in-app notifications.

## Why This Is Important
Staff and parents rely on email for timely awareness when not active in-app. Preference-aware sending prevents alert fatigue and preserves trust. A shared taxonomy keeps in-app and email delivery consistent.

## General Implementation Approach

### User View
- Users can set global and event-specific email preferences on the shared preferences page (aligned with Day 03 in-app controls).
- Staff can set per-cadet preference overrides for cadets they oversee (Day 02 assignments).
- Email delivery behavior matches saved preferences across discipline, oversight, facilities, parent, and summary workflows.
- Maintenance managers receive email when work orders land in the portal (Day 08).
- Parents receive invite and summary emails when enabled (Days 11–12).

### Backend Perspective
- Map canonical event taxonomy (shared with Day 03) to email templates and recipient strategies.
- Add preference resolution logic (global -> user -> per-cadet override).
- Ensure idempotent send jobs with retry/dead-letter behavior.
- Suppress email fan-out for archived users per Day 06 archive state.
- Add **year closeout reminder** email templates and recipient routing (Commandant/admin, company TACs, maintenance) aligned with Day 06 pre-close summary payload.

## Implemented (Key Artifacts)

- Migration: `supabase/migrations/20260618000001_day04_email_expansion.sql`
- Preferences UI: `app/preferences/page.tsx`
- Edge function: `supabase/functions/process-email-queue`
- pgTAP: `supabase/tests/database/16_email_notifications.sql`, `17_email_rate_limit.sql`

## Completion Checklist

- [x] Define all email-triggering event mappings aligned with Day 03 taxonomy (discipline, appeals, oversight, work orders, **year closeout reminders**).
- [ ] Define email mappings for special reports and parent/summary events *(deferred to Days 11–12 when those features ship)*.
- [x] Create/extend preference model to include per-cadet settings and in-app/email channel toggles.
- [x] Add preferences UI controls and validation on the shared preferences page.
- [x] Implement preference resolution algorithm and tests.
- [x] Update email dispatch pipeline for deterministic idempotency keys.
- [x] Build template coverage for discipline, oversight, incident, work-order, and year-closeout event categories.
- [x] Add maintenance-portal intake email templates (Day 08).
- [ ] Add parent-facing templates (invites, forwarded summaries) *(Days 11–12)*.
- [x] Add delivery status tracking and failure diagnostics (`email_delivery_log`, rate limiting).
- [ ] Run staged simulation for high-volume event bursts *(Day 14 load/UAT)*.
- [ ] Sign-off criteria: no email is sent when disabled by preference; enabled events send once to expected recipients across cadet, staff, maintenance, and parent roles *(closes in Day 13–14)*.
