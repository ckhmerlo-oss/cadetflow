---
name: Cadetflow V2 Specification
overview: A single-school-first V2 specification for Cadetflow that preserves core disciplinary functionality, makes policies admin-configurable, introduces role-based boolean permissions, and lays a tenant-ready foundation for future multi-school rollout. No implementation work—planning and design only.
todos: []
isProject: false
---

# Cadetflow V2 Specification (Single-School First)

## Design principles

- **Backend-first, server-secure (paramount):** The UI has only the authority explicitly granted by the database and server. The database (RLS, RPCs, triggers) and server-side checks are the **single source of truth** for what a user can see and do; the client is never trusted. Every read and write is authorized server-side using the authenticated user’s identity and the permissions stored in the database—never from client-sent role, permission, or scope. A single data breach or permissions blunder could torpedo the project; security is not optional and cannot rely on the UI (e.g. hiding buttons or routes). Implementation: resolve the current user from the session only; look up role and permissions from the DB; enforce in RLS and in every server action/RPC before performing the operation; audit security-sensitive actions.
- **Single school for launch:** One school, one Supabase project, one deployment. Schema and code are structured so that adding `school_id` (or tenant resolution) later does not require a rewrite.
- **Config over code:** Tour credits, nuke rules, conduct bands (term and year), and chain behavior are stored in DB/config and editable by admins—few or no hard-coded policy constants.
- **Permissions:** Role **level** retained for hierarchy (who can submit on whom); **normalized permission model** with a `permissions` catalog table (keys like `conduct.create`, `conduct.approve`, `green_sheet.view`) and `role_permissions` junction table for flexible, auditable access control. This allows school-specific custom roles and global system roles.
- **Audit and time:** Single source of truth for time (UTC in DB, display per school timezone). Pulled/appealed reports are never hard-deleted; status and audit log preserve history.
- **SIS as hub:** All features (demerits, leave, work orders, notes, reports) are scoped to the school and to persons (cadets/staff/parents) so the product can grow into a full SIS; discipline remains the core for V2 launch.
- **Policy reference (Blue Book):** The school’s disciplinary/school policy book (e.g. Blue Book 2025 v3.6) is the source of truth for conduct levels, demerit values, and procedures. It has been overhauled recently, changes during the year, and will likely be overhauled again. V2 must **not** hard-code policy from any specific version; all thresholds, bands, and rules live in admin-editable config so the system can track policy changes without code releases.

---

## 1. Tenant-ready single-school model

- **Now:** For initial launch, a single school (one `school_id`) is in use. All tenant-scoped tables MUST contain `school_id uuid NOT NULL` with an index. RLS policies enforce `school_id = current_setting('app.current_school_id')::uuid` (set by middleware/request wrapper from session). The schema and RLS already support multiple schools so no rewrite is needed when adding tenants later.
- **Tenant context:** Middleware or request wrapper sets `app.current_school_id` from session (e.g. from profile or subdomain) before any query runs. All application queries run with tenant context (tenant-bound database client or `withTenantContext(schoolId)` wrapper).
- **Later:** One codebase; either (a) one DB with `school_id` + RLS, or (b) separate Supabase projects per school with same schema and app configurable by deployment/subdomain. No decision required for single-school build; just avoid patterns that block either path (e.g. global singletons keyed only by user, not school).

---

## 2. Core domain and configurable policies

**Persons and org structure (unchanged in spirit, cleaner schema)**

- **Users** (auth) → **Profiles** (school-specific: name, company, role, grade, rank, flags like `is_in_band`, `archived`). Profile has `role_id` and optional `company_id`.
- **Companies** (e.g. Alpha, Bravo).
- **Roles:** `default_role_level` (integer, for hierarchy) + link to **permissions** via `role_permissions` junction table (normalized model). Roles can be school-specific (`school_id` nullable for global/system roles) or global. Optional display title/rank for UI.
- **Approval groups:** Same idea as V1—nodes in a chain/tree representing a level/position (e.g. "Squad Leader", "Commandant"); **Multiple users can be members of the same approval group** (via roles that link to the group), enabling load distribution: any user whose role is linked to the report's `current_approver_group_id` can approve at that step. This matches V1's effective load management approach. `next_approver_group_id` (or multiple for branches); `is_final_authority`; optionally `company_id` for company-scoped chains. In V2, **chains are first-class:** e.g. `approval_chain` (id, name, type: demerit | leave | work_order) and `approval_chain_nodes` (chain_id, approval_group_id, order, next_node_ids or single next). So “demerit chain” and “leave chain” can differ; report types reference `chain_id`.

