# Day 09 - Room Status Tracking and TAC Hallway View



> **Status:** Implemented (2026-06-27). Migration `20260705000001_day09_room_inspections.sql`; UI at `/barracks/hallway`, `/barracks/rooms/[id]`, print at `/barracks/hallway/print`.



## Feature / Update Description

Implement room occupancy/status tracking, move-in/move-out inspection forms, and a hallway-oriented TAC view with printable reference output. Deficiencies flagged on inspection forms trigger Day 08 work orders via the shared intake RPC.



## Why This Is Important

TAC operations require quick, spatially organized visibility of cadet room assignments for accountability and response workflows. Move-in/move-out inspections establish condition baselines, support charge/repair decisions, and reduce lost maintenance requests through direct work order handoff.



## General Implementation Approach



### User View

- TAC sees rooms organized by hallway, similar to a hotel layout.

- Archived cadets are excluded from active occupancy by default; historical room/form records remain accessible per Day 06 archive rules.

- TAC can print a clean reference sheet for offline use.

- TACs can generate move-in/move-out inspection forms when cadets move in to or out of rooms. Move-in forms are filled by the moving cadet or the TAC and validated by the TAC; move-out forms are filled by the TAC. Deficiency items (DAM, CLN, FIX, REP, MIS—not INS or N/A) call Day 08's `create_work_order_from_inspection_item` RPC on form save; resulting orders **enter the TAC triage queue** (same as manual cadet submissions) for review before forward to maintenance.

- **Status entry UX:** Each inspection item uses **bubble fill-ins** (INS, DAM, CLN, FIX, REP, MIS, **OTH**, N/A). **OTH** (other) allows a free-form note without triggering a deficiency work order. Per-item notes and form notes appear only when status is not INS or N/A.

- **Grouped item layout:** **Section** = fixture (Desk, Mattress, Chair, Bed locker, Door, …). **Subsection** = Left/Right or Top/Bottom inside that section. Example: *Mattress* → Top | Bottom; *Desk* → Left | Right → Top, Bookshelf, Drawer; shared desk items (Spacer, Shelves) sit below the columns.

- **Photo attachments:** UI scaffolded — up to **10** optional photos at the end of the form with inline error/success messaging.



### Backend Perspective

- **`barracks_rooms`** — Day 08 seeded all room rows. Core columns for Day 09:

  | Column | Description |
  |--------|-------------|
  | `room_number` | Formatted barracks room ID (e.g. `A101`) |
  | `occupant_top_bunk_id` | Current Occupant A (top bunk) |
  | `occupant_bottom_bunk_id` | Current Occupant B (bottom bunk) |
  | `latest_move_in_form_id` | FK → most recent completed move-in form |
  | `latest_move_out_form_id` | FK → most recent completed move-out form |

  Day 09 adds inspection form tables, occupancy management UI, hallway layout, and wires the form FKs once forms exist.

- **Move-in / move-out form tables** — Separate `room_move_in_forms` and `room_move_out_forms` (form type is implied by table, not a boolean on one row). Shared header fields:

  | Field | Move-in | Move-out |
  |-------|---------|----------|
  | Room number | ✓ | ✓ |
  | Inspector (`filled_by_id`) | ✓ | ✓ |
  | Moving cadet (primary subject) | ✓ | ✓ |
  | Moving cadet B (room co-occupant snapshot) | optional header | optional header |
  | Validated by (TAC) | ✓ | — |
  | Completed at, notes | ✓ | ✓ |

  Each form owns many `room_inspection_items` rows (one per checklist leaf).

- Build move-in/move-out inspection forms with the full item catalog below; each leaf item marked **INS** (inspected), **DAM** (damaged), **CLN** (needs cleaning), **FIX** (repair), **REP** (replace), **MIS** (missing), or **N/A** (not assessed).

- On form save, for each item with status ∈ {DAM, CLN, FIX, REP, MIS}, call Day 08 `create_work_order_from_inspection_item` (idempotent per form + item to avoid duplicates on re-save).

- Move-in/out forms are compared by TAC or maintenance when a cadet moves out to determine charges, responsibility, and follow-up work orders.

- Model hallway → room → occupant relationships.

- Ensure room assignment updates propagate quickly to hallway view.

- Integrate archive/returner state so reactivated cadets can be reassigned without losing prior form history.

- **Day 06 year close:** Clear **active** room occupancy and `cadet_profiles.room_number` for archived cadets; retain all move-in/move-out form history. Pre-close reminders (Day 06) flag uncleared occupancy as manual action before execute (`_year_close_cadet_needs_move_out` already wired; completes when `room_move_out_forms` exists).

- Provide print-friendly structured output:

    - Mark main entrance and center stairwell at top and bottom of page; left and right banks of rooms on left and right respectively; center of page holds notes, leadership, etc.

