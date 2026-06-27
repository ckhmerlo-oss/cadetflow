-- OTH status + inspection catalog hierarchy (section → Left/Right or Top/Bottom → items).

set check_function_bodies = off;

alter table public.room_inspection_items
  drop constraint if exists room_inspection_items_status_check;

alter table public.room_inspection_items
  add constraint room_inspection_items_status_check
  check (status in ('INS', 'DAM', 'CLN', 'FIX', 'REP', 'MIS', 'OTH', 'N/A'));

comment on column public.room_inspection_item_templates.section_label is
  'Outer fixture group (Desk, Mattress, Chair). Subsections hold Left/Right or Top/Bottom.';

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
  ('desk_chair_l', 'Chair', 160, 'chair', 'Chair', 'left', true),
  ('desk_chair_r', 'Chair', 170, 'chair', 'Chair', 'right', true),
  ('window_blinds', 'Blinds', 180, 'window', 'Window', null, true),
  ('window_lock', 'Lock', 190, 'window', 'Window', null, true),
  ('window_glass', 'Glass', 200, 'window', 'Window', null, true),
  ('window_retainer', 'Retainer', 210, 'window', 'Window', null, true),
  ('window_sill', 'Sill', 220, 'window', 'Window', null, true),
  ('mattress_t', 'Mattress', 230, 'mattress', 'Mattress', 'top', true),
  ('mattress_b', 'Mattress', 240, 'mattress', 'Mattress', 'bottom', true),
  ('bed_locker_hydraulics_t', 'Hydraulics', 250, 'bed_locker', 'Bed locker', 'top', true),
  ('bed_locker_t', 'Locker', 260, 'bed_locker', 'Bed locker', 'top', true),
  ('bed_locker_handle_t', 'Handle', 270, 'bed_locker', 'Bed locker', 'top', true),
  ('bed_locker_hydraulics_b', 'Hydraulics', 280, 'bed_locker', 'Bed locker', 'bottom', true),
  ('bed_locker_b', 'Locker', 290, 'bed_locker', 'Bed locker', 'bottom', true),
  ('crate_under_sink', 'Crate under sink', 300, 'crate_under_sink', 'Crate under sink', null, true),
  ('sink', 'Sink', 310, 'sink', 'Sink', null, true),
  ('faucet', 'Faucet', 320, 'faucet', 'Faucet', null, true),
  ('mirror', 'Mirror', 330, 'mirror', 'Mirror', null, true),
  ('medicine_cabinet', 'Medicine cabinet', 340, 'medicine_cabinet', 'Medicine cabinet', null, true),
  ('trash_can', 'Trash can', 350, 'trash_can', 'Trash can', null, true),
  ('vents', 'Vents', 360, 'vents', 'Vents', null, true),
  ('walls', 'Walls', 370, 'walls', 'Walls', null, true),
  ('floor', 'Floor', 380, 'floor', 'Floor', null, true),
  ('light_fixture', 'Light fixture', 390, 'light_fixture', 'Light fixture', null, true),
  ('other', 'Other', 400, 'other', 'Other', null, true)
on conflict (item_key) do update set
  label = excluded.label,
  sort_order = excluded.sort_order,
  section_key = excluded.section_key,
  section_label = excluded.section_label,
  subsection = excluded.subsection,
  active = excluded.active;