**Discipline (configurable)**

- **Term credits:** Stored in **school/term policy** (e.g. `term_policies` or `system_settings`): `tour_credits_per_term` (e.g. 15), `credits_nuked_by_category` (e.g. policy_category = 3 → set credits to 0 and convert future term demerits to tours). Admin UI to edit these.
- **Conduct bands:** Two sets of bands in config—**per term** and **per year**—each: list of (label, min_demerits, max_demerits) (e.g. Exemplary 0–6, Commendable 7–18, …). Display conduct = “least commendable” of term vs year. Both term and year bands calculated and shown in V2.
- **Tours:** As in V1, `cached_tour_balance` on profile for performance; recomputed on report completion or ledger change in the **service layer** (not triggers). Logic uses configurable credits and nuke rules. Business logic (demerit math, tour/credit calculation, conduct bands) lives in the app service layer; triggers only handle audit logging and integrity invariants (e.g. `updated_at`).

**Reports and ledger**

- **Demerit reports:** Same lifecycle (draft → pending chain → pending commandant → completed); status and `current_approver_group_id` (or current chain node). Pull = status to voided/cancelled with audit; report row kept. Appeals: workflow with notes at each level; when granted, demerits zeroed (or report voided) per your preference; no hard delete. **Appeal + nuke rollback:** If a Category 3 report (that nuked credits) is successfully appealed and voided, full term recalculation is performed (recompute entire term state chronologically, insert compensating ledger deltas, update stats) to guarantee correctness of dependent tours. **Immutability after completion:** Once `status = 'completed'`, only specific fields may change (e.g. `is_posted`, `internal_notes`, `commandant_notes`) via authorized service paths; core fields (`offense_type_id`, `demerits_effective`, `subject_cadet_id`, `date_of_offense`) are protected by service-layer guards.
- **Green Sheet:** “All unposted completed reports” (any date). Post/unpost is a flag on the report; only certain permissions can post/unpost. No “day of” lock—flexible for late approvals and selective visibility.
- **Ledger:** Demerits, credits consumed, tours, conduct (term + year), with clear source (which report/appeal). Single time standard (store UTC, display in school timezone from settings). **Trust model:** `tour_ledger` is the source of truth; `cached_tour_balance` on profiles is display-only optimization. No code path trusts cached balance for authorization decisions; authorization queries `tour_ledger` directly. Reconciliation jobs detect and auto-fix mismatches.

**Other report types (design only for now)**

- **Leave requests:** Own workflow and chain (reuse or separate chain). Parent/cadet submits; chain approves; optional location/trip link later.
- **Work orders / move in-out:** Same idea—document type with its own chain and fields. Detailed schema deferred to a later phase.

---

## 3. Permissions model

- **Enforcement, not UI:** Permission checks are **always** enforced in the database (RLS and/or RPCs) and in server actions. The UI may hide or show controls for better UX, but **security never relies on the UI**. A malicious or buggy client that calls an action or queries data without permission must be rejected by the server/DB. Role and permissions are read from the DB (profiles + roles) using the authenticated user’s id from the session—never from client-sent headers or payloads.
- **Role level (integer):** Used only for hierarchy rules (e.g. “can submit report on user with strictly lower role level”). No longer the single gate for feature access.
- **Normalized permissions:** A `permissions` catalog table with keys (e.g. `conduct.create`, `conduct.approve`, `green_sheet.view`, `green_sheet.post`, `roster.manage_own_company`, `roster.manage_all`, `roster.view_archived`, `admin.infractions`, `admin.chains`, `admin.settings`, `admin.roles`, `ledger.view_own`, `ledger.view_company`, `ledger.view_all`, `appeal.create`, `appeal.review`, `parent.view_linked_ledger`, `parent.create_leave`). A `role_permissions` junction table links roles to permissions. Admin UI assigns permissions to roles; **RLS and server actions** check permission keys against DB state via `assertPermission(user, "permission.key")` pattern, not raw level thresholds or client assertions.
- **Special cases:** Parents: separate role/person type with permissions like `can_view_own_linked_cadet_ledger`, `can_create_leave_requests`, `can_edit_own_contact_info`. MFA/2FA for high-privilege accounts is a separate auth feature.

---

## 4. Auth, identity, and new actor types

