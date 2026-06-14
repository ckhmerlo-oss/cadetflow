# CadetFlow 2026 Invariants

This document is the non-negotiable contract for CadetFlow implementation and operations.
All roadmap items and code changes in `Implementation.md` MUST comply with these invariants.

---

## 1) Authority, Security, and Access

1. **Server-authorized only**
   - Every read/write MUST be authorized on the server from the authenticated session.
   - The client UI MUST NOT be treated as an authority source for roles, permissions, or scope.

2. **RLS as baseline defense**
   - Sensitive domain tables MUST have RLS enabled with deny-by-default semantics.
   - Mutations that require elevated capability MUST execute through explicitly controlled server paths.

3. **Least privilege by role and assignment**
   - Access MUST be limited by role, company, chain-of-command position, and cadet assignment scope.
   - Parent accounts MUST be limited to linked cadet scope only.

4. **Auditability for sensitive actions**
   - Permission/role changes, approval actions, archives, assignment changes, and policy edits MUST be audited with actor, action, target, and timestamp.
   - Security-sensitive paths MUST be traceable end-to-end.

---

## 2) Administrator Agency and Guardrails

1. **Admin-configurable by default**
   - Policy, workflow, role authority, category restrictions, and notification behavior SHOULD be configurable in Admin UI whenever safe and practical.
   - Code changes are a last resort for policy tuning.

2. **Guardrailed flexibility**
   - Admin controls MUST use safe defaults, validation, and reversible operations.
   - High-impact changes MUST show clear impact context before save.

3. **Progressive complexity**
   - Essential controls MUST be straightforward.
   - Advanced controls SHOULD be available without overwhelming routine administration workflows.

4. **No hidden authority paths**
   - If behavior is configurable, it MUST be visible, documented, and auditable.

---

## 3) Data Lifecycle and Historical Integrity

1. **No hard delete for student history**
   - Reports, ledger history, and archived-year records MUST be retained.
   - Archive/void semantics MUST be used for historical preservation.

2. **Immutable ledger/event records**
   - Financial/disciplinary history records (tour/ED/conduct-impact events) MUST be append-oriented and historically reconstructable.

3. **Year archival and continuity**
   - School years and cadets MUST support bulk archival workflows.
   - Returning cadets MUST retain historical records and support year-by-year view switching.

4. **Historical conduct queryability**
   - Conduct status MUST remain queryable by historical term and year, not only current term state.
   - End-of-term conduct snapshots MUST be stored and referenceable later.

---

## 4) Notification and Communication Integrity

1. **Event-driven notifications**
   - In-app and email notifications MUST derive from explicit domain events (report action, ED placement, conduct drop, assignment changes).

2. **Preference-respecting delivery**
   - Delivery MUST honor global settings, user settings, and per-cadet preferences where applicable.

3. **Deterministic fan-out**
   - Notifications MUST correctly target cadets, submitters, assigned oversight staff, and parents (where linked and eligible).

4. **Idempotent delivery**
   - Notification dispatch MUST avoid duplicate sends during retries or concurrent processing.

---

## 5) Domain Behavior Invariants

1. **Big-3 oversight model**
   - Each cadet MUST have automatically maintained core adult oversight assignments: teachers, in-season coach, TAC.
   - Additional faculty assignment MUST be supported without breaking core assignment automation.

2. **Category control policy**
   - Cadet ability to submit higher-category sticks MUST be policy-controlled and admin-configurable.
   - Default policy for 2026 rollout: cadets limited to Category 1 unless explicitly configured otherwise.

3. **Workflow transparency**
   - Report outcomes (final approval, kick-back, rejection with reason) MUST be visible to appropriate actors and trigger corresponding notifications.

---

## 6) Operational and Release Invariants

1. **Migration safety**
   - Schema changes MUST be migration-driven, reviewable, and reversible where feasible.

2. **Rollout gates required**
   - Releases MUST pass defined gates for RLS behavior, notification correctness, historical query integrity, and role-boundary tests.

3. **Staging validation**
   - Archive/migration/backfill paths MUST be validated in staging before production rollout.

4. **Cross-reference discipline**
   - `Implementation.md` MUST explicitly map implementation tasks and acceptance criteria to these invariants.

---

## 7) Change Control

- Any proposed feature or shortcut that violates an invariant requires explicit documented exception approval.
- Exception approvals MUST include risk, blast radius, mitigation, and rollback steps.
