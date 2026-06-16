# Day 07 - Multi-Year Profile/Ledger Views and Conduct History

## Feature / Update Description
Enable year-switching on cadet profiles and ledgers, persist term-end conduct snapshots for historical querying, and support returner continuity established in Day 06 archival lifecycle.

## Why This Is Important
TAC/admin need fast cross-year insight for returning cadets, disciplinary trends, and parent communication. Current-term-only views are insufficient. Snapshots also feed Day 12 summary generation and Day 11 parent conduct views.

## General Implementation Approach

### User View
- Profile and ledger pages include year/term switchers.
- Users can view prior-year reports, conduct status, and summary metrics.
- Returners show continuous history across archived and reactivated years (Day 06).
- Parents see only linked-cadet historical conduct within allowed scope (Day 11).

### Backend Perspective
- Add or finalize snapshot storage for term-end conduct state at school-year/term boundaries (aligned with Day 06).
- Ensure historical queries are efficient and permission-scoped (Day 01 RLS patterns).
- Keep current-term and historical logic consistent.
- Exclude archived cadets from active operational views while preserving queryable history.

## Completion Checklist

- [ ] Define snapshot schema for term-end conduct level and summary stats.
- [ ] Implement snapshot generation at term close (or backfill job) aligned with Day 06 year boundaries.
- [ ] Add historical query endpoints for profile and ledger views.
- [ ] Add UI year/term selector on profile and ledger pages.
- [ ] Add "conduct level by term" lookup/report query.
- [ ] Validate permissions for historical access by role (cadet, staff, TAC, admin, parent).
- [ ] Validate returner multi-year continuity after Day 06 reactivation.
- [ ] Add fixture-based tests across multi-year cadet histories.
- [ ] Sign-off criteria: switching between years returns correct and role-appropriate data without data leakage; returner histories remain intact after archive/reactivate cycles.