- **Today:** Email/password; bulk CSV import; no self-signup for cadets/staff.
- **V2 (single-school):**
- Cadets/staff: same as today (provisioned accounts, bulk CSV; PowerSchool integration is a later phase).
- **Parents:** Separate identity (personal email). Link cadet ↔ parent is a **relationship** table (e.g. `cadet_parent_links`) created/approved by TAC or admin (no self-service link). Parent sees: linked cadet(s) ledger (read-only), leave request creation, own contact info edit. No access to other cadets or admin functions.
- **Unified time:** All `created_at` / `updated_at` / `date_of_offense` etc. in UTC; school timezone in `system_settings`; API and UI consistently convert for display.

---

## 5. Feature scope (single-school V2)

**Must-have for launch (ported from V1 + configurable)**

- Report submission and approval chain (demerits only for first release).
- Configurable chains: demerit chain per company/tree; each report type can point to a chain.
- Ledger with term/year demerits, credits, tours, conduct (term + year) using configurable bands.
- Green Sheet (unposted report list + post/unpost).
- Tour sheet and tour balance display/cache.
- Appeals (chain with notes; grant = void or zero demerits; no hard delete).
- Roster management (active, unassigned, bulk assign company/role, archive with history).
- Admin: infraction catalog, role permissions, approval chain config, academic terms, **policy config** (tour credits, nuke rules, conduct bands term/year), company CRUD.
- Exemplary cadet list (term) and any existing Tour Sheet / probation views you rely on.
- Export: CSV for lists; PDF for ledger/summary (case-by-case as you specified).
- Email alerts through Resend
- Coach/sport page for coaches to keep track of their athletes behavior, recieve alerts when their athlete has a report filed. Coaches can also approve leave requests
- Band page similar to sport page.
- Feedback button

**Explicitly in scope but phased after core**

- Leave request submission and approval (own chain).
- Work orders / move in-out (own chain).
- PowerSchool API (sync roster/grades); SIS “one stop” (grades, classes) surfaced in UI.
- Staff notes on student profile (digital file).
- Monthly scorecard: generated per cadet (conduct, class grade, ledger summary) → TAC comment → send to parents.
- Alerts/notifications: thresholds (demerits/tours), TAC/commandant/parent; on-site + email; configurable. **Notification system:** Decoupled pipeline: domain event → notification job enqueued (`notification_jobs` table with `recipient_id` for multiple recipients per event) → worker processes → provider adapter (Resend for email). Idempotency key format: `${event_type}:${entity_id}:${channel}:${recipient_id}`. Retry with exponential backoff; dead-letter after max retries. On-site notifications (`on_site_notifications` table) via Supabase real-time subscription.
- Student location / trips: coaches schedule trips, sign-outs (and later leave linkage).
- Parent portal: link cadet, view ledger, leave requests, contact info.
- Visual conduct-level trackers for cadets (progress toward next band).
- Probation: improved visibility and tracking (still manual rules).
- 2FA/MFA for administrators.
- Impersonation system: Admin impersonation sessions (`impersonation_sessions` table) with middleware that injects `impersonated_by` into request context; all audit_logs include impersonated_by; UI clearly indicates impersonation mode.
- Future port to iOS/Android App

**Out of scope for initial single-school build**

- Multi-school tenancy (subdomains, tenant resolution, separate Supabase projects). The **framework** (schema with reservable `school_id`, permission booleans, chain-per-report-type) is what we build so this can be added later without a rewrite.

---

## 6. Backend and data architecture (single-school)

