# Day 08 - Work Orders Intake and TAC Triage

## Feature / Update Description
Create work order submission for rooms/shared spaces and a TAC triage workflow that can forward to maintenance email/portal.

## Why This Is Important
Facilities issues directly affect cadet quality of life and dorm operations. Centralized request tracking reduces loss of requests and improves accountability.

## General Implementation Approach

### User View
- Students submit work requests with room/location and issue details.
- TAC can review, update status, and forward requests externally.

### Backend Perspective
- Build work order domain model and status transitions.
- Add role-scoped queue views for TAC and admin.
- Track forwarding actions and outcomes for audit.

## Completion Checklist

- [ ] Define work order schema (requester, location, room, priority, status, notes).
- [ ] Build student submission form with validation.
- [ ] Build TAC queue with filters and status controls.
- [ ] Add forward-to-maintenance action path with audit entries.
- [ ] Add notifications for submission/status updates.
- [ ] Add permission checks for each state transition.
- [ ] Add tests for request lifecycle and unauthorized transitions.
- [ ] Sign-off criteria: request can be created, triaged, forwarded, and tracked end-to-end in staging.
