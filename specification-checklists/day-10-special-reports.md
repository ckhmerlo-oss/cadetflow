# Day 10 - Special Reports (Affidavit Workflow)

## Feature / Update Description
Introduce Special Reports for cadets to submit witness/participant affidavits, with dedicated review, event assignment, summarization, and action workflow.

## Why This Is Important
Special Reports capture narrative evidence and context not represented in standard stick submissions, improving decision quality and transparency.

## General Implementation Approach

### User View
- Cadets can submit narrative Special Reports in a dedicated interface.
- TAC/admin can review, cluster by event, summarize, and decide next actions.

### Backend Perspective
- Add Special Report entity with event linkage and review states.
- Provide moderator review tooling and action log capture.
- Integrate outcomes with existing incident/discipline records where appropriate.

## Completion Checklist

- [ ] Define Special Report schema and status model.
- [ ] Build cadet submission form with structured narrative fields.
- [ ] Build TAC/admin review queue with event grouping controls.
- [ ] Add report-to-event linking and summary notes.
- [ ] Add action outcomes (escalate, close, convert, reference) and audit logs.
- [ ] Add notification hooks for relevant status changes.
- [ ] Add access controls for sensitive narratives.
- [ ] Add tests for create/review/link/action lifecycle.
- [ ] Sign-off criteria: Special Reports can be submitted, reviewed, linked, summarized, and actioned with complete traceability.
