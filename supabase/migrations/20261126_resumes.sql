create table public.resumes (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.profiles(id),
  title text not null check (char_length(trim(title)) between 2 and 80),
  content jsonb not null,
  is_primary boolean not null default false,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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
