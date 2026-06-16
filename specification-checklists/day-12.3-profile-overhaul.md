# Day 12.3 - Cadet Profile Overhaul

## Feature / Update Description
Redesign the cadet profile experience (`/profile/[id]`, `ProfileClient`) with profile photos from Day 12.2 storage, clearer information architecture, faster navigation to related records, UI polish and bug fixes, and a visual conduct-standing widget showing current level and progress toward the next threshold. Extend improvements to staff profiles where applicable without blocking cadet delivery.

> **Depends on:** Day 12.2 (avatar storage and signed URL helpers). Integrates with Day 07 year switcher, Day 02 oversight panel, and Day 06 archive visibility rules.

## Why This Is Important
The profile is the hub for cadet identity, discipline context, and staff intervention. Today it uses initials-only avatars, computes conduct status inline from term demerits without progress context, and packs editing, stats, schedule, and audit history into a long scroll with limited cross-links. Cadets and TAC need at-a-glance standing (Satisfactory → Deficient → Unsatisfactory) and one-click paths to ledger, reports, and oversight tools.

## General Implementation Approach

### User View
- **Header:** cadet photo (or initials fallback), rank/name, company, role, contact; prominent conduct badge.
- **Conduct progress:** visual meter for term demerits against school thresholds:
  - **Satisfactory:** 0–59 term demerits (green); show distance to Deficient (60).
  - **Deficient:** 60–99 (orange); show distance to Unsatisfactory (100).
  - **Unsatisfactory:** 100+ (red); show overflow or “at maximum concern” state.
  - Optional secondary indicators: probation status, tour balance, year demerits (existing stats, reorganized).
- **Quick navigation:** sticky or card row linking to Full Ledger (`/ledger/[id]`), recent reports, My Cadets/oversight (staff), parent invite (TAC, Day 11), edit mode — role-gated.
- **Avatar upload:** cadet (own profile) or TAC/admin (managed cadets) can upload/replace photo via Day 12.2 flow; immediate preview after save.
- **Layout:** two-column desktop (summary + details/tabs); single-column mobile with collapsible sections; reduce edit-mode clutter by grouping fields (Identity, Athletics, Contact, Commandant-only).
- **Year/term context:** integrate Day 07 selector when available; conduct widget reflects selected term/year.
- **Staff profiles:** refreshed header and contact block; shared nav patterns; no conduct widget.
- **Parent viewers (Day 11):** read-only profile slice — photo, conduct summary, permitted history — no edit controls or sensitive fields.
- **Archived cadets (Day 06):** banner indicating archived state; read-only; historical year switch still works for authorized viewers.

### Backend Perspective
- Fetch `avatar_file_id` and resolve signed URL server-side in profile page loader (`getProfileById` / `profile-queries.ts`).
- Centralize conduct threshold logic in a shared helper (replace duplicated inline calculation in `page.tsx` and roster) using term demerits from `get_cadet_ledger_stats`.
- Expose conduct progress DTO: `{ status, term_demerits, next_threshold, demerits_to_next, percent_within_band }`.
- Avatar updates call Day 12.2 `set_cadet_avatar` RPC via server action; revalidate profile route.
- Preserve existing edit permissions (commandant for probation/tours, roster managers for demographics, etc.).
- Optional: include thumbnail URL in roster RPC for list views (stretch — can be follow-up in `/manage`).

## Known Issues to Address (Current Profile)

- [ ] Conduct status derived separately in profile page vs `cadet_profiles.conduct_status` — unify source of truth for display.
- [ ] No profile photo support (initials placeholder only).
- [ ] Long single-page scroll with no in-page nav or section anchors.
- [ ] Audit log and schedule/oversight sections lack clear visual hierarchy on mobile.
- [ ] Edit mode exposes commandant-only fields without strong section separation.
- [ ] No quick link to ledger from stats area (user must know URL pattern).

## Completion Checklist

### Data and API
- [ ] Extend profile query to join `avatar_file_id` and resolve signed avatar URL (with fallback null).
- [ ] Add shared `getConductProgress(termDemerits)` helper with thresholds 60 / 100 documented.
- [ ] Server action: `uploadCadetAvatar` wrapping Day 12.2 upload + `set_cadet_avatar`.
- [ ] Server action: `removeCadetAvatar` (soft delete asset, clear FK) with permission checks.

### Conduct Visualization
- [ ] Build `ConductProgressCard` component: status label, color band, progress bar, “X demerits until Deficient/Unsatisfactory” copy.
- [ ] Handle edge cases: exactly 60 or 100 demerits, probation overlay, star tours indicator unchanged.
- [ ] Wire card to selected year/term when Day 07 switcher is present (historical term demerits).

### Profile UI Overhaul
- [ ] Redesign identity header: photo upload control (edit mode / permission gated), responsive layout fixes.
- [ ] Reorganize stats: conduct card primary; term/year demerits and tour balance secondary row.
- [ ] Add quick-action nav row (Ledger, Submit Report if self, Oversight link for assigned faculty, etc.).
- [ ] Tabbed or anchored sections: Overview | Athletics & Activities | Schedule & Oversight | History (audit log).
- [ ] Polish typography, spacing, and dark-mode consistency with design tokens (`bg-card`, `border-border`, semantic status colors).
- [ ] Staff profile: apply header/nav polish without conduct widget.
- [ ] Parent read-only view: hide edit, contact fields per Day 11 policy, show allowed conduct summary + photo.

### Avatar UX
- [ ] Upload: drag-drop or file picker, client-side size/type pre-check matching Day 12.2 allowlist.
- [ ] Crop or center-square guidance (optional v1: accept square-ish images only with CSS `object-cover`).
- [ ] Loading and error states; optimistic UI optional but not required.
- [ ] Roster list avatar thumbnail (stretch goal): small circle next to name on `/manage` using same signed URL pattern.

### Navigation and Fixes
- [ ] Breadcrumb or back link context (from roster, oversight, dashboard).
- [ ] Deep links from profile audit entries to report detail pages (existing `report_id` links verified/working).
- [ ] Mobile: sticky quick nav or compact section jump menu.
- [ ] Fix any broken layout in edit mode (sport selectors, extracurricular SearchableSelect overflow).

### Permissions and Archive
- [ ] Avatar upload: cadet self, TAC/admin with roster manage scope only.
- [ ] Archived cadet: read-only UI, no upload/edit; banner for viewers with level ≥ 90.
- [ ] Verify profile page 404 rules unchanged for unauthorized archived access.

### Testing and Sign-Off
- [ ] Visual regression pass: desktop and mobile for cadet, staff, TAC viewer, parent viewer.
- [ ] Conduct widget matches ledger term demerits for sample cadets at 0, 45, 60, 85, 100+ demerits.
- [ ] Avatar upload/replace/remove round-trip; old storage object soft-deleted per Day 12.2 policy.
- [ ] Year switch (Day 07) updates conduct widget when historical stats available.
- [ ] Sign-off criteria: profile feels like a coherent dashboard hub; cadets see standing progress at a glance; avatars display for users with uploads; no permission regressions vs current profile edit matrix.
