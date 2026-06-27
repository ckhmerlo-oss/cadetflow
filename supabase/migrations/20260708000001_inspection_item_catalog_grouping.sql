-- Expand move-in/out inspection catalog with section/subsection grouping metadata.

set check_function_bodies = off;

alter table public.room_inspection_item_templates
  add column if not exists section_key text,
  add column if not exists section_label text,
  add column if not exists subsection text;

alter table public.room_inspection_item_templates
  drop constraint if exists room_inspection_item_templates_subsection_check;

alter table public.room_inspection_item_templates
  add constraint room_inspection_item_templates_subsection_check
  check (subsection is null or subsection in ('left', 'right', 'top', 'bottom'));

comment on column public.room_inspection_item_templates.section_key is
  'UI grouping key (e.g. door, desk, bed_locker).';
comment on column public.room_inspection_item_templates.section_label is
  'Human-readable section header in the inspection form.';
comment on column public.room_inspection_item_templates.subsection is
  'Optional Left/Right or Top/Bottom sub-row within a section.';

-- Retire the Day 09 v1 shortened checklist; historical form rows keep their saved item_key values.
update public.room_inspection_item_templates set active = false;

insert into public.room_inspection_item_templates
  (item_key, label, sort_order, section_key, section_label, subsection, active)
values
  ('door_body', 'Body', 10, 'door', 'Door', null, true),
  ('door_magnet', 'Magnet', 20, 'door', 'Door', null, true),
  ('door_glass', 'Glass', 30, 'door', 'Door', null, true),
  ('door_handle', 'Handle', 40, 'door', 'Door', null, true),
  ('door_lock', 'Lock', 50, 'door', 'Door', null, true),
  ('rifle_rack', 'Rifle rack', 60, 'rifle_rack', 'Rifle rack', null, true),
  ('wall_locker', 'Wall locker', 70, 'wall_locker', 'Wall locker', null, true),
  ('desk_top_l', 'Top', 80, 'desk', 'Desk', 'left', true),
  ('bookshelf_l', 'Bookshelf', 90, 'desk', 'Desk', 'left', true),
  ('desk_drawer_l', 'Drawer', 100, 'desk', 'Desk', 'left', true),
  ('desk_top_r', 'Top', 110, 'desk', 'Desk', 'right', true),
  ('bookshelf_r', 'Bookshelf', 120, 'desk', 'Desk', 'right', true),
  ('desk_drawer_r', 'Drawer', 130, 'desk', 'Desk', 'right', true),
  ('desk_spacer_2x6', 'Spacer 2×6', 140, 'desk', 'Desk', null, true),
  ('desk_shelves', 'Shelves', 150, 'desk', 'Desk', null, true),
  ('desk_chair_l', 'Chair', 160, 'desk_chair', 'Desk chair', 'left', true),
  ('desk_chair_r', 'Chair', 170, 'desk_chair', 'Desk chair', 'right', true),
  ('window_blinds', 'Blinds', 180, 'window', 'Window', null, true),
  ('window_lock', 'Lock', 190, 'window', 'Window', null, true),
  ('window_glass', 'Glass', 200, 'window', 'Window', null, true),
  ('window_retainer', 'Retainer', 210, 'window', 'Window', null, true),
  ('window_sill', 'Sill', 220, 'window', 'Window', null, true),
  ('bed_locker_hydraulics_t', 'Hydraulics', 230, 'bed_locker', 'Bed locker', 'top', true),
  ('bed_locker_t', 'Locker', 240, 'bed_locker', 'Bed locker', 'top', true),
  ('mattress_t', 'Mattress', 250, 'bed_locker', 'Bed locker', 'top', true),
  ('bed_locker_handle_t', 'Handle', 260, 'bed_locker', 'Bed locker', 'top', true),
  ('bed_locker_hydraulics_b', 'Hydraulics', 270, 'bed_locker', 'Bed locker', 'bottom', true),
  ('bed_locker_b', 'Locker', 280, 'bed_locker', 'Bed locker', 'bottom', true),
  ('mattress_b', 'Mattress', 290, 'bed_locker', 'Bed locker', 'bottom', true),
  ('crate_under_sink', 'Crate under sink', 300, 'vanity', 'Vanity / sink', null, true),
  ('sink', 'Sink', 310, 'vanity', 'Vanity / sink', null, true),
  ('faucet', 'Faucet', 320, 'vanity', 'Vanity / sink', null, true),
  ('mirror', 'Mirror', 330, 'vanity', 'Vanity / sink', null, true),
  ('medicine_cabinet', 'Medicine cabinet', 340, 'vanity', 'Vanity / sink', null, true),
  ('trash_can', 'Trash can', 350, 'vanity', 'Vanity / sink', null, true),
  ('vents', 'Vents', 360, 'room', 'Room', null, true),
  ('walls', 'Walls', 370, 'room', 'Room', null, true),
  ('floor', 'Floor', 380, 'room', 'Room', null, true),
  ('light_fixture', 'Light fixture', 390, 'room', 'Room', null, true),
  ('other', 'Other', 400, 'room', 'Room', null, true)
on conflict (item_key) do update set
  label = excluded.label,
  sort_order = excluded.sort_order,
  section_key = excluded.section_key,
  section_label = excluded.section_label,
  subsection = excluded.subsection,
  active = excluded.active;
