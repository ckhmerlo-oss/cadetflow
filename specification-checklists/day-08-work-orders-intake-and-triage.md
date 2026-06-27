# Day 08 - Work Orders Intake and TAC Triage



> **Status:** Implemented (2026-07). Inspection-form → work order end-to-end sign-off validated in Day 13 (Day 09 trigger). Integrated staging sign-off closes in Days 13–14.



## Feature / Update Description

Create work order submission for rooms/shared spaces via the unified `/submit` hub, a TAC triage workflow, and a maintenance manager portal for organizing, assigning, and completing forwarded requests. Day 08 owns the work order domain model, intake API, and queues; Day 09 triggers auto-creation from move-in/move-out deficiency items through that API.



## Why This Is Important

Facilities issues directly affect cadet quality of life and dorm operations. Centralized request tracking reduces loss of requests and improves accountability.



## General Implementation Approach



### User View

- Cadets, faculty, and staff submit work requests from `/submit?tab=damage` with room/location and issue details (submit hub gate: role level 15+).

    - **Barracks room issue** — room picker tied to Day 09 barracks rooms; routes to the **TAC of the barracks room's rifle company** (not the submitter's company).

    - **Other issue** — free-text location for shared spaces; routes **directly to the maintenance portal** (`forwarded` on create, skips TAC triage).

    - Barracks room submissions offer pre-made checkbox presets for common issues to streamline submission and review.

- TAC reviews barracks and inspection-sourced requests in a company-scoped triage queue (scoped to `work_orders.company_id` = room company), updates status, and forwards eligible requests to maintenance.

- Site admins (90+) have read-all access across companies, can view aggregate tracking/report pages, and may override status or reassign when operational policy requires it; they do not replace TAC day-to-day triage for own-company queues.

- Forwarded requests land in the maintenance portal, where maintenance managers can organize, assign to staff, attach notes, reassign among maintenance staff, and mark complete. Maintenance does **not** forward orders back to TAC or external parties in v1.

- **Notification channels (Days 03–04):**

    - **In-app:** submitter (if active), assigned company TAC, and maintenance on submission, forward-to-maintenance, assignment, and completion events.

    - **Email:** maintenance managers when a request lands in the maintenance portal (TAC forward **or** other-space submit on create). Other status changes are in-app only unless Day 04 taxonomy is extended later.

- Move-in/move-out inspection deficiencies (Day 09) auto-create linked work order requests that **enter the TAC triage queue first** (same path as manual cadet submissions). TAC forwards to maintenance when ready.

- **Photo attachments (Day 12.2 follow-on):** Cadets and TACs can attach images on manual `/submit` work orders; TAC can add or confirm attachments when forwarding to maintenance; inspection-sourced orders may inherit item-level photos from Day 09 forms. Maintenance portal displays attachments read-only. Uses Day 12.2 `general-attachments` bucket + `file_assets` (`entity_type = work_order`, `purpose = evidence`).

- Company-level enable/disable of the Damage tab is deferred to Day 12.4 (`work_order_enabled`); Day 08 ships with the tab visible to all users who can access `/submit` (role level 15+; school-wide default).



### Backend Perspective

- Build work order domain model and explicit status transitions (`submitted` → `tac_review` → `forwarded` → `assigned` → `completed`; support `cancelled` from TAC/admin).

- **Schema:** `work_orders` with `requester_id`, optional `barracks_room_id` FK to Day 09 `barracks_rooms`, free-text `location` for non-barracks issues, `issue_type`, `priority` (set by TAC on triage or system-default `normal` on auto-create from deficiency code), `status`, `notes`, optional `source_inspection_item_id` / `source_inspection_form_id` for Day 09 linkage. **No `school_year` column** — lifecycle is independent of academic calendar.

- **`barracks_rooms` room numbers:** `{company letter}{floor}{room index}` — hallway positions 1–9 zero-padded (`A101`, `B205`, `C309`); 10+ unpadded (`A110`, `A115`, `D319`). See `format_barracks_room_number()`.

- **`work_orders.company_id`:** rifle company of the **barracks room** for barracks/inspection orders (`get_barracks_room_company_id()`); `null` for **other** (maintenance-only).

- **`create_work_order` intake:** role level 15+ (cadets, faculty, staff); barracks → `submitted` + TAC notify; other → `forwarded` + maintenance notify on create.

- Add role-scoped queue views: TAC (own company), maintenance (`role_name` matching existing Day 06 pattern, e.g. `%maintenance%`), admin read-all.