- **Photo attachments:** UI scaffold live (`InspectionPhotoAttach`, `uploadPendingInspectionPhotos`, `listInspectionFormAttachments` in `app/barracks/actions.ts`). Persistence completes when Day 12.2 lands — see [Photo attachments](#photo-attachments-day-122-follow-on).

- Apply Day 01 RLS patterns to room, form, and hallway query surfaces.

### Inspection item catalog

Canonical checklist keyed in `room_inspection_item_templates`. **Section** = UI group header; **Sub** = Left/Right or Top/Bottom row shown on the same line under the section; each **leaf** has its own status bubbles.

| Section | Sub | Leaf items (`item_key` suffix) |
|---------|-----|--------------------------------|
| **Door** | — | Body, Magnet, Glass, Handle, Lock |
| **Rifle rack** | — | Rifle rack |
| **Wall locker** | — | Wall locker |
| **Desk** | Left | Top, Bookshelf, Drawer |
| | Right | Top, Bookshelf, Drawer |
| | — (shared) | Spacer 2×6, Shelves |
| **Desk chair** | Left | Chair |
| | Right | Chair |
| **Window** | — | Blinds, Lock, Glass, Retainer, Sill |
| **Bed locker** | Top | Hydraulics, Locker, Mattress, Handle |
| | Bottom | Hydraulics, Locker, Mattress |
| **Vanity / sink** | — | Crate under sink, Sink, Faucet, Mirror, Medicine cabinet, Trash can |
| **Room** | — | Vents, Walls, Floor, Light fixture, Other |

`room_inspection_item_templates` should store `section_key`, optional `subsection` (`left` \| `right` \| `top` \| `bottom`), `item_key`, `label`, and `sort_order` so the editor can render grouped rows without hard-coding.

> **Implementation note:** Full catalog + grouped UI shipped in migration `20260708000001_inspection_item_catalog_grouping.sql`. Photo bytes persist after Day 12.2.

### Photo attachments (Day 12.2 follow-on)

**Scaffold (done):**

- `app/barracks/lib/inspection-attachments.ts` — mime/size validation, pending photo model, `NEXT_PUBLIC_INSPECTION_PHOTO_UPLOAD` gate.
- `app/barracks/actions.ts` — `uploadPendingInspectionPhotos`, `listInspectionFormAttachments` (stub until `file_assets` exists).
- Form editor: single “Inspection photo” control at the end of the form (after notes) with validation errors and save/upload status messages; on save, calls `uploadPendingInspectionPhotos` after `save_room_inspection_form`.

**Day 12.2 completes:**

- **Form-level:** Attach general room photos (wide shots, overall condition) linked via `file_assets` (`entity_type = room_move_in_form` \| `room_move_out_form`, `purpose = evidence`).
- **Item-level:** Optional photos per `room_inspection_items` row — deferred; v1 uses one form-level photo only.
- **Work orders:** Manual `/submit` and TAC triage forward paths gain the same attach control (Day 08 + Day 12.2); maintenance portal read-only on forwarded attachments.
- Storage path: `general-attachments/work-order/{work_order_id}/…` and `general-attachments/inspection/{form_id}/{item_key}/…`.
- Mime allowlist: images (`jpeg`, `png`, `webp`); max size per Day 12.2 bucket config.



## Day 08 / Day 09 Ownership Split



| Responsibility | Owner | Notes |

|----------------|-------|-------|

| `work_orders` schema, queues, maintenance portal | Day 08 | Done |

| `barracks_rooms` seed + room picker | Day 08 | Done — Day 09 extends with occupancy UI and form FK wiring |

| Inspection form tables (`room_move_in_forms`, `room_move_out_forms`, items) | Day 09 | Done |

| `create_work_order_from_inspection_item` RPC | Day 08 | Done — Day 09 calls on save |

| Deficiency trigger on form save | Day 09 | Done |

| End-to-end handoff test | Day 13 | Validates traceability form → order → TAC queue |



## Completion Checklist



- [x] Define `barracks_rooms` schema with occupancy mapping columns *(Day 08 migration; seed complete)*.

- [x] Wire occupancy management: assign/clear top/bottom bunk occupants; sync `cadet_profiles.room_number`.

- [x] Add inspection form tables and link `latest_move_in_form_id` / `latest_move_out_form_id` on `barracks_rooms`.

- [x] Implement TAC hallway visualization page.

- [x] Add room status indicators and occupancy metadata.

- [x] Add print view with minimal styling and clear ordering (entrance, stairwell, room banks, center notes).

- [x] Add filters (building/hallway/company as needed).

- [x] Build fillable move-in/move-out forms with inspection status codes (INS, DAM, CLN, FIX, REP, MIS, N/A).

- [x] Use bubble fill-ins (single-select status chips) instead of dropdowns for each inspection item.

- [x] Expand inspection templates to full item catalog with section/subsection grouping (Left/Right, Top/Bottom) per table above.

- [x] Scaffold photo attachment UI on forms and items; wire `uploadPendingInspectionPhotos` callback (persistence completes in Day 12.2).

- [ ] Persist inspection photos to `general-attachments` / `file_assets` (Day 12.2).

- [x] Build move-in/move-out form viewing page and comparison logic between the two most recent forms to identify changes.

- [x] Integrate with archive/returner state handling (Day 06) for active occupancy vs historical records.

- [x] On year close: clear bunk occupant refs and cadet room numbers; preserve inspection forms.

- [x] Surface uncleared rooms in Day 06 pre-flight / closeout reminder payload *(helper exists; completes with move-out forms)*.

- [x] On form save, trigger Day 08 `create_work_order_from_inspection_item` for deficiency codes (idempotent; orders land in TAC queue).

- [x] Add permission checks for TAC/admin (and maintenance read where appropriate).

- [x] Add tests for occupancy update propagation and deficiency-to-work-order handoff (RPC called once per item; no duplicate orders on re-save).

- [ ] Sign-off criteria: TAC can open, filter, and print an accurate hallway reference sheet; move-in/out forms can be completed, compared, and generate traceable work orders in the TAC queue end-to-end in staging (full maintenance forward path validated in Day 13).

