# Day 02 - Big-3 Cadet Oversight Assignments

> **Status:** Implemented. Downstream days consume assignment data and assignment-change events (Days 03–04 notifications, Day 12 summaries).

## Feature / Update Description
Implement automatic cadet oversight assignment for the "Big 3": teachers, in-season coach, and TAC. Also support additional faculty assignment to a cadet (self-assign and admin/TAC assign).

## Why This Is Important
This powers downstream alerting, accountability, and operational visibility. Without reliable assignment ownership, staff notifications and intervention workflows are incomplete.

## General Implementation Approach

### User View
- Cadets have clearly visible assigned adults.
- Faculty can see cadets they are responsible for.
- TAC/admin can add or remove extra faculty assignments.

### Backend Perspective
- Derive Big-3 assignments from term schedule, season/team membership, and company/TAC mapping.
- Store system-derived assignments separately from manual assignments.
- Emit assignment-change events for notification fan-out (consumed by Days 03–04).

## Completion Checklist

- [x] Define assignment data model: system-derived vs manual.
- [x] Implement automatic teacher assignment from current term classes.
- [x] Implement automatic in-season coach assignment from active sports season.
- [x] Implement automatic TAC assignment from cadet company mapping.
- [x] Implement manual add/remove assignment flow with role checks.
- [x] Add assignment history/audit logging.
- [x] Build staff-facing list of "cadets under my oversight."
- [x] Create assignment-change event triggers for notification system.
- [x] Validate reassignment behavior when term/season/company changes.
- [x] Sign-off criteria: all Big-3 and manual assignments are accurate after simulated roster changes.
