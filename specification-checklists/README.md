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

**Execution status:** Days 1–2 (RLS hardening, Big-3 assignments) are implemented. Deferred Day-01 follow-ups and any cleanup from those epics are tracked in Days 3–13—not as new Day-1/2 work.

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
| Multi-year history | 07 | 11 parent portal, 12 summaries |
| Work orders + inspections | 08–09 | 03–04 notifications |
| Special reports | 10 | 03–04 notifications, 06 archive |
| Parent portal | 11 | 04 email, 07 history, 12 summaries |
| Summaries | 12 | 04 email, 11 portal |
| File storage | 12.2 | 10 special reports, 11 parent docs, 12.3 profiles, future 08–09 attachments |
| Profile UX | 12.3 | 07 history, 11 parent view, 12.2 avatars |
| Company TAC configuration | 12.4 | 05 submission policy, unified `/submit`, future 08–10 tabs |

## Files

- `day-01-rls-policy-hardening.md` *(implemented)*
- `day-02-big3-assignments.md` *(implemented)*
- `day-03-in-app-notifications-foundation.md`
- `day-04-email-and-preferences-expansion.md`
- `day-05-category-restrictions.md`
- `day-06-year-archival-lifecycle.md`
- `day-07-multi-year-history-views.md`
- `day-08-work-orders-intake-and-triage.md`
- `day-09-room-status-and-hallway-view.md`
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
