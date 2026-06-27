-- Rename shared desk shelves item to match barracks terminology.

update public.room_inspection_item_templates
set label = 'Center Shelves'
where item_key = 'desk_shelves';
