# Day 08 - Work Orders Intake and TAC Triage

## Feature / Update Description
Create work order submission for rooms/shared spaces, a TAC triage workflow, and a maintenance manager portal for organizing, assigning, and completing forwarded requests—including auto-generated orders from Day 09 move-in/move-out deficiencies.

## Why This Is Important
Facilities issues directly affect cadet quality of life and dorm operations. Centralized request tracking reduces loss of requests and improves accountability.

## General Implementation Approach

### User View
- Students submit work requests with room/location and issue details.
    - Student-fillable forms break down to barracks room issue or other issue.
    - Students can select from pre-made checkboxes for common barracks room issues to streamline submission and review.
- TAC can review, update status, and forward requests to the maintenance manager.
- Forwarded requests land in the maintenance management view, where the maintenance manager can organize, assign, forward, attach notes to, and mark complete work orders.
- Work order requests that land in the maintenance portal also send an email notification.
- Move-in/move-out inspection deficiencies (Day 09) can auto-create linked work order requests for TAC or maintenance follow-up.

### Backend Perspective
- Build work order domain model and status transitions.
- Add role-scoped queue views for TAC, admin, and maintenance manager.
- Track forwarding actions and outcomes for audit.
- Build work order tracking and reporting pages to view, organize, and action orders.
- Support auto-creation from move-in/move-out form deficiency codes (Day 09) with source-form linkage.
- Emit in-app notifications (Day 03) for submission/status updates; email maintenance on portal intake per user preference rules (Day 04).
- Apply Day 01 RLS patterns to work order tables and maintenance portal queries.

## Completion Checklist

- [ ] Define work order schema (requester, location, room, issue type, priority, status, notes, optional source inspection form).
- [ ] Build student submission form with barracks/other branching, checkbox presets, and validation.
- [ ] Build TAC queue with filters and status controls.
- [ ] Build Work Order Request details page with role-appropriate actions and status tracking.
- [ ] Add forward-to-maintenance action path with audit entries.
- [ ] Build maintenance portal and define roles able to access it.
- [ ] Build maintenance portal action paths and organization structure.
- [ ] Build work order tracking and report pages for TAC/admin/maintenance views.
- [ ] Add auto-creation path from move-in/move-out deficiency items (Day 09).
- [ ] Add in-app and email notifications for submission/status updates (Days 03–04).
- [ ] Add RLS policies and permission checks for each state transition (Day 01 pattern).
- [ ] Add tests for request lifecycle and unauthorized transitions.
- [ ] Sign-off criteria: requests can be created manually or from inspection deficiencies, triaged, forwarded, and tracked end-to-end in staging.
