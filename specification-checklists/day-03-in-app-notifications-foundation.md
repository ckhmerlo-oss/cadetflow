# Day 03 - In-App Notifications Foundation

## Feature / Update Description
Build the in-app notification system baseline and event taxonomy for cadets, staff, and submitters.

## Why This Is Important
In-app notifications are the primary real-time communication channel for action-required workflows and discipline transparency.

## General Implementation Approach

### User View
- Users see a notification feed with unread/read states.
- Users receive alerts when reports are actioned, when they are affected by discipline events, and when oversight cadets trigger key events.

### Backend Perspective
- Define canonical event types and recipient rules.
- Persist in-app notification records with idempotency keys.
- Support read-state updates and feed queries by role/scope.

## Completion Checklist

- [ ] Finalize event taxonomy for required scenarios (report actioned, ED roster changes, conduct drop, assignment-linked events).
- [ ] Create in-app notification storage schema and indexes.
- [ ] Implement event -> recipient fan-out rules.
- [ ] Add idempotency safeguards for duplicate event processing.
- [ ] Implement unread counts and mark-read behavior.
- [ ] Build notification feed API/query path with scope enforcement.
- [ ] Add UI notification center/inbox placeholder integration.
- [ ] Add tests for routing correctness across user types.
- [ ] Sign-off criteria: in-app alerts appear correctly for cadet, submitter, TAC, and assigned faculty in staging scenarios.
