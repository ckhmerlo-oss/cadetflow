# Day 12.1 - Onboarding Tour Fix and Expansion

## Feature / Update Description
Repair the existing role-based onboarding tour (`OnboardingTour`, `TourConfig`) so every step anchors to a real, stable DOM target, then expand tour coverage to introduce users to features shipped in Days 03–12 (notifications, preferences, category restrictions, archival, multi-year history, work orders, hallway view, special reports, parent portal, and cadet summaries). Re-enable the tour behind `ONBOARDING_TOUR_ENABLED` when complete.

> **Status:** Tour temporarily disabled (`ONBOARDING_TOUR_ENABLED = false` in `TourConfig.ts`) until this epic is done.

## Why This Is Important
The onboarding tour is the first-run experience for cadets, faculty, TAC, and admins. Broken anchor IDs cause steps to hang or highlight empty space, which erodes trust during rollout. New modules added in Days 03–12 have no guided introduction, so staff and cadets may miss notification controls, oversight workflows, facilities intake, and parent-facing features.

## General Implementation Approach

### User View
- First login (or explicit “Replay tour” from Preferences) launches a step-by-step overlay scoped to the user’s role.
- Each step navigates to the correct page, highlights a visible element, and explains the feature in plain language.
- Mobile users get a centered popover (existing behavior) with targets that exist in both desktop and mobile nav layouts.
- Role-specific tracks:
  - **Level 10 cadets:** personal ledger, year switcher (Day 07), notification bell (Day 03), preferences (Day 04).
  - **Level 15+ cadets:** dashboard action items, report submission with category rules (Day 05), appeals/ledger link.
  - **Level 50+ faculty:** Green Sheet / Tour Sheet, My Cadets / oversight (Day 02), incidents, sports/classes, notification and per-cadet preference overrides (Days 03–04).
  - **TAC / manage roles:** roster management, archive toggle (Day 06), hallway view (Day 09), work order triage (Day 08), special report review (Day 10), parent invites (Day 11), summary review/forward (Day 12).
  - **Maintenance manager:** work order portal queues (Day 08).
  - **Parent role:** portal baseline, linked cadet conduct view, travel/docs (Day 11).
- Users can Skip or Finish; completion persists via `complete_onboarding_tour` RPC (`has_seen_tour` on profile).

### Backend Perspective
- No schema changes required for the tour itself; reuse `profiles.has_seen_tour` and `complete_onboarding_tour`.
- Add optional “reset tour” preference action (client RPC or profile update) so users can replay without admin intervention.
- Tour steps must respect the same role/permission gates as the underlying pages (do not navigate unauthorized users to admin-only routes).
- New `data-tour-id` attributes (preferred over ad-hoc `id`s) on stable UI shells keep anchors resilient to refactors.

## Known Issues to Fix (Current Tour)

- [ ] **Missing DOM targets:** `TourConfig` references elements that do not exist in the app:
  - `dashboard-submit-btn` (dashboard submit link has no id)
  - `nav-signout` (Sign Out lives inside user dropdown with no id)
  - `ledger-header`, `ledger-stats-grid`, `ledger-history-list` (ledger page has no tour anchors)
- [ ] **Roster step mismatch:** tour targets `roster-controls` on `/manage`; verify visibility when roster is paginated/filtered and align with `tour-roster-filters` if that is the intended highlight.
- [ ] **Dropdown-dependent steps:** steps targeting user-menu items (Sign Out, Preferences) must open the dropdown programmatically or use always-visible anchors.
- [ ] **Mobile nav parity:** several targets (`nav-dashboard`, `nav-daily`, etc.) exist only in desktop header; mobile hamburger menu links need matching `data-tour-id`s or mobile-specific step variants.
- [ ] **Infinite retry on missing targets:** `OnboardingTour` polls every 500ms when an element is missing; cap retries and show a fallback “element not found—Skip” state instead of spinning indefinitely.
- [ ] **Route timing:** add a short settle delay after `router.push` before measuring targets to avoid race conditions on slow loads.
- [ ] **Re-enable gate:** flip `ONBOARDING_TOUR_ENABLED` to `true` only after staging sign-off.

## Expansion Checklist (Days 03–12 Features)

### Day 03 – In-App Notifications
- [ ] Add step: notification bell in header (unread marker, open feed).
- [ ] Explain action-required vs informational alerts.

### Day 04 – Email and Preferences
- [ ] Add step: Preferences page (`/preferences`) — global email/in-app toggles, digest settings.
- [ ] Faculty track: per-cadet override section for oversight staff (Day 02 linkage).

### Day 05 – Category Restrictions
- [ ] Add step on unified `/submit` hub (Demerit tab): cadet chain sees Category I only; Company TAC sees full category set.
- [ ] Mention admin-configurable school policy in Admin tab (site admin track only).

### Day 12.4 – Company TAC Configuration
- [ ] TAC track: company settings entry point (`/company/settings`) for submission policy overrides.
- [ ] Explain that TAC can tune cadet-leader incident/category permissions for their company without admin access.

### Day 06 – Archival Lifecycle
- [ ] Add roster step: “Show Archived” toggle and bulk archive entry point (TAC/admin).
- [ ] Note that archived cadets disappear from active operational views.

### Day 07 – Multi-Year History
- [ ] Add ledger/profile steps: year/term switcher and date-ranged historical conduct investigation.
- [ ] Clarify read-only prior-year context for cadets vs staff.

### Day 08 – Work Orders
- [ ] Cadet track: submit work request (barracks vs other, checkbox presets).
- [ ] TAC track: triage queue, forward to maintenance.
- [ ] Maintenance track: portal organization, assign, complete.

### Day 09 – Room Status and Hallway View
- [ ] TAC track: hallway layout, print reference sheet, move-in/move-out forms.
- [ ] Mention deficiency codes that auto-create work orders (Day 08 handoff).

### Day 10 – Special Reports
- [ ] Cadet track: affidavit submission entry point (distinct from standard sticks).
- [ ] TAC track: review queue, event grouping, action outcomes.

### Day 11 – Parent Portal
- [ ] TAC track: generate/resend/revoke parent invite links.
- [ ] Parent track (separate mini-tour on first parent login): linked cadet conduct, travel requests, document uploads.

### Day 12 – Summaries
- [ ] TAC track: draft summary review, edit/approve, forward to parents (email + portal).
- [ ] Parent track: view forwarded summaries in portal.

### Cross-Cutting
- [ ] Add `data-tour-id` registry document or comment block in `TourConfig.ts` mapping step → component owner.
- [ ] Add “Replay tour” control on Preferences page (sets `has_seen_tour = false` or dedicated flag).
- [ ] Role matrix test: level 10, 15, 50, TAC, site admin, maintenance, parent — each sees only permitted steps.
- [ ] Sign-off criteria: full tour completes without missing-target loops on desktop and mobile; new-feature steps appear for the correct roles; `ONBOARDING_TOUR_ENABLED` re-enabled in production after Day 14 UAT pass.
