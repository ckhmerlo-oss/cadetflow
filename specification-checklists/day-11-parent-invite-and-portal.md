# Day 11 - Parent Invite Flow and Parent Portal Baseline

> **Status:** Implemented (2026-06-28). Migration `20260728000001_day11_parent_portal.sql`; portal at `/parent`, portal invites at `/invite/portal/[token]`, legal pages at `/legal/*`. File upload persistence deferred to Day 12.2.

## Feature / Update Description
Enable TAC-generated parent invite links, linked parent account onboarding, and parent portal capabilities (travel requests/doc uploads, conduct view, basic cadet context)—including RLS for parent-link tables deferred from Day 01.

## Why This Is Important
Parent engagement is a core operational requirement for communication and travel processes. Secure linkage and scoped visibility are mandatory. Parent-facing data must respect archival state (Day 06) and historical conduct scope (Day 07).

## General Implementation Approach

### User View
- TAC generates and sends unique invite links (email delivery via Day 04 when enabled).
- Parent creates account and is linked to cadet.
- Parent can submit travel requests/docs and view allowed cadet information (current-term and permitted historical conduct from Day 07).
- **Archived cadets (Day 06 default):** Linked parents retain **read-only historical** conduct, profile context, and previously forwarded summaries. Travel requests and document uploads are **disabled** until the cadet is reactivated. New parent invites for archived-only cadets are blocked or clearly marked historical-only.

### Backend Perspective
- Token-based invite lifecycle (issue, redeem, expire, revoke).
- Parent-cadet linkage model with strict permission boundaries.
- Parent role-specific query surfaces and upload handling.
- **Day 06 integration:** On cadet archive, parent links remain but portal mutations are denied server-side; queries return historical conduct only. On reactivation, restore full linked-cadet actions.
- Apply Day 01 RLS patterns to new parent-link, invite, and portal tables (Day 01 deferred follow-up).
- Emit in-app notifications to TAC on invite redemption and key parent submissions (Day 03); email invites and confirmations (Day 04).

## Completion Checklist

- [x] Define invite token lifecycle and data model (extends `parent_invites` with `portal` purpose).
- [x] Implement TAC/admin invite generation and resend/revoke controls (cadet profile + existing move-in barracks flow).
- [x] Implement parent signup/redemption flow (`/invite/portal/[token]`, legal consent on signup).
- [x] Implement parent-cadet link creation and validation rules (existing `redeem_parent_invite` + links).
- [x] Build parent portal baseline pages and scoped data views (conduct, travel, uploads stub).
- [x] Add travel request submission and document upload support (metadata + form; upload UI stubbed for Day 12.2).
- [x] Add RLS policies for parent-link and portal tables (Day 01 deferred follow-up).
- [x] Integrate historical conduct queries with Day 07 permission scoping (`can_view_cadet_history` parent hook).
- [x] Handle archived cadet linkage per Day 06 rules (read-only historical; no travel/upload until reactivation).
- [ ] Test parent portal after year-close simulation: historical conduct visible, mutations blocked *(Day 13–14 integrated smoke)*.
- [x] Add in-app and email notifications for invite and submission events (Days 03–04).
- [x] Enforce parent role boundaries in all relevant queries/actions (`ParentRouteGuard`, parent nav shell).
- [x] Add tests for invite expiry, invalid token, unauthorized access, and archive boundaries (`27_*`, `28_*`, `29_*` pgTAP).
- [ ] Sign-off criteria: parent can securely onboard and access only linked cadet data/actions; RLS matrix includes parent tables *(closes Day 13–14 UAT)*.

## Implementation Notes

- **Move-in invites (Day 09):** Unchanged entry point on barracks room detail; share redemption and link tables with portal invites.
- **Legal scaffold:** `/legal/terms-of-service`, `/legal/privacy-policy`, `/legal/parent-portal-agreement` — attorney-review placeholders; acceptance recorded in `user_legal_acceptances`.
- **Parent isolation:** Parents redirect to `/parent`; staff/cadet routes blocked via `ParentRouteGuard`.
