# Day 01 - RLS and Policy Hardening Baseline

> **Status:** Implemented (2026-06-13). Remaining sign-off and deferred follow-ups are tracked in Days 3–13—not as new Day-01 work.

## Feature / Update Description
Harden row-level security and authorization behavior for core disciplinary workflows, especially `demerit_reports` lifecycle actions that currently break or bypass strict policy assumptions.

## Why This Is Important
All later features depend on trusted access control. If RLS and policy enforcement are inconsistent, notifications, parent access, archival, and staff oversight features can leak data or fail unpredictably.

## General Implementation Approach

### User View
- Users keep the same major workflows (submit, approve, reject, view), but unauthorized actions now fail consistently and clearly.
- Admins and TACs should see stable behavior under strict permissions.

### Backend Perspective
- Audit all high-risk tables/functions for RLS gaps.
- Normalize report lifecycle paths to server-authorized flows that are RLS-compatible.
- Ensure policy logic is explicit and testable (no hidden bypass paths).

## Completion Checklist

- [x] Build and publish a table-level RLS matrix for: reports, appeals, profiles, assignments, notifications, parent links.
- [x] Verify RLS is enabled or explicitly justified for each sensitive table.
- [x] Refactor report approval/rejection/kick-back paths to one consistent authorized service path.
- [x] Remove or replace any direct update path that fails under RLS.
- [x] Add negative tests for unauthorized report actions by role.
- [x] Add positive tests for authorized lifecycle actions by role.
- [x] Validate audit entries for security-sensitive actions.
- [x] Document known constraints and migration implications.
- [ ] Sign-off criteria: core report lifecycle passes with RLS fully enabled in staging *(closes in Day 13–14 integrated smoke/UAT—not new Day-01 implementation)*.

## Live RLS Matrix (Audit Snapshot)

Source: Supabase MCP live catalog (`pg_class`, `pg_policies`) on 2026-06-13.

| Area | Table(s) | RLS State | Notes |
|---|---|---|---|
| Reports | `demerit_reports`, `approval_log` | `demerit_reports`: disabled at audit time; `approval_log`: enabled | Hardening migration enables `demerit_reports` and keeps RPC path authoritative. |
| Appeals | `appeals` | enabled | Policies present for cadet/staff visibility and assignee update paths. |
| Profiles | `profiles` | enabled | Removed permissive global-read policy in hardening migration. |
| Assignments | `approval_groups`, `roles`, `companies` | enabled | Existing staff management policies retained; overlaps remain. |
| Notifications | `notification_queue`, `mailing_list`, `system_settings`, `user_preferences` | enabled | Existing policies retained; see constraints below for queue writes. |
| Parent Links | N/A (not yet present) | N/A | Parent-link tables are not in current schema at Day-01. |
| Band/Options (supporting) | `band_details`, `app_options` | disabled at audit time | Hardening migration enables both and applies scoped policies. |
| Incident Workflow (supporting) | `incident_reports` | enabled | Existing policies found in live DB; local migration provenance should be reconciled later. |

## Implemented Day-01 Hardening Changes

- Added migration `supabase/migrations/20260613201000_day01_rls_hardening.sql` to:
  - enable RLS on `demerit_reports`, `app_options`, and `band_details`
  - tighten grants (remove `anon` access on hardened tables)
  - remove permissive `profiles` policy (`Authenticated users can see all profiles`)
  - define explicit `app_options` and `band_details` policies
  - add `public.is_band_manager()` helper used by band policies
- Refactored report actions in `app/report/[id]/actions.ts`:
  - `approve`, `reject`, `kickback`, and `pull` now call RPCs (`handle_*`, `pull_report`)
  - removed direct table update paths for those lifecycle actions
- Added DB test wiring and coverage:
  - `package.json` scripts: `test:db`, `test:db:reset`
  - new role-matrix test: `supabase/tests/database/09_report_lifecycle_rls.sql`

## Known Constraints / Migration Implications

- Local DB test execution currently requires Docker Desktop (`supabase start` / `supabase test db` dependency).
- Live schema drift exists in some areas (`posted_at` in live DB vs historical `is_posted` migration lineage).
- `notification_queue` is currently admin-scoped by policy, while app-level digest enqueue logic may run from non-admin request context; this should be reconciled in a follow-up hardening pass.
- Parent-link schema is out of Day-01 scope because those tables are not yet present.

## Deferred Follow-Ups (Routed to Later Days)

| Item | Routed To |
|---|---|
| `notification_queue` write policy vs non-admin enqueue context | Day 03 (in-app/notification pipeline hardening) |
| Parent-link table RLS and policies | Day 11 (parent invite/portal schema) + Day 13 (integration verification) |
| `incident_reports` local migration provenance reconciliation | Day 13 (integration and schema cleanup) |
| Staging sign-off for core report lifecycle under full RLS | Day 13–14 (integrated smoke + UAT) |
| RLS for new tables introduced in Days 3–12 | Each feature day applies Day-01 patterns; Day 13 verifies full matrix |

## Staging Sign-Off Runbook

Run this sequence on staging after applying the Day-01 migration:

1. Submit report as issuer.
2. Approve from current approver group (RPC path).
3. Reject and kick-back paths from valid/invalid roles.
4. Pull report as issuer and as non-issuer (negative case).
5. Verify corresponding `approval_log` entries for each action.
6. Verify `app_options` read + admin/band-manager write workflows.
7. Verify `band_details` read/write behavior for band manager vs unauthorized user.
