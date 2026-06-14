# Day 13 - Integration and Cross-Epic Cleanup

## Feature / Update Description
Consolidate all epics, resolve integration issues, run migration/backfill cleanup, and harden cross-feature interactions.

## Why This Is Important
Most production failures occur at feature boundaries. This day absorbs integration risk before formal UAT and rollout.

## General Implementation Approach

### User View
- Workflows feel consistent across modules.
- No broken handoffs between reports, notifications, assignments, parents, and archival views.

### Backend Perspective
- Verify schema consistency, event contracts, and permission alignment.
- Run required data backfills and integrity checks.
- Fix edge-case failures discovered during end-to-end runs.

## Completion Checklist

- [ ] Run full cross-epic smoke pass in staging.
- [ ] Fix integration bugs between notifications, assignments, and report workflows.
- [ ] Validate archive/history interactions with hallway and parent views.
- [ ] Execute required data backfills for new tables/fields.
- [ ] Validate foreign keys, indexes, and performance baselines.
- [ ] Reconcile event payload compatibility across producers/consumers.
- [ ] Freeze scope for Days 14-15 (only bug fixes after this point).
- [ ] Sign-off criteria: all priority user journeys pass in an integrated staging environment.
