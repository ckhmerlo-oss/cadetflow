/*

-- === Example Seeding Script ===

-- 1. Create the Companies (if they don't exist)
INSERT INTO public.companies (company_name)
VALUES ('Band Company')
ON CONFLICT (company_name) DO NOTHING;

-- 2. Create the Approval Groups
-- (This is the chain of command, from bottom to top)
INSERT INTO public.approval_groups (group_name, next_approver_group_id)
VALUES
  -- (Assuming 'Platoon Leader' and 'TAC Officer' groups already exist)
  ('Charlie 1-3 Squad', (SELECT id FROM approval_groups WHERE group_name = 'Platoon Leader')),
  ('Charlie 1st Platoon', (SELECT id FROM approval_groups WHERE group_name = 'TAC Officer')),
  ('Band', (SELECT id FROM approval_groups WHERE group_name = 'TAC Officer')); -- Band reports to TAC

-- 3. Create the new Roles and link them to their Approval Group
INSERT INTO public.roles (company_id, role_name, default_role_level, approval_group_id)
VALUES
  -- Charlie Company Roles
  ((SELECT id FROM companies WHERE company_name = 'Charlie Company'), 'Charlie 1st Plt 3rd Sqd Leader', 20, (SELECT id FROM approval_groups WHERE group_name = 'Charlie 1-3 Squad')),
  ((SELECT id FROM companies WHERE company_name = 'Charlie Company'), 'Charlie 1st Plt 3rd Sqd Member', 10, (SELECT id FROM approval_groups WHERE group_name = 'Charlie 1-3 Squad')),
  ((SELECT id FROM companies WHERE company_name = 'Charlie Company'), 'Charlie 1st Plt Leader', 30, (SELECT id FROM approval_groups WHERE group_name = 'Charlie 1st Platoon')),
  
  -- Band Company Roles
  ((SELECT id FROM companies WHERE company_name = 'Band Company'), 'Band Commander', 40, (SELECT id FROM approval_groups WHERE group_name = 'Band')),
  ((SELECT id FROM companies WHERE company_name = 'Band Company'), 'Band Member', 10, (SELECT id FROM approval_groups WHERE group_name = 'Band'))
ON CONFLICT (company_id, role_name) DO NOTHING;

*/