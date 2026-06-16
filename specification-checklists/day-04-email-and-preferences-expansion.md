# Day 04 - Email Expansion and Preference Controls

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

## Completion Checklist

- [ ] Define all email-triggering event mappings aligned with Day 03 taxonomy (discipline, appeals, oversight, work orders, special reports, parent/summary).
- [ ] Create/extend preference model to include per-cadet settings and in-app/email channel toggles.
- [ ] Add preferences UI controls and validation on the shared preferences page.
- [ ] Implement preference resolution algorithm and tests.
- [ ] Update email dispatch pipeline for deterministic idempotency keys.
- [ ] Build template coverage for all required event categories.
- [ ] Add maintenance-portal intake and parent-facing templates (invites, forwarded summaries).
- [ ] Add delivery status tracking and failure diagnostics.
- [ ] Run staged simulation for high-volume event bursts.
- [ ] Sign-off criteria: no email is sent when disabled by preference; enabled events send once to expected recipients across cadet, staff, maintenance, and parent roles.
