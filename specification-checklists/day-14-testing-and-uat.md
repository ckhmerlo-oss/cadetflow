# Day 14 - Testing and UAT

## Feature / Update Description
Execute regression testing and role-based user acceptance testing across all new features and cross-feature boundaries.

## Why This Is Important
The release must be reliable under real school workflows. UAT verifies correctness, usability, and operational readiness before go-live.

## General Implementation Approach

### User View
- Cadets, faculty, TAC, admins, and parents run scripted test scenarios.
- Issues are captured and triaged quickly with clear severity.

### Backend Perspective
- Run automated suites (RLS, notifications, role boundaries, historical queries).
- Validate queue/retry behavior and high-volume paths.
- Confirm staging data and migrations are production-ready.

## Completion Checklist

- [ ] Execute RLS regression suite and resolve failures.
- [ ] Execute notification correctness suite (routing, dedupe, preference handling).
- [ ] Execute historical data suite (year switch, conduct snapshots, archived cadets).
- [ ] Execute role-boundary suite for cadet/faculty/TAC/admin/parent.
- [ ] Run UAT scripts with representative users for each role.
- [ ] Log and prioritize all defects; fix critical/high severity blockers.
- [ ] Re-run targeted regression after fixes.
- [ ] Confirm rollout checklist, support plan, and communications are prepared.
- [ ] Sign-off criteria: no unresolved blocker defects and all release gates are green.
