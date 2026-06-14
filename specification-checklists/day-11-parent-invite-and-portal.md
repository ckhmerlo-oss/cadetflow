# Day 11 - Parent Invite Flow and Parent Portal Baseline

## Feature / Update Description
Enable TAC-generated parent invite links, linked parent account onboarding, and parent portal capabilities (travel requests/doc uploads, conduct view, basic cadet context).

## Why This Is Important
Parent engagement is a core operational requirement for communication and travel processes. Secure linkage and scoped visibility are mandatory.

## General Implementation Approach

### User View
- TAC generates and sends unique invite links.
- Parent creates account and is linked to cadet.
- Parent can submit travel requests/docs and view allowed cadet information.

### Backend Perspective
- Token-based invite lifecycle (issue, redeem, expire, revoke).
- Parent-cadet linkage model with strict permission boundaries.
- Parent role-specific query surfaces and upload handling.

## Completion Checklist

- [ ] Define invite token lifecycle and data model.
- [ ] Implement TAC/admin invite generation and resend/revoke controls.
- [ ] Implement parent signup/redemption flow.
- [ ] Implement parent-cadet link creation and validation rules.
- [ ] Build parent portal baseline pages and scoped data views.
- [ ] Add travel request submission and document upload support.
- [ ] Enforce parent role boundaries in all relevant queries/actions.
- [ ] Add tests for invite expiry, invalid token, and unauthorized access.
- [ ] Sign-off criteria: parent can securely onboard and access only linked cadet data/actions.
