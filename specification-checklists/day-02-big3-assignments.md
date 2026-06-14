# Day 02 - Big-3 Cadet Oversight Assignments

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
- Emit assignment-change events for notification fan-out.

## Completion Checklist

- [ ] Define assignment data model: system-derived vs manual.
- [ ] Implement automatic teacher assignment from current term classes.
- [ ] Implement automatic in-season coach assignment from active sports season.
- [ ] Implement automatic TAC assignment from cadet company mapping.
- [ ] Implement manual add/remove assignment flow with role checks.
- [ ] Add assignment history/audit logging.
- [ ] Build staff-facing list of "cadets under my oversight."
- [ ] Create assignment-change event triggers for notification system.
- [ ] Validate reassignment behavior when term/season/company changes.
- [ ] Sign-off criteria: all Big-3 and manual assignments are accurate after simulated roster changes.
