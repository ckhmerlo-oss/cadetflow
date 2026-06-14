# Day 09 - Room Status Tracking and TAC Hallway View

## Feature / Update Description
Implement room occupancy/status tracking and a hallway-oriented TAC view with printable reference output.

## Why This Is Important
TAC operations require quick, spatially organized visibility of cadet room assignments for accountability and response workflows.

## General Implementation Approach

### User View
- TAC sees rooms organized by hallway, similar to a hotel layout.
- TAC can print a clean reference sheet for offline use.

### Backend Perspective
- Model hallway -> room -> occupant relationships.
- Ensure room assignment updates propagate quickly to hallway view.
- Provide print-friendly structured output.

## Completion Checklist

- [ ] Define hallway and room data model with occupancy mapping.
- [ ] Implement TAC hallway visualization page.
- [ ] Add room status indicators and occupancy metadata.
- [ ] Add print view with minimal styling and clear ordering.
- [ ] Add filters (building/hallway/company as needed).
- [ ] Integrate with archive/returner state handling.
- [ ] Add permission checks to TAC/admin-only access.
- [ ] Add tests for occupancy update propagation.
- [ ] Sign-off criteria: TAC can open, filter, and print an accurate hallway reference sheet.
