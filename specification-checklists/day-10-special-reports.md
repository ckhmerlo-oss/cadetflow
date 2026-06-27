# Day 10 - Special Reports, Events, and Affidavit Workflow

## Feature / Update Description
Introduce **Special Reports** (cadet affidavits), **Events** (organizational containers for significant occurrences), and **Incident Reports** integration—distinct from Category 1 demerit sticks (Day 05).

### Terminology

| Entity | Submitter | Purpose | Year-close behavior (Day 06) |
|--------|-----------|---------|------------------------------|
| **Incident report** | Faculty / cadet leadership | Cat-I-out-of-scope behavior filing | Auto **closed** at year close (Day 06) |
| **Special report** | Cadet | Witness/participant affidavit | Requires action; linked to events |
| **Event** | TAC/admin | Groups incidents + special reports + attachments | **Carry forward** to next school year if still open |

## Why This Is Important
Special Reports capture narrative evidence not represented in standard sticks. Events give TAC/Commandant a workspace to understand and action significant occurrences with linked filings and files (Day 12.2).

## General Implementation Approach

### User View
- Cadets submit Special Reports in a dedicated interface.
- TAC/admin create and manage **Events**; link incident reports and special reports; attach files.
- Review queues cluster by event; summarize and decide actions (escalate, close, convert, reference).
- **Action-required notifications** (in-app + email, Days 03–04) on new/updated events and special reports requiring review → **Commandant**, **Deputy Commandant**, and **TAC of the submitting cadet's company**.

### Backend Perspective

#### Events schema (new)
- `events`: id, title, summary, status (`open`, `under_review`, `closed`, `carried_forward`), school_year, created_by, created_at, updated_at
- Optional: `carried_forward_from_school_year`, `carried_forward_at`
- Junction: `event_incident_links`, `event_special_report_links` (or FK on child tables)
- Attachments via Day 12.2 file storage (`event_attachments` or generic document refs)

#### Special reports schema (new)
- Narrative fields, review states, `event_id` FK, submitter cadet_id, audit log

#### Incident reports (existing)
- Keep `incident_reports` as faculty/leadership filings; optional `event_id` FK for event grouping
- Day 06 closes pending incidents at year end — not carried forward

#### Year-close integration (Day 06 pre-flight / Day 10 ownership)
- **Open events** with status not terminal → **block** Close School Year until admin resolves or **carry forward** to next school year (sets `carried_forward_from_school_year`, remains actionable)
- Open special reports linked to open events follow event carry-forward
- Closeout reminders list open events as manual action (Day 06 Phase A)

#### Notifications
- `event.action_required` — Commandant, Deputy Commandant, company TAC (submitter's company)
- `special_report.action_required` — same recipient rule
- Register in Day 03/04 taxonomy

#### Archive state (Day 06)
- No new submissions for archived cadets
- Read-only historical access per Day 06 profile rules

## Completion Checklist

- [ ] Define `events` schema and status model with carry-forward fields.
- [ ] Define Special Report schema with `event_id` linkage.
- [ ] Add optional `event_id` on `incident_reports` for grouping.
- [ ] Build event create/review UI with incident + special report linking.
- [ ] Build cadet special report submission form.
- [ ] File attachments on events (Day 12.2).
- [ ] Action-required email + in-app to Commandant, Deputy Commandant, submitter company TAC.
- [ ] Carry-forward workflow for open events at year close; block close until resolved or carried.
- [ ] RLS for sensitive narratives (Day 01 pattern).
- [ ] Tests: lifecycle, notifications, year-close carry-forward, unauthorized access.
- [ ] Sign-off: events group filings end-to-end; carry-forward survives year boundary.