- **Stack:** Next.js (App Router), Supabase (Postgres, Auth, optional Edge Functions for email/bulk).
- **Schema:** Normalized tables for profiles, companies, roles, approval_groups, approval_chains (versioned), approval_chain_nodes, demerit_reports (with version for optimistic concurrency, separate notes fields for visibility), offense_types, tour_ledger (immutable append-only, unique constraint on source), appeals, appeal_notes, domain_events, audit_logs (partitioned), academic_terms, term_policies, conduct_bands, cadet_term_stats (per-term aggregates), notification_jobs (with recipient_id), on_site_notifications, cadet_parent_links, impersonation_sessions, sync_runs. All tenant-scoped tables have `school_id uuid NOT NULL` with index and `CHECK (school_id IS NOT NULL)`. **Global invariants:** All config tables use `ON DELETE RESTRICT`; profiles/reports never deleted (archived/voided only); ledger immutable forever; soft-delete via `archived` boolean on config tables with partial unique constraints `WHERE archived = false`.
- **Server-secure data flow:** All mutations and sensitive reads go through server actions or RPCs that: (1) resolve the current user from the session only (never from client-sent user id, role, or permission); (2) load role and permissions from the database (profiles + roles); (3) verify the user is allowed to perform the operation; (4) then execute. RLS provides defense-in-depth so that even direct database access (e.g. compromised anon key) still restricts rows by `auth.uid()` and role/scope where applicable. No “admin override” or privilege escalation from the client.
- **RLS:** One school implied. Policies enforce `current_setting('app.current_school_id', true) IS NOT NULL AND school_id = current_setting('app.current_school_id')::uuid` with defense-in-depth check `school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid())`. All tenant tables have `CHECK (school_id IS NOT NULL)`. Middleware must assert `app.current_school_id` is set; fail fast if tenant context is missing. Policies keyed by `auth.uid()` and role/permissions (via joins or helper functions). **Field-level visibility:** Schema split approach: Separate columns for visibility levels (e.g. `notes` visible to cadet/parents/approvers, `internal_notes` visible only to TAC/commandant, `commandant_notes` visible only to commandant). RPCs filter columns based on caller role. Prefer a small set of `get`_* RPCs with clear contracts over broad table selects, to avoid RLS bloat and keep a single place for “who can see what.” RPCs that return sensitive data must enforce visibility the same way (e.g. SECURITY DEFINER that checks caller identity and permissions).
- **Audit:** Security-sensitive operations (approvals, role/company assignment, config changes, archive, post/unpost) must write to an audit log (actor, action, resource, timestamp, impersonated_by) so blunders or breaches can be traced. Audit logs are partitioned by `RANGE (created_at)` (monthly) with composite index `(school_id, created_at DESC)` per partition. Retain for 5 years, then prompt administrators to offload/archive older partitions.
- **Triggers:** Only audit logging and integrity invariants (e.g. `updated_at`). **No business logic in triggers.** All business logic (demerit math, tour/credit calculation, conduct bands, workflow transitions, ledger writes) lives in the app service layer. Tour/credit recalculation happens in `ledgerService.applyDemerits()` with row-level locking (`SELECT ... FOR UPDATE`) or RPC with `SERIALIZABLE` isolation (with auto-retry on serialization_failure). Logic reads from config (term_policies, conduct bands), not literals.
- **Version control and SQL:** Migrations in `supabase/migrations/` with descriptive names; no ad-hoc production SQL. Consider a simple migration checklist or CI step so “SQL dev→prod” is repeatable and documented.

---

## 7. Frontend and UX (strategy only)

- **UI never asserts authority:** The frontend only reflects what the server returns and only invokes actions the server exposes. Buttons and routes may be hidden based on server-provided permissions (or role) for better UX, but **security never depends on hiding**—every action and data request is re-authorized by the server. If the client sends an unauthorized request, the server must reject it and return an error; the UI should not send role or permission flags for the server to “trust.”
- **UI restructure:** New visual system and component library; consistent color and typography; mobile-friendly where it matters (submit, approval, ledger, Green Sheet).
- **SIS-centric shell:** Dashboard/navigation organized around “school operations” (roster, discipline, leave, work orders, reports) so adding SIS features (grades, classes, scorecards) fits naturally.
- **Unified time:** All user-facing timestamps from one formatting utility (school timezone from settings).
- **Conduct:** Clear display of term vs year conduct and “least commendable” rule; optional progress/tracker toward next band.
- Appearance determined by user role (data from server); students only see the information they need, student leaders see more, TACs see more, etc.

---

## 8. Quality and maintainability

- **Tests:** Unit tests for policy math (credits, nuke, conduct bands, tour conversion) and for permission checks; integration tests for critical flows (submit → approve → ledger update, appeal grant), multi-tenant isolation, RLS bypass attempts, SIS sync idempotency, impersonation attribution. **Concurrency tests:** Concurrent approval (two approvers at same group), concurrent ledger writes (two reports for same cadet), retry idempotency, approval chain modification while report mid-chain. **Policy edge case tests:** Term boundary rollover (credits reset), nuke category mid-term (future-only conversion). UI tests for key paths (submit, approve, view ledger) to catch regressions and mobile issues. **Security tests:** verify that unauthorized requests (wrong user, insufficient role, or client claiming elevated permission) are rejected by the server/DB—e.g. calling approve as a non-approver, or requesting another user’s ledger without permission—return 403 or empty/error, never success. All functions must have corresponding tests.
- **Permissions:** Centralized permission checks (e.g. server-side “can current user do X?”) used by both RLS helpers and server actions to avoid drift and reassignment bugs. No duplicate or divergent permission logic between client and server.
- **Docs:** Short README for “how to run migrations,” “how to add a new permission,” and “how to add a new report type/chain.” This supports commercial viability and fewer superuser-only steps.

---

## 9. Implementation order (recommended)

