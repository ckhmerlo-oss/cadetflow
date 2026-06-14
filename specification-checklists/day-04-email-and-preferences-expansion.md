# Day 04 - Email Expansion and Preference Controls

## Feature / Update Description
Expand the email system to cover all required notification events and enforce preference settings, including per-cadet controls.

## Why This Is Important
Staff and parents rely on email for timely awareness when not active in-app. Preference-aware sending prevents alert fatigue and preserves trust.

## General Implementation Approach

### User View
- Users can set global and event-specific email preferences.
- Staff can set per-cadet preference overrides for cadets they oversee.
- Email delivery behavior matches saved preferences.

### Backend Perspective
- Map event taxonomy to email templates and recipient strategies.
- Add preference resolution logic (global -> user -> per-cadet).
- Ensure idempotent send jobs with retry/dead-letter behavior.

## Completion Checklist

- [ ] Define all email-triggering event mappings.
- [ ] Create/extend preference model to include per-cadet settings.
- [ ] Add preferences UI controls and validation.
- [ ] Implement preference resolution algorithm and tests.
- [ ] Update email dispatch pipeline for deterministic idempotency keys.
- [ ] Build template coverage for all required event categories.
- [ ] Add delivery status tracking and failure diagnostics.
- [ ] Run staged simulation for high-volume event bursts.
- [ ] Sign-off criteria: no email is sent when disabled by preference, and enabled events send once to expected recipients.