- Track forwarding, assignment, and completion actions in an audit log.

- **Operational queues** (TAC triage, maintenance portal) are distinct from **aggregate tracking/report pages** (filters, exports, open-order counts by status/location)—both are in scope.

- Expose `create_work_order_from_inspection_item(...)` RPC/API for Day 09 to call on save when item status ∈ {DAM, CLN, FIX, REP, MIS}; idempotent per form item to prevent duplicate orders on re-save.

- Register Day 03/04 event codes: `workorder.submitted`, `workorder.forwarded`, `workorder.assigned`, `workorder.completed` (extend existing seeded types where needed).

- Suppress in-app/email fan-out to **archived requesters** per Day 03/04 archive rules; TAC and maintenance still receive actionable notifications.

- Apply Day 01 RLS patterns to work order tables and maintenance portal queries.

- **Day 06 archive integration:** Work orders are **not** tied to `school_year`, are **never** archived or auto-closed by year close, and remain open in maintenance queues across year boundaries. Wire real `open_work_orders` count into `get_year_close_preflight` informational payload (replacing the current `0` stub). Closeout reminder emails list open orders for maintenance awareness only. Requester may be an archived cadet; order stays actionable until maintenance completes it.



## Day 08 / Day 09 Ownership Split



| Responsibility | Owner | Notes |

|----------------|-------|-------|

| `work_orders` schema, status model, audit log | Day 08 | Includes optional inspection linkage columns |

| `barracks_rooms` table seed + room picker data | Day 08 | Schema/columns for occupancy and form refs exist; Day 09 owns occupancy UI, forms, and hallway view |

| `create_work_order_from_inspection_item` RPC | Day 08 | Called by Day 09 form save |

| Trigger on inspection form save (DAM/CLN/FIX/REP/MIS) | Day 09 | Idempotent; lands in TAC queue |

| End-to-end deficiency → work order validation | Day 13 | Cross-epic smoke |



## Implemented (Key Artifacts)



- Migration: `supabase/migrations/20260701000001_day08_work_orders.sql` (+ routing/format follow-ons)

- Submit: `app/submit/components/SubmitWorkOrderForm.tsx`

- Queues: `app/work-orders/`, `app/maintenance/`, `app/work-orders/tracking/`

- pgTAP: `supabase/tests/database/24_day08_work_orders.sql`



## Completion Checklist



- [x] Define `work_orders` schema and audit log (`requester_id`, `barracks_room_id` FK, `location`, `issue_type`, `priority`, `status`, `notes`, optional inspection linkage). **No `school_year` column**.

- [x] Implement `create_work_order_from_inspection_item` RPC (idempotent; for Day 09 trigger).

- [x] Wire `/submit?tab=damage`: replace coming-soon tab with student form (barracks/other branching, checkbox presets, validation).

- [x] Build TAC triage queue with company scope, filters, and status controls (including priority on triage).

- [x] Build Work Order Request details page with role-appropriate actions and status tracking.

- [x] Add forward-to-maintenance action path with audit entries.

- [x] Build maintenance portal; grant access via existing maintenance role pattern (align with Day 06 closeout recipient routing).

- [x] Build maintenance portal actions: organize, assign/reassign among maintenance staff, notes, mark complete (no forward-to-TAC in v1).

- [x] Build aggregate tracking/report pages for TAC/admin/maintenance (distinct from operational queues).

- [x] Register notification events and fan-out: `workorder.submitted`, `workorder.forwarded`, `workorder.assigned`, `workorder.completed` (Days 03–04); email on portal intake only.

- [x] Wire `open_work_orders` count into Day 06 preflight/reminder informational payload.

- [x] Add RLS policies and permission checks for each state transition (Day 01 pattern).

- [x] Add tests for request lifecycle, unauthorized transitions, and archived-requester notification suppression.

- [x] Validate year-close behavior: open work orders persist unchanged after Day 06 Close School Year simulation; preflight shows real open count.

- [ ] Add work-order photo attachments on submit, triage forward, and maintenance detail (reuse Day 12.2 upload pattern from Day 09 `uploadPendingInspectionPhotos`; inherit inspection item photos on forward when present).

- [ ] Sign-off criteria: manual submissions from `/submit`, inspection-created orders (via Day 09 trigger), TAC triage, maintenance portal completion, and aggregate views work end-to-end in staging; open orders survive year turnover *(inspection path completes in Day 13; full staging sign-off in Day 13–14)*.

