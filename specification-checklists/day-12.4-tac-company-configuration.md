# Day 12.4 - In-Company TAC Configuration

## Feature / Update Description
Company-scoped settings screen for Company TAC officers to adjust operational policy for their rifle company during the school year — starting with submission policy (Day 05 demerit categories, incident submission from the unified `/submit` hub) — without Commandant admin access.

> **Depends on:** Day 05 (school-default category restrictions), unified `/submit` hub with configurable incident submission (school defaults in `app_options`). Does not replace Commandant admin policy; TAC settings are company overrides within admin-defined ceilings.

## Why This Is Important
Cadet discipline policy varies by company and evolves mid-year. TACs need autonomy to enable cadet-leader incident filing and tune category bands without waiting on Commandant's Office admin UI changes. Alpha Company may grant Platoon Leaders incident authority while Bravo Company keeps Category I demerits only until a specific date.

## General Implementation Approach

### User View
- Route: `/company/settings` (or `/tac/settings`) — visible to Company TAC (level 65+, `can_manage_own_company_roster`) for own company only.
- Reuse admin Submission Policy UI components in **read-only school-default + editable company-override** mode.
- Show effective policy preview (“What Platoon Leaders in Alpha Co see on `/submit`”).
- Audit log: who changed what, when (company-scoped).
- Optional: “Reset to school default” per setting band.

### Backend Perspective
- **Two-tier policy:** school defaults (`app_options`, admin 90+) + company overrides (`company_policy_settings`, TAC 65+ own company).
- Effective resolver merges layers; company override wins when present but must not exceed admin ceiling.
- RLS: TAC with matching `company_id`; Commandant 90+ read all companies.
- Blocked writes fail before INSERT (same notification safety as Day 05).
- Refactor Day 05 / incident submission resolvers to accept optional `company_id` from submitter profile.

## Policy Model: School Default + Company Override

For a user in company C at role level R:

1. **School default** — `app_options` rows (no company scope; admin-managed).
2. **Company override** — `company_policy_settings` where `company_id = C` (TAC-managed).

Resolver: for each setting key + role band, use company override if present, else school default. TAC cannot grant permissions above the school default ceiling (admin may optionally lock a setting to prevent any TAC override).

## Configurable Settings Registry (extensible)

| Setting key | Source epic | TAC can… | Admin ceiling |
|-------------|-------------|----------|---------------|
| `demerit_category_bands` | Day 05 | Adjust allowed Category I–III per role band | Cannot exceed admin bands |
| `incident_submission_bands` | Submit hub | Enable/disable incident filing per role band | Cannot enable above admin max |
| (future) `notification_defaults` | Day 04 | Company notification templates | TBD |
| (future) `special_report_enabled` | Day 10 | Enable Special Report tab for company | TBD |
| (future) `work_order_enabled` | Day 08 | Enable Damage / Work Order tab for company | TBD |

## Completion Checklist

### Schema and API
- [ ] Create `company_policy_settings` (company_id, setting_key, bands jsonb, updated_by, updated_at).
- [ ] Create `company_policy_audit_log` with before/after snapshots.
- [ ] RPC: `get_effective_submission_policy(p_company_id uuid, p_role_level int)` merges school + company layers.
- [ ] RPC: `update_company_submission_policy(p_company_id uuid, p_bands jsonb)` — TAC-scoped write + audit.
- [ ] RLS on both tables; deny cross-company reads/writes.
- [ ] Optional admin flag on school defaults: `tac_override_locked` per setting.

### UI
- [ ] TAC company settings page at `/company/settings` (nav entry for TAC 65+).
- [ ] Reuse Submission Policy band editor from admin; show school default as reference row.
- [ ] Effective-policy preview for sample roles (Platoon Leader, Faculty, etc.).
- [ ] Company audit log panel (last 10 changes).

### Integration
- [ ] Wire `/submit` tab visibility to **effective** policy (company-aware), not school-only RPCs.
- [ ] Wire demerit category enforcement trigger/RPCs to resolve submitter `company_id`.
- [ ] Wire incident submission RLS/`submitIncident` to effective policy.
- [ ] Day 12.1 tour: TAC track step for company settings entry point.
- [ ] Day 13: multi-company isolation test (Alpha change does not affect Bravo).

### Tests
- [ ] pgTAP: company override beats school default for same band.
- [ ] pgTAP: TAC cannot write another company's settings.
- [ ] pgTAP: override above admin ceiling rejected.
- [ ] pgTAP: effective policy drives `/submit` permission RPCs.

## Sign-Off Criteria
- Company TAC can enable cadet-leader incidents for own company without admin login.
- Other companies unchanged; API bypass impossible; audit trail complete.
- School defaults remain authoritative ceiling; TAC changes reversible via reset or audit rollback.
