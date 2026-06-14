# Day 06 - School Year and Cadet Archival Lifecycle

## Feature / Update Description
Implement bulk archival for school years and cadets (graduated/non-returning), while preserving historical data and supporting returner lifecycle states.

## Why This Is Important
Year turnover is operationally critical. Without bulk archival and returner handling, data quality degrades and role/roster actions become error-prone.

## General Implementation Approach

### User View
- Admin/TAC can archive cohorts in bulk with clear confirmations.
- Archived data is hidden from default active views but remains historically accessible.

### Backend Perspective
- Use soft-archive state transitions, not hard deletes.
- Preserve relational integrity and year-bound historical references.
- Add safeguards for accidental archive operations.

## Completion Checklist

- [ ] Define archive state model for cadets and school years.
- [ ] Implement bulk archive action with preview and confirmation.
- [ ] Ensure archive action is audited with actor and scope.
- [ ] Update active roster queries to exclude archived by default.
- [ ] Add archive filters/toggles for authorized historical access.
- [ ] Implement returner reactivation flow preserving history.
- [ ] Add validation for dependencies (assignments, notifications, profiles).
- [ ] Add rollback/recovery procedure for mistaken archive operations.
- [ ] Sign-off criteria: end-of-year archive simulation succeeds with no data loss.
