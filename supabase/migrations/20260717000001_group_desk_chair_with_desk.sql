-- Group desk chair checklist items under the Desk section (Left/Right columns).

update public.room_inspection_item_templates
set
  section_key = 'desk',
  section_label = 'Desk'
where item_key in ('desk_chair_l', 'desk_chair_r');

comment on column public.room_inspection_item_templates.section_label is
  'Outer fixture group (Desk, Mattress, Bed locker). Desk includes chair per side.';
