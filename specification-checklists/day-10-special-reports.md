# Day 10 - Special Reports (Affidavit Workflow)

## Feature / Update Description
Introduce Special Reports for cadets to submit witness/participant affidavits, with dedicated review, event assignment, summarization, and action workflow—distinct from standard stick submissions (Day 05 category rules do not apply).

## Why This Is Important
Special Reports capture narrative evidence and context not represented in standard stick submissions, improving decision quality and transparency. Sensitive narratives require strict access controls consistent with Day 01 RLS patterns.

## General Implementation Approach

### User View
- Cadets can submit narrative Special Reports in a dedicated interface.
- TAC/admin can review, cluster by event, summarize, and decide next actions (escalate, close, convert to incident/discipline record, reference).
- Assigned oversight faculty (Day 02) receive in-app alerts when linked cadets submit or when review status changes, subject to preferences (Days 03–04).
- Submitter and subject cadets receive status notifications on review outcomes.

### Backend Perspective
- Add Special Report entity with event linkage, review states, and action audit log.
- Provide moderator review tooling and action log capture.
- Integrate outcomes with existing incident/discipline records where appropriate.
- Apply Day 01 RLS patterns for sensitive narrative access (cadet, TAC, admin, assigned faculty scopes).
- Register Special Report events in the Day 03 canonical taxonomy for in-app and Day 04 email fan-out.
- Respect Day 06 archive state (no new submissions or active review queues for archived cadets).

## Completion Checklist

- [ ] Define Special Report schema and status model.
- [ ] Build cadet submission form with structured narrative fields.
- [ ] Build TAC/admin review queue with event grouping controls.
- [ ] Add report-to-event linking and summary notes.
- [ ] Add action outcomes (escalate, close, convert, reference) and audit logs.
- [ ] Add in-app and email notification hooks for submission and review status changes (Days 03–04).
- [ ] Add RLS policies and access controls for sensitive narratives (Day 01 pattern).
- [ ] Validate archive-state behavior for submitters, subjects, and review queues (Day 06).
- [ ] Add tests for create/review/link/action lifecycle and unauthorized access.
- [ ] Sign-off criteria: Special Reports can be submitted, reviewed, linked, summarized, and actioned with complete traceability; notifications and permissions behave correctly across roles.
