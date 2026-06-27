# Day 05 - Configurable Stick Category Restrictions

> **Status:** Implemented (2026-06). Company-level TAC overrides deferred to Day 12.4. Integrated sign-off closes in Days 13–14.

## Feature / Update Description
Restrict cadet report submission to Category 1 by default, reserving Category 2/3 for TAC (or other authorized roles), with **school-admin** configurable policy stored in `app_options` and enforced through Day 01 authorized paths. Company-level TAC overrides for the same settings are deferred to Day 12.4 (`company_policy_settings`).

## Why This Is Important
This enforces discipline policy consistency while preserving admin flexibility to experiment with role authority over time. Server-side enforcement prevents bypass via direct API calls under Day 01 RLS.

## General Implementation Approach

### User View
- Cadets only see allowed category options in submission flows.
- TAC/admin can configure policy and see immediate effect in forms.
- Blocked submissions show a clear, role-appropriate error (no spurious notifications).

### Backend Perspective
- Enforce category permissions server-side via Day 01 RPC/authorized create paths, independent of UI restrictions.
- Store policy configuration in `app_options` with Day 01 RLS for admin write access.
- Audit policy changes and provide rollback-safe behavior.
- Do not emit report-submitted notifications (Day 03) for server-blocked category attempts.

## Implemented (Key Artifacts)

- Server enforcement: `app/lib/categoryRestrictions.server.ts`
- Admin UI: `app/admin/tabs/CategoryRestrictionsTab.tsx`
- Client filtering: `app/submit/components/SubmitDemeritForm.tsx`
- pgTAP: `supabase/tests/database/18_category_restrictions.sql`

## Completion Checklist

- [x] Define policy model for category restrictions by role.
- [x] Add admin settings UI for restriction configuration.
- [x] Implement server-side enforcement in report create path (Day 01 authorized flow).
- [x] Implement client-side filtering of disallowed categories.
- [x] Add audit logging for policy changes.
- [x] Add test cases for role/category combinations.
- [x] Add negative tests for blocked category submissions (API and UI).
- [ ] Sign-off criteria: cadets cannot submit disallowed categories even via direct API calls; policy changes take effect immediately without notification side effects on blocked attempts *(closes in Day 13–14)*.
