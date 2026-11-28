create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.profiles(id),
  title text not null check (char_length(trim(title)) between 2 and 80),
  content jsonb not null,
  is_primary boolean not null default false,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- This migration may follow the older user_id/column-based resume table.
-- Add the newer fields without dropping or replacing any legacy data.
alter table public.resumes
  add column if not exists candidate_id uuid references public.profiles(id),
  add column if not exists title text not null default '',
  add column if not exists content jsonb not null default '{}'::jsonb,
  add column if not exists is_primary boolean not null default false,
  add column if not exists archived_at timestamptz,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='resumes' and column_name='user_id') then
    execute 'update public.resumes set candidate_id = coalesce(candidate_id, user_id) where candidate_id is null';
  end if;
end; $$;

alter table public.resumes enable row level security;

create policy "candidate reads own resumes"
on public.resumes
for select
to authenticated
using (candidate_id = (select auth.uid()));

create policy "candidate creates own resumes"
on public.resumes
for insert
to authenticated
with check (candidate_id = (select auth.uid()));

create policy "candidate updates own resumes"
on public.resumes
for update
to authenticated
using (candidate_id = (select auth.uid()))
with check (candidate_id = (select auth.uid()));

alter table public.applications
  add column if not exists resume_id uuid
  references public.resumes(id);
