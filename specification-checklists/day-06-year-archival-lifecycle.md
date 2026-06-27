# Day 06 - School Year and Cadet Archival Lifecycle



## Feature / Update Description

Implement bulk archival for school years and cadets (graduated/non-returning), while preserving historical data and supporting returner lifecycle states. Provide a single guided **Close School Year** workflow for administrators and clear read-only historical access for TAC/faculty after archive.



## Why This Is Important

Year turnover is operationally critical. Without bulk archival and returner handling, data quality degrades and role/roster actions become error-prone. Faculty need prior-year records without hunting through admin-only screens.



## Domain terminology



| Term | Meaning |

|------|---------|

| **Incident report** | Faculty/cadet-leadership filing for behavior out of scope of Category 1 demerits (`incident_reports`). Year close: **auto pull-then-close** (like demerits). |

| **Event** | Organizational container grouping incident reports + special reports + attachments for a significant occurrence. Year close: **carry forward** (Day 10). |

| **Special report** | Cadet affidavit/narrative (Day 10). Requires action; notifications to Commandant, Deputy Commandant, submitter's company TAC. Linked to events. |



## Existing Schema (reuse — do not duplicate)



| Asset | Location | Day 06 usage |

|-------|----------|--------------|

| Cadet `years_attended` | `cadet_profiles.years_attended` → `cadet_profile_view.years_attended` | **First-year cadets start at 0.** Increment +1 on returner reactivation / CSV re-match only. |

| Profile archive flag | `profiles.archived` | Soft-archive cadets |

| School year archive | `academic_terms.archived`, `class_sections.archived`, `cadet_class_enrollments.archived` | Year-scoped academic data (Day 02) |

| Year close RPC | `close_school_year` wraps `archive_school_year` | Extend — do not replace with parallel tables |

| Demerit statuses | `demerit_reports.status` incl. `pulled` | Auto-pull open reports at year close |

| Appeal statuses | `appeals.status` incl. `rejected_final` | Auto-reject open appeals at year close |

| Incidents | `incident_reports` incl. `closed` | Auto-close pending at year close (`school_year_closed`) |

| Oversight | `cadet_oversight_assignments` | Deactivate at year close (Day 02) |



**Do not add** a `cadet_school_years` membership table. Historical year lists for Day 07 derive from enrollments, `demerit_reports.date_of_offense` joined to `academic_terms`, and archived term rows.

> **Day 07 supersession:** A `cadet_conduct_snapshots` stub and `generate_year_conduct_snapshots` were shipped with Day 06 as a placeholder. Day 07 replaces this with date-ranged queries over source records; remove the snapshot table and year-close step when implementing Day 07.



**New columns on existing tables only where needed:**

- `cadet_profiles.role_history` (`jsonb`, default `[]`) — resume entries (role + company); expose via `cadet_profile_view`.

- `cadet_profiles.graduated_at` (`timestamptz`, nullable) — graduated/non-returning tag before year close; shown on profile; cleared on returner reactivation / bulk add.

- `cadet_profiles.departure_classification` (`text`, nullable) — `non_return`, `withdrawn`, `suspended`, or `dismissal`; required on manual archive; year close sets `non_return` on batch archive (preserves existing `withdrawn` / `dismissal`); cleared on reactivation / bulk add.



## General Implementation Approach



### User View



#### Day-to-day archival (mid-year)

- **Commandant/admin (90+):** Archive individual cadets or cohorts from `/manage` or Admin → Archived Users. **Departure classification required** (`withdrawn`, `suspended`, `dismissal`, `non_return`). Append role/company to **role history** on archive.

- **TAC (65+, own company):** Archive company cadets who will not return; cannot close an entire school year.

- **Show Archived** toggle on `/manage` roster tab (admin all; TAC own company). Archived list in Admin settings.



#### Role history (cadet resume)

- On **`role_id` change only**, append entry with **both role and company** at time of change (e.g. "Squad Leader, Charlie Company").

- Also append on archive with reason `archived`.

- Display on profile (Day 12.3). TAC/Commandant/admin may delete entries (audited).



#### Close School Year wizard (admin 90+ only)



Wizard steps at `/admin/year-close`:



1. **Select years + configure next-year terms** — inline 5-term editor satisfies execute gate (reuses `setup_school_year_terms`).

2. **Mark graduated cadets** — searchable checklist; tag only (cadets stay active until execute); **Graduated** badge on profile.

3. **Phase A — Closeout reminders** — preview table of recipients and scoped manual items with links; queue email + in-app to Commandant, Deputy Commandant, TACs, maintenance. UI reports **queued** counts; server auto-drains the email queue after send; scheduled `process-email-queue` edge function drains pending mail in production.

