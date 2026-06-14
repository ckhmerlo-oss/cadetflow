-- Phase 0: Reconcile schema drift before profile extension split.
-- Codifies columns referenced in app code but missing from migration history.

alter table public.profiles
  add column if not exists archived boolean not null default false;

alter table public.profiles
  add column if not exists is_in_band boolean not null default false;

alter table public.profiles
  add column if not exists extracurriculars jsonb not null default '[]'::jsonb;

alter table public.profiles
  add column if not exists probation_notes text;

alter table public.profiles
  add column if not exists parent_name text;

alter table public.profiles
  add column if not exists parent_email text;

alter table public.profiles
  add column if not exists parent_phone text;

alter table public.profiles
  add column if not exists phone_number text;

create index if not exists idx_profiles_archived on public.profiles (archived);

-- band_details: referenced in app/band and Day-01 RLS but never migrated locally.
create table if not exists public.band_details (
  cadet_id uuid not null,
  instrument text,
  leadership_role text,
  travel_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (cadet_id),
  constraint band_details_cadet_id_fkey
    foreign key (cadet_id) references public.profiles (id) on delete cascade
);

alter table public.band_details enable row level security;

grant select, insert, update, delete on table public.band_details to authenticated;
grant all on table public.band_details to service_role;
