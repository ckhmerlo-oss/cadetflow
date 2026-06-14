# Day 05 - Configurable Stick Category Restrictions

## Feature / Update Description
Restrict cadet report submission to Category 1 by default, reserving Category 2/3 for TAC (or other authorized roles), with school-admin configurable policy.

## Why This Is Important
This enforces discipline policy consistency while preserving admin flexibility to experiment with role authority over time.

## General Implementation Approach

### User View
- Cadets only see allowed category options in submission flows.
- TAC/admin can configure policy and see immediate effect in forms.

### Backend Perspective
- Enforce category permissions server-side independent of UI restrictions.
- Add policy configuration surface and role-mapping controls.
- Audit policy changes and provide rollback-safe behavior.

## Completion Checklist

- [ ] Define policy model for category restrictions by role.
- [ ] Add admin settings UI for restriction configuration.
- [ ] Implement server-side enforcement in report create path.
- [ ] Implement client-side filtering of disallowed categories.
- [ ] Add audit logging for policy changes.
- [ ] Add test cases for role/category combinations.
- [ ] Add negative tests for blocked category submissions.
- [ ] Sign-off criteria: cadets cannot submit disallowed categories even via direct API calls.
