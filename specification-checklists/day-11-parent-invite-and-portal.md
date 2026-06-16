# Day 11 - Parent Invite Flow and Parent Portal Baseline

## Feature / Update Description
Enable TAC-generated parent invite links, linked parent account onboarding, and parent portal capabilities (travel requests/doc uploads, conduct view, basic cadet context)—including RLS for parent-link tables deferred from Day 01.

## Why This Is Important
Parent engagement is a core operational requirement for communication and travel processes. Secure linkage and scoped visibility are mandatory. Parent-facing data must respect archival state (Day 06) and historical conduct scope (Day 07).

## General Implementation Approach

### User View
- TAC generates and sends unique invite links (email delivery via Day 04 when enabled).
- Parent creates account and is linked to cadet.
- Parent can submit travel requests/docs and view allowed cadet information (current-term and permitted historical conduct from Day 07).
- Archived cadet links show historical read-only context or are suppressed per Day 06 policy.

### Backend Perspective
- Token-based invite lifecycle (issue, redeem, expire, revoke).
- Parent-cadet linkage model with strict permission boundaries.
- Parent role-specific query surfaces and upload handling.
- Apply Day 01 RLS patterns to new parent-link, invite, and portal tables (Day 01 deferred follow-up).
- Emit in-app notifications to TAC on invite redemption and key parent submissions (Day 03); email invites and confirmations (Day 04).

## Completion Checklist

- [ ] Define invite token lifecycle and data model.
- [ ] Implement TAC/admin invite generation and resend/revoke controls.
- [ ] Implement parent signup/redemption flow.
- [ ] Implement parent-cadet link creation and validation rules.
- [ ] Build parent portal baseline pages and scoped data views (conduct, travel, uploads).
- [ ] Add travel request submission and document upload support.
- [ ] Add RLS policies for parent-link and portal tables (Day 01 deferred follow-up).
- [ ] Integrate historical conduct queries with Day 07 permission scoping.
- [ ] Handle archived cadet linkage per Day 06 rules.
- [ ] Add in-app and email notifications for invite and submission events (Days 03–04).
- [ ] Enforce parent role boundaries in all relevant queries/actions.
- [ ] Add tests for invite expiry, invalid token, unauthorized access, and archive boundaries.
- [ ] Sign-off criteria: parent can securely onboard and access only linked cadet data/actions; RLS matrix includes parent tables.
