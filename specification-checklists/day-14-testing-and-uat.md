# Day 14 - Testing and UAT

## Feature / Update Description
Execute regression testing and role-based user acceptance testing across all new features (Days 3–12) and cross-feature boundaries validated in Day 13.

## Why This Is Important
The release must be reliable under real school workflows. UAT verifies correctness, usability, and operational readiness before go-live.

## General Implementation Approach

### User View
- Cadets, faculty, TAC, admins, maintenance managers, and parents run scripted test scenarios.
- Issues are captured and triaged quickly with clear severity.

### Backend Perspective
- Run automated suites (RLS, notifications, role boundaries, historical queries, facilities, parent portal).
- Validate queue/retry behavior and high-volume paths.
- Confirm staging data and migrations are production-ready.

## Completion Checklist

- [ ] Execute RLS regression suite (Day 01 baseline + Days 3–12 new tables) and resolve failures.
- [ ] Execute notification correctness suite (routing, dedupe, preference handling, archive suppression).
- [ ] Execute historical data suite (year switch, conduct snapshots, archived/returner cadets).
- [ ] Execute role-boundary suite for cadet/faculty/TAC/admin/maintenance/parent.
- [ ] Execute category restriction suite (Day 05 API and UI negative cases).
- [ ] Execute work order lifecycle suite (student submit, TAC triage, maintenance portal, inspection auto-create).
- [ ] Execute hallway/inspection suite (occupancy, print, move-in/out comparison, deficiency work orders).
- [ ] Execute special report suite (submit, review, convert, sensitive access controls).
- [ ] Execute parent portal suite (invite, redeem, scoped conduct/history, travel uploads).
- [ ] Execute summary suite (generation, TAC review, parent delivery).
- [ ] Run UAT scripts with representative users for each role.
- [ ] Log and prioritize all defects; fix critical/high severity blockers.
- [ ] Re-run targeted regression after fixes.
- [ ] Confirm rollout checklist, support plan, and communications are prepared.
- [ ] Sign-off criteria: no unresolved blocker defects and all release gates are green.