**Database-first, then seed, then features.** Before building application logic and UI, complete the database and a robust seed so every new feature can be implemented and tested against a consistent, realistic dataset.

1. **Database (full schema):** Build out the database as much as possible up front.

- All tables with reservable `school_id` where applicable: profiles, companies, roles, approval_groups, approval_chains, approval_chain_nodes, demerit_reports, offense_types, tour_ledger, appeals, approval_log, academic_terms, term_policies (or system_settings for credits, nuke, conduct bands), cadet_parent_links, etc.
- RLS policies and helper functions (e.g. `get_user_role_level`, permission checks).
- Triggers for `updated_at`, audit log, and tour/credit/conduct recalculation (hooked to config tables).
- Any RPCs required for visibility (e.g. roster, ledger, reports) with clear contracts.
- No ad-hoc production SQL; all changes via versioned migrations in `supabase/migrations/`.

1. **Robust seed:** Develop a comprehensive seed from which to implement and test.

- Schools (e.g. single school id 1), academic terms, term policies (tour credits, nuke rules, conduct bands for term and year).
- Companies, approval groups, approval chains and nodes (demerit chain per company/tree).
- Roles with default_role_level; permissions catalog and role_permissions populated (all permission keys assigned to appropriate roles).
- Infraction catalog (offense_types) with demerits and policy categories.
- Sample users (auth + profiles): cadets, cadet leaders, TAC, commandant, coaches, band, parents; linked to companies/roles.
- Optional: sample demerit reports, appeals, and ledger entries to validate triggers and RPCs.
- Seed must be idempotent and documented so new environments and tests can rely on it.

1. **Foundation (app):** Auth and profile loading; centralized permission helpers; school timezone and time formatting.
2. **Core discipline:** Demerit report CRUD, submission and approval flow, ledger and Green Sheet, appeals (no delete); all backed by seed data for testing.
3. **Roster and admin:** Roster views, bulk assign, archive; admin UI for infractions, chains, terms, and policy config (credits, nuke, conduct).
4. **Reporting and export:** Exemplary list, Tour Sheet, CSV/PDF where needed; unified timestamps.
5. **Email and role-specific surfaces:** Email alerts (Resend); coach/sport page (athlete behavior, report alerts, leave approval); band page (parallel to sport); feedback button; role-based appearance (students see less, leaders more, TACs more).
6. **Parents and leave:** Parent identity, cadet–parent link (TAC/admin), parent ledger view and leave request creation; leave chain and approval.
7. **Expansion:** Work orders, PowerSchool sync, notes on profile, monthly scorecard, notifications, location/trips, 2FA, future iOS/Android—each as its own phase.

---

## Summary

- **Single-school first:** One deployment, one DB, no tenant resolution in code yet; schema and permissions designed so multi-school can be added later.
- **Configurable policies:** Credits, nuke, conduct (term + year), chains per report type—all admin-editable. Policy is informed by the Blue Book (and future editions) but never hard-coded; the book changes often and the system must adapt via config.
- **Roles:** Level for hierarchy; normalized permissions model (permissions catalog + role_permissions junction) for flexible, auditable feature access; clear audit trail and no hard delete of reports.
- **Backend-first, server-secure:** UI has only the authority the database and server grant; every read/write is authorized server-side from session + DB-backed role/permissions; no trust of the client; audit for sensitive operations; security tests for unauthorized access.
- **Business logic location:** All business logic (demerit math, tour/credit calculation, conduct bands, workflow transitions, ledger writes) lives in the app service layer (Domain Service Architecture). DB triggers handle only audit logging and integrity invariants (e.g. `updated_at`). Edge functions handle external integrations only.
- **Build order:** Database (full schema, RLS, triggers, RPCs) → robust seed (policies, roles, chains, sample users, infractions) → application features and tests on top of that foundation.
- **V1 parity plus:** All core discipline features ported; Resend email alerts (decoupled notification pipeline with retry/dead-letter, recipient dimension for multiple recipients per event); coach/sport and band pages; feedback button; role-based appearance; impersonation system; domain events; approval chain versioning (editing creates new version, existing reports stay on old chain); field-level visibility (schema split: notes, internal_notes, commandant_notes); appeal nuke rollback (full term recalculation); report immutability after completion; then leave, parents, SIS, notifications, and reporting in phases. All functions have corresponding tests. Observability (structured logging, Sentry, metrics, backup, reconciliation jobs) and deployment strategy (blue/green, migration lock, rollback, feature flags) defined.

No implementation work is included in this plan; it is the spec from which to derive detailed schemas, API contracts, and ticket-level build plans when you are ready to start development.