# Day 09 - Room Status Tracking and TAC Hallway View

## Feature / Update Description
Implement room occupancy/status tracking, move-in/move-out inspection forms, and a hallway-oriented TAC view with printable reference output. Deficiencies flagged on inspection forms feed the Day 08 work order workflow.

## Why This Is Important
TAC operations require quick, spatially organized visibility of cadet room assignments for accountability and response workflows. Move-in/move-out inspections establish condition baselines, support charge/repair decisions, and reduce lost maintenance requests through direct work order handoff.

## General Implementation Approach

### User View
- TAC sees rooms organized by hallway, similar to a hotel layout.
- Archived cadets are excluded from active occupancy by default; historical room/form records remain accessible per Day 06 archive rules.
- TAC can print a clean reference sheet for offline use.
- TACs can generate move-in/move-out inspection forms when cadets move in to or out of rooms. Move-in forms are filled by the moving cadet or the TAC and validated by the TAC; move-out forms are filled by the TAC. Deficiency items (DAM, CLN, FIX, REP, MIS) auto-create linked work order requests in Day 08.

### Backend Perspective
- Build table for barracks rooms (Room Number, Current Occupant A (Top Bunk), Current Occupant B (Bottom Bunk), Most Recent Move-In Form, Most Recent Move-Out Form)
- Build table for move-in/move-out forms {all items of inspection can be marked INS (inspected), DAM (damaged), CLN (needs cleaning), FIX (repair), REP (replace), MIS (missing), N/A (not assessed)} (Room Number, Inspector, moving cadet A, Moving cadet B, Move in (T/f), Move out (t/f), Door Body, Door Magnet, Door Glass, Door Handle, Door Lock, Rifle Rack, Wall Locker, Desk Top L, Bookshelf L, desk drawer L, Desk Top R, Bookshelf R, desk drawer R, desk spacer 2x6, desk shelves, desk chair L, Desk Chair R, window blinds, window lock, window glass, window retainer, window sill, bed locker hydraulics T, Bed locker T, Mattress T, Bed Locker Handle T, bed locker hydraulics B, Bed locker B, Mattress B, crate under sink, sink, faucet, mirror, medicine cabinet, trash can, vents, walls, floor, light fixture, other)
- Move-in/out forms are compared by TAC or maintenance when a cadet moves out to determine charges, responsibility, and follow-up work orders.
- Model hallway -> room -> occupant relationships.
- Ensure room assignment updates propagate quickly to hallway view.
- Integrate archive/returner state so reactivated cadets can be reassigned without losing prior form history.
- Provide print-friendly structured output:
    - Mark main entrance and center stairwell at top and bottom of page; left and right banks of rooms on left and right respectively; center of page holds notes, leadership, etc.
- Auto-create Day 08 work orders from deficiency-coded inspection items with traceability back to the source form and room.
- Apply Day 01 RLS patterns to room, form, and hallway query surfaces.


## Completion Checklist

- [ ] Define hallway and room data model with occupancy mapping (room number, top/bottom bunk occupants, latest move-in/out form refs).
- [ ] Implement TAC hallway visualization page.
- [ ] Add room status indicators and occupancy metadata.
- [ ] Add print view with minimal styling and clear ordering (entrance, stairwell, room banks, center notes).
- [ ] Add filters (building/hallway/company as needed).
- [ ] Build fillable move-in/move-out forms with full inspection item set and status codes (INS, DAM, CLN, FIX, REP, MIS, N/A).
- [ ] Build move-in/move-out form viewing page and comparison logic between the two most recent forms to identify changes.
- [ ] Integrate with archive/returner state handling (Day 06) for active occupancy vs historical records.
- [ ] Add work order auto-creation from deficiency items with Day 08 linkage and audit trail.
- [ ] Add permission checks for TAC/admin (and maintenance read where appropriate).
- [ ] Add tests for occupancy update propagation and deficiency-to-work-order handoff.
- [ ] Sign-off criteria: TAC can open, filter, and print an accurate hallway reference sheet; move-in/out forms can be completed, compared, and generate traceable work orders end-to-end in staging.
