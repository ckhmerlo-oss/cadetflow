# CadetFlow Daily Specification Checklists

This folder contains one specification checklist file per day for the 15-day execution window:

- Days 1–12: Feature epics
- Day 12.1: Onboarding tour fix and expansion (re-enable after completion)
- Day 12.2: Supabase file storage foundation (avatars, attachments, extensible documents)
- Day 12.3: Profile overhaul (avatars, conduct progress, navigation, UI polish) — depends on 12.2
- Day 12.4: In-company TAC configuration (company-scoped submission policy overrides)
- Day 13: Integration and cross-epic cleanup
- Day 14: Testing and UAT
- Day 15: Rollout and post-release verification

**Execution status (2026-06-27):**

| Days | Status |
|------|--------|
| 01–02 | Implemented |
| 03–05 | Implemented (integrated sign-off closes in Days 13–14) |
| 06 | Implemented |
| 07–08 | Implemented; Day 07 staff conduct-list UI deferred to Day 13 |
| **09** | **Current epic — not started** |
| 10–12.4 | Not started |
| 13–15 | Not started |

Deferred Day-01 follow-ups and cross-epic sign-off for Days 3–8 are tracked in Days 13–14—not as new Day-1/2 work.

Each daily file includes:

1. Feature/update description
2. Why it matters
3. Implementation approach (user-facing + backend perspective)
4. Detailed completion checklist

## Cross-Epic Dependencies (Summary)

| Theme | Primary Days | Consumers |
|---|---|---|
| RLS and authorized paths | 01 (done), 03–12, verified in 13 | All features |
| Oversight assignments | 02 (done) | 03–04 notifications, 10 special reports, 12 summaries |
| In-app + email notifications | 03–04 | 05–12 event producers |
| Category restrictions | 05 | Report submission, notification gating |
| Archival / returners | 06 | 03 notifications, 07 history, 09 hallway, 10–12 parent/summary |
| Multi-year history / period queries | 07 | 11 parent portal, 12 summaries |
| Work orders + inspections | 08–09 | 03–04 notifications |
| Special reports | 10 | 03–04 notifications, 06 archive |
| Parent portal | 11 | 04 email, 07 history, 12 summaries |
| Summaries | 12 | 04 email, 11 portal |
| File storage | 12.2 | 10 special reports, 11 parent docs, 12.3 profiles, future 08–09 attachments |
| Profile UX | 12.3 | 07 history, 11 parent view, 12.2 avatars |
| Company TAC configuration | 12.4 | 05 submission policy, unified `/submit`, future 08–10 tabs |

## Day 12 Sub-Epic Order

Within the Day 12 cluster, use this dependency order (do not renumber main days):

1. **12.2** File storage — before 10 attachments, 11 parent docs, 12.3 avatars (Day 10 ships without attachments until 12.2 lands)
2. **12.4** Company TAC config — can parallel with 12.2/12.3
3. **12** Summaries — after 07 + 11
4. **12.3** Profile overhaul — after 12.2
5. **12.1** Onboarding tour — last, after Days 03–12 features exist

## Files

- `day-01-rls-policy-hardening.md` *(implemented)*
- `day-02-big3-assignments.md` *(implemented)*
- `day-03-in-app-notifications-foundation.md` *(implemented)*
- `day-04-email-and-preferences-expansion.md` *(implemented; parent/summary email templates deferred to Days 11–12)*
- `day-05-category-restrictions.md` *(implemented)*
- `day-06-year-archival-lifecycle.md` *(implemented)*
- `day-07-multi-year-history-views.md` *(implemented; staff conduct-list UI deferred to Day 13)*
- `day-08-work-orders-intake-and-triage.md` *(implemented; inspection e2e sign-off in Day 13)*
- `day-09-room-status-and-hallway-view.md` *(current)*
- `day-10-special-reports.md`
- `day-11-parent-invite-and-portal.md`
- `day-12-summary-generation-and-forwarding.md`
- `day-12.1-onboarding-tour-fix-and-expansion.md`
- `day-12.2-supabase-file-storage-foundation.md`
- `day-12.3-profile-overhaul.md`
- `day-12.4-tac-company-configuration.md`
- `day-13-integration-and-data-cleanup.md`
- `day-14-testing-and-uat.md`
- `day-15-rollout-and-monitoring.md`
