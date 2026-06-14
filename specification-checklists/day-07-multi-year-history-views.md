# Day 07 - Multi-Year Profile/Ledger Views and Conduct History

## Feature / Update Description
Enable year-switching on cadet profiles and ledgers, and persist term-end conduct snapshots for historical querying.

## Why This Is Important
TAC/admin need fast cross-year insight for returning cadets, disciplinary trends, and parent communication. Current-term-only views are insufficient.

## General Implementation Approach

### User View
- Profile and ledger pages include year/term switchers.
- Users can view prior-year reports, conduct status, and summary metrics.

### Backend Perspective
- Add or finalize snapshot storage for term-end conduct state.
- Ensure historical queries are efficient and permission-scoped.
- Keep current-term and historical logic consistent.

## Completion Checklist

- [ ] Define snapshot schema for term-end conduct level and summary stats.
- [ ] Implement snapshot generation at term close (or backfill job).
- [ ] Add historical query endpoints for profile and ledger views.
- [ ] Add UI year/term selector on profile and ledger pages.
- [ ] Add "conduct level by term" lookup/report query.
- [ ] Validate permissions for historical access by role.
- [ ] Add fixture-based tests across multi-year cadet histories.
- [ ] Sign-off criteria: switching between years returns correct and role-appropriate data without data leakage.