4. **Phase B — Pre-flight** — linked manual blockers; operational cleanup shown as auto-handled.

5. **Execute** — typed confirm → `close_school_year`.



**Phase A — Closeout reminders:** Email + in-app to Commandant, Deputy Commandant, assigned company TACs, maintenance. Per-recipient body includes auto-handled counts and scoped manual items with links to blocking objects. Only the **assigned company TAC** receives move-out-pending room items (Day 09: cadets with room occupancy but no completed move-out form); leadership receives events, special reports, and summary drafts only.



**Pre-flight manual blockers:** open **events**, **special reports**, **uncleared rooms** (move-out pending), **summary drafts** (Day 10/12 stubs until built), **suspended archived cadets** (must be resolved to `non_return` or `dismissal` before close). Wizard shows all counts; reminder links for rooms go to assigned company TACs only.



**Force archive:** Users with the **Admin** role (level **105**, not Commandant at 90) may force-close, bypassing manual blockers; audit records `force_close` and bypassed counts.



**Default term names:** `Term N AYxx-yy` (e.g. `Term 1 AY26-27` for school year `2026-2027`).



**Pre-flight auto-handled:** demerits pulled, appeals rejected, incidents closed, plus **operational cleanup** at execute (tour sheet cleared, probation reset, room assignments cleared). Tours and probation are not manual blockers.



**Informational only:** open work orders (Day 08; not year-scoped).



#### Returner reactivation

- Reactivate from Archived view or CSV email match → `years_attended += 1`, assign role/company, reset operational fields, clear `graduated_at` and `departure_classification`.



### Backend Perspective



#### Year-close actions (`close_school_year`)

1. Auto-pull open demerits; auto-reject open appeals; auto-close pending incidents (`closed`, `school_year_closed`)

2. `archive_school_year` academic data

3. Archive all cadet profiles + role history append; set `departure_classification = non_return` unless already `withdrawn` or `dismissal`

4. Operational cleanup (room, tours, probation) — batch before per-cadet archive

5. Audit to `year_close_audit`

6. Gate on next school year terms configured

> **Removed (Day 07):** ~~Conduct snapshots (Day 07 stub)~~ — historical conduct is queried from source records; snapshot generation is dropped from this job.



**Events** and **special reports** carry-forward/blockers — Day 10 (pre-flight returns 0 until built).



**Work orders:** unchanged; not year-scoped.



#### Role history

- Trigger on `profiles.role_id` change (captures role + company at change time).

- Entry: `{ role_id, role_name, company_id, company_name, school_year, started_at, ended_at, reason }`.



#### Bulk add / returner linking

- New cadets: `years_attended = 0`

- Returner CSV match: reactivate, `years_attended += 1`, clear `graduated_at` and `departure_classification`



## Completion Checklist



### Schema and state

- [x] Document archive model using existing tables above.

- [x] Add `cadet_profiles.role_history` jsonb + update `cadet_profile_view`.

- [x] Add `cadet_profiles.graduated_at` + expose via `cadet_profile_view`.

- [x] Add `cadet_profiles.departure_classification` + expose via `cadet_profile_view`; manual archive requires classification; year close sets `non_return`; suspended resolution pre-flight blocker.

- [x] Incident `closed` status for year-close auto-close.

- [x] Define `can_view_archived_cadet` permission helper.

- [x] Role-history append on `role_id` change and archive; delete RPC with audit.



### Close School Year wizard

- [x] Build wizard: configure terms → graduated tagging → Phase A reminders → Phase B pre-flight → execute.

- [x] Pre-flight manual items with links to blocking objects.

- [x] Closeout reminder preview + per-recipient scoped notifications (email + in-app); honest queued/delivery UI; auto-drain after send + scheduled queue processor.

- [x] In-wizard next-year term configuration.

- [x] `close_school_year` ordered job with idempotency.

- [x] Gate on next school year terms.

- [x] Snapshot stub (superseded by Day 07 date-range queries — remove in Day 07), auto-pull demerits, auto-reject appeals, auto-close incidents.

- [x] Audit actor, scope, counts.



### Roster and reactivation

- [x] `get_full_roster` excludes archived by default; include-archived param; includes `graduated_at`.

- [x] Show Archived toggle; reactivation RPC + CSV re-match clears `graduated_at` and `departure_classification`.

- [x] `get_unassigned_users` excludes archived cadets.

- [x] Consolidate General Settings archive button into wizard.

- [x] Graduated badge on cadet profile; departure classification badges when archived.

- [x] Archived profiles hide faculty self-assign oversight controls.



### Sign-off

- [x] pgTAP year-close simulation; faculty/TAC archived profile access in scope.

