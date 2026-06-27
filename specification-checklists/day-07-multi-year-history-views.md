# Day 07 - Multi-Year Profile/Ledger Views and Conduct History

> **Status:** Implemented (2026-06). Staff conduct-list UI and parent permission scoping deferred (Day 13 and Day 11 respectively). Integrated sign-off closes in Days 13–14.

## Feature / Update Description
Enable year/term switching on cadet profiles and ledgers, provide server-side **date-ranged investigation** over authoritative source records (demerits, ledger events, enrollments), and support returner continuity established in Day 06 archival lifecycle.

**No conduct snapshot table.** Historical conduct, ledger, and academic views are computed on demand from existing data joined to `academic_terms` date boundaries—not from denormalized copies.

## Why This Is Important
TAC/admin need fast cross-year insight for returning cadets, disciplinary trends, and parent communication. Current-term-only views are insufficient. A unified period-query layer feeds Day 12 summary generation and Day 11 parent conduct views without maintaining redundant snapshot rows.

## General Implementation Approach

### User View
- Profile and ledger pages include **school-year and term** switchers.
- Users can view prior-period reports, conduct status, and summary metrics for the selected range.
  - Example: TAC or higher can generate a list of all Term 3 Exemplary Conduct cadets even though it is Term 5.
- Returners show continuous history across archived and reactivated years (Day 06).
- Parents see only linked-cadet historical conduct within allowed scope (Day 11).
- Archived cadets: read-only historical investigation for authorized viewers; excluded from active operational views (Day 06).

### Backend Perspective — Period Query Layer

**Do not** add a `cadet_school_years` membership table. **Remove** the Day 06 `cadet_conduct_snapshots` stub and `generate_year_conduct_snapshots` call from `close_school_year` (see Day 06 supersession note).

#### Authoritative sources (no duplicate conduct store)

| Investigation type | Source tables | Range key |
|---|---|---|
| Conduct level / demerit stats | `demerit_reports` (`status = 'completed'`, `date_of_offense`, `demerits_effective`) + `calculate_conduct_status()` | Term dates; school-year YTD through selected term end |
| Report ledger | `get_cadet_audit_log` (demerits + `tour_ledger`) | `event_date` / `date_of_offense` within bounds |
| Academic history | `cadet_class_enrollments` → `class_sections` | `school_year`, `term_number` |
| Tour stats (as-of period end) | `tour_ledger` replay | Cumulative through period `end_date` |

#### Core RPCs / helpers (names illustrative; implement as security-definer with permission checks)

1. **`resolve_period_bounds(school_year, term_number?)`** — map to `{ term_start, term_end, year_start }` from `academic_terms`.
2. **`get_cadet_period_stats(cadet_id, school_year, term_number?)`** — term demerits, YTD year demerits, conduct level, optional tour totals as-of period end. Generalizes current-term-only `get_cadet_ledger_stats`.
3. **`get_cadet_ledger_for_period(cadet_id, start, end)`** — server-filtered audit log (move filtering out of client-only ledger page logic).
4. **`get_cadet_academic_history(cadet_id, school_year?, term_number?)`** — enrollment/class rows for the period.
5. **`list_cadets_by_conduct(school_year, term_number, min_level?)`** — roster-wide staff report (e.g. Exemplary Conduct list for a prior term).
6. **`list_cadet_historical_years(cadet_id)`** — distinct years from `cadet_class_enrollments.school_year`, `demerit_reports.date_of_offense` ∩ `academic_terms`, and archived `academic_terms` rows.

#### Rules
- **Same logic for current and historical:** period stats use the same aggregation rules as live views; only date bounds change.
- Returner **years attended** displays `cadet_profile_view.years_attended` (Day 06 increments on reactivation, not at archive).
- Permission-scoped by role (cadet self, staff, TAC company, admin, parent linked-cadet) per Day 01 RLS patterns.
- **Point-in-time parent communications:** Day 12 summary documents store the generated payload at forward time; live period queries reflect current source-record truth (including retroactive appeals).
- **Policy thresholds:** use current `calculate_conduct_status()` thresholds; when admin-configurable conduct bands land, store per-`school_year` threshold config so historical periods use the policy in effect for that year.
- Index `(subject_cadet_id, date_of_offense)` on `demerit_reports` where missing; filter on `status = 'completed'` for conduct totals.

## Implemented (Key Artifacts)

- Migration: `supabase/migrations/20260626000001_day07_period_queries.sql` (+ follow-on period/archive migrations)
- App layer: `app/lib/period-queries.ts`, `app/lib/period-utils.ts`, `app/components/PeriodSelector.tsx`
- UI: profile, ledger, manage roster period switchers; `/profile/[id]/history` cadet school history report
- pgTAP: `supabase/tests/database/21_day07_period_queries.sql`, `22_day07_archive_intervals.sql`, `23_cadet_school_history.sql`

## Completion Checklist

### Deprecate snapshot stub (Day 06 carryover)
- [x] Remove `generate_year_conduct_snapshots` from `close_school_year` ordered job.
- [x] Drop `cadet_conduct_snapshots` table and related RLS policies (migration).
- [x] Update Day 06 year-close tests to remove snapshot assertions.

### Period query API
- [x] Implement `resolve_period_bounds` helper.
- [x] Implement `get_cadet_period_stats` (generalize `get_cadet_ledger_stats` with optional `school_year` / `term_number`; default = current term).
- [x] Implement `get_cadet_ledger_for_period` (server-side filtered audit log).
- [x] Implement `get_cadet_academic_history` for profile period views.
- [x] Implement `list_cadet_historical_years` from enrollments and offense dates — no membership table.
- [x] Implement `list_cadets_by_conduct` staff report query.

### UI
- [x] Add school-year / term selector on profile and ledger pages; wire stats and conduct display to period RPCs.
- [x] Ensure ledger event list uses server-side period filter (replace or complement client-only term filter).
- [ ] Build staff-facing conduct list view (e.g. Term 3 Exemplary Conduct roster report using `list_cadets_by_conduct`) *(deferred to Day 13 integration polish)*.

### Permissions and integration
- [x] Expand RLS / RPC permission checks for historical access by role (cadet, staff, TAC, admin).
- [ ] Expand parent linked-cadet permission scoping *(Day 11 parent portal)*.
- [x] Validate returner multi-year continuity after Day 06 reactivation.
- [x] Document period-query contract for Day 11 (parent portal) and Day 12 (summary aggregation) via `app/lib/period-queries.ts` and RPC surface.

### Testing
- [x] Add fixture-based tests across multi-year cadet histories (period stats, conduct lists, year enumeration).
- [ ] Sign-off criteria: switching between years/terms returns correct and role-appropriate data without data leakage; returner histories remain intact after archive/reactivate cycles; conduct list for a prior term matches manual demerit aggregation *(closes in Day 13–14)*.
