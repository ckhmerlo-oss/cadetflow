# Day 12 - Monthly/Term Summary Generation and TAC Forwarding

## Feature / Update Description
Automatically generate cadet summaries (demerits, conduct level/trends, classes/sports/grades when available), allow TAC review, and forward to parents via email and parent portal (Days 04, 11)—using Day 07 period-query aggregation and multi-year navigation.

## Why This Is Important
This formalizes communication cadence and improves consistency in parent-facing updates while preserving TAC review authority. Summaries depend on accurate assignment context (Day 02), historical conduct (Day 07), and parent delivery channels (Days 04, 11).

## General Implementation Approach

### User View
- TAC receives draft summaries per cadet on monthly/term schedule.
- TAC can review, edit, approve, and forward summaries to linked parents.
- Parents receive forwarded summaries by email (Day 04) and can view them in the portal (Day 11).
- Archived cadets are excluded from active generation schedules (Day 06).
- **Day 06 closeout:** Unresolved summary drafts appear in pre-close reminders; admin must forward, discard, or complete drafts before year close (or explicit override with audit).

### Backend Perspective
- Assemble data from discipline, Day 07 period queries (conduct stats for the summary period), roster, assignments (Day 02), and academic/sports sources.
- Generate summary drafts with versioning; **persist the generated payload** in the summary document so forwarded parent copies remain point-in-time even if source records change later.
- Log review/forward actions and delivery outcomes.
- Register summary events in Day 03/04 notification taxonomy (TAC draft ready, parent delivery confirmation).
- Apply Day 01 RLS patterns to summary storage and parent-visible outputs.

## Completion Checklist

- [ ] Define summary document schema and versioning model.
- [ ] Implement data aggregation pipeline for summary fields (via Day 07 period-query RPCs for the target term/month).
- [ ] Implement monthly/term generation trigger or scheduler (respect Day 06 archive exclusions).
- [ ] Include unresolved drafts in Day 06 closeout reminder payload; block or override year close per Day 06 wizard rules.
- [ ] Build TAC review/edit/approve workflow UI.
- [ ] Build forward-to-parent action with in-app and email integration (Days 03–04, 11).
- [ ] Add audit trail for generated/edited/forwarded summaries.
- [ ] Add RLS policies for summary documents (Day 01 pattern).
- [ ] Add tests for data completeness, role-scoped visibility, and archive exclusions.
- [ ] Sign-off criteria: TAC can generate, review, and forward accurate summaries in staging; parents receive summaries only for linked, non-archived cadets per policy.
