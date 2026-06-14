# Day 12 - Monthly/Term Summary Generation and TAC Forwarding

## Feature / Update Description
Automatically generate cadet summaries (demerits, conduct level/trends, classes/sports/grades when available), allow TAC review, and forward to parents.

## Why This Is Important
This formalizes communication cadence and improves consistency in parent-facing updates while preserving TAC review authority.

## General Implementation Approach

### User View
- TAC receives draft summaries per cadet on monthly/term schedule.
- TAC can review/edit/approve and forward summaries to parents.

### Backend Perspective
- Assemble data from discipline, conduct history, roster, and academic/sports sources.
- Generate summary drafts with versioning.
- Log review/forward actions and delivery outcomes.

## Completion Checklist

- [ ] Define summary document schema and versioning model.
- [ ] Implement data aggregation pipeline for summary fields.
- [ ] Implement monthly/term generation trigger or scheduler.
- [ ] Build TAC review/edit/approve workflow UI.
- [ ] Build forward-to-parent action with notification/email integration.
- [ ] Add audit trail for generated/edited/forwarded summaries.
- [ ] Add tests for data completeness and role-scoped visibility.
- [ ] Sign-off criteria: TAC can generate, review, and forward accurate summaries in staging.
