# Day 13 - Integration and Cross-Epic Cleanup

> **Prerequisite:** Days 9–12.4 feature epics complete. Also closes deferred sign-off from Days 01 and 03–08.

## Feature / Update Description
Consolidate all epics, resolve integration issues, run migration/backfill cleanup, close Day 01 deferred follow-ups, and harden cross-feature interactions before UAT.

## Why This Is Important
Most production failures occur at feature boundaries. This day absorbs integration risk before formal UAT and rollout, and closes gaps deferred from completed Days 1–8.

## General Implementation Approach

### User View
- Workflows feel consistent across modules.
- No broken handoffs between reports, notifications, assignments, facilities, parent portal, archival/history, and summary flows.

### Backend Perspective
- Verify schema consistency, event contracts, and permission alignment across all Days 3–12 tables.
- Close Day 01 deferred items: full RLS matrix for new tables, `notification_queue` policy reconciliation, `incident_reports` migration provenance.
- Run required data backfills and integrity checks.
- Fix edge-case failures discovered during end-to-end runs.

## Completion Checklist

### Deferred sign-off from completed epics (Days 01, 03–08)
- [ ] Close Day 01 staging sign-off: core report lifecycle under full RLS in integrated environment.
- [ ] Close Days 03–05 integrated sign-off: in-app + email notification routing, preference filters, archive suppression, category restriction enforcement.
- [ ] Close Day 07 sign-off: period switching, returner continuity, conduct-list RPC accuracy; ship staff conduct-list UI if not done earlier (`list_cadets_by_conduct` on `/manage` or reports).
- [ ] Close Day 08 sign-off: work order lifecycle in staging; open orders survive year close.

### Cross-epic integration
- [ ] Run full cross-epic smoke pass in staging covering all priority user journeys.
- [ ] Publish updated RLS matrix including Days 3–12 tables (notifications, work orders, rooms/forms, special reports, parent links, summaries).
- [ ] Reconcile `notification_queue` write/enqueue policy with app-level producers (Day 03 deferred follow-up).
- [ ] Reconcile `incident_reports` local migration provenance with live schema.
- [ ] Fix integration bugs between notifications (Days 03–04), assignments (Day 02), and report/discipline workflows.
- [ ] Validate shared event taxonomy and preference resolution across in-app and email channels.
- [ ] Validate category restriction policy (Day 05) with submission and notification paths.
- [ ] Validate unified `/submit` hub: demerit + incident tabs, permission-driven visibility, `/incidents/create` redirect.
- [ ] Validate multi-company policy isolation (Day 12.4): Alpha TAC override does not affect Bravo Co effective policy.
- [ ] Validate archive/history interactions with hallway (Day 09), parent portal (Day 11), summaries (Day 12), and notifications.
- [ ] Validate incident year-close: pending incidents auto-closed with `school_year_closed` (not carried forward).
- [ ] Validate event carry-forward at year close (Day 10): open events block or carry to next school year.
- [ ] Validate demerit auto-pull, appeal auto-reject, and incident auto-close at year close; confirm work orders unchanged across year boundary.
- [ ] Validate work order auto-creation from move-in/out deficiencies (Days 08–09) end-to-end.
- [ ] Validate special report review, conversion, and notification paths (Day 10).
- [ ] Execute required data backfills for new tables/fields (rooms, assignments history); confirm Day 07 snapshot stub removal migration applied.
- [ ] Validate foreign keys, indexes, and performance baselines.
- [ ] Reconcile event payload compatibility across producers/consumers.
- [ ] Freeze scope for Days 14–15 (only bug fixes after this point).
- [ ] Sign-off criteria: all priority user journeys pass in an integrated staging environment with no open Day 01 deferred follow-ups.
