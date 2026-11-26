-- Normalize both resume layouts that have existed in this project without
-- deleting old columns or records. Legacy rows remain editable and readable.
alter table public.resumes
  add column if not exists user_id uuid references public.profiles(id) on delete cascade,
  add column if not exists candidate_id uuid references public.profiles(id) on delete cascade,
  add column if not exists title text not null default '',
  add column if not exists content jsonb not null default '{}'::jsonb,
  add column if not exists is_primary boolean not null default false,
  add column if not exists archived_at timestamptz,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

update public.resumes
set candidate_id = coalesce(candidate_id, user_id), user_id = coalesce(user_id, candidate_id)
where candidate_id is null or user_id is null;

with ranked as (
  select id, row_number() over (partition by candidate_id order by updated_at desc, created_at desc, id) as n
  from public.resumes where is_primary and archived_at is null
)
update public.resumes r set is_primary = false from ranked x where x.id = r.id and x.n > 1;

alter table public.resumes alter column candidate_id set not null;
alter table public.resumes alter column user_id set not null;
create index if not exists resumes_candidate_active_idx on public.resumes(candidate_id, updated_at desc) where archived_at is null;
create unique index if not exists resumes_one_primary_per_candidate on public.resumes(candidate_id) where is_primary and archived_at is null;

-- Old installs store resume fields in columns. Copy those values into the
-- current JSON document while keeping the source columns intact.
do $$
begin
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='resumes' and column_name='position') then
    execute $q$update public.resumes set content = jsonb_build_object(
      'position', coalesce(position, ''), 'city', coalesce(city, ''), 'phone', coalesce(phone, ''),
      'about', coalesce(about, ''), 'education', coalesce(education, ''), 'photo', coalesce(photo, ''),
      'skills', coalesce(skills, '[]'::jsonb)
    ) where content = '{}'::jsonb$q$;
    execute $q$update public.resumes set title = coalesce(nullif(title, ''), nullif(position, ''), 'Резюме') where title = ''$q$;
  end if;
end; $$;

alter table public.applications
  add column if not exists job_id uuid references public.vacancies(id) on delete cascade,
  add column if not exists vacancy_id uuid references public.vacancies(id) on delete cascade,
  add column if not exists resume_id uuid references public.resumes(id) on delete set null,
  add column if not exists letter text not null default '';

do $$
begin
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='applications' and column_name='vacancy_id') then
    update public.applications set job_id = coalesce(job_id, vacancy_id), vacancy_id = coalesce(vacancy_id, job_id)
      where job_id is null or vacancy_id is null;
  end if;
end; $$;

create or replace function public.resumes_guard() returns trigger
language plpgsql security definer set search_path = public as $$
declare active_count integer;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if tg_op = 'INSERT' then
    new.candidate_id := auth.uid(); new.user_id := auth.uid();
    perform 1 from public.profiles where id = auth.uid() for update;
    select count(*) into active_count from public.resumes where candidate_id = auth.uid() and archived_at is null;
    if active_count >= 5 then raise exception 'Резюме саны 5-тен аспауы керек'; end if;
    if not exists(select 1 from public.resumes where candidate_id = auth.uid() and archived_at is null) then new.is_primary := true; end if;
  else
    if old.candidate_id <> auth.uid() or old.user_id <> auth.uid() then raise exception 'Resume owner mismatch'; end if;
    new.candidate_id := old.candidate_id; new.user_id := old.user_id;
  end if;
  new.updated_at := now();
  if new.archived_at is not null then new.is_primary := false; end if;
  return new;
end; $$;
drop trigger if exists resumes_guard_trg on public.resumes;
create trigger resumes_guard_trg before insert or update on public.resumes for each row execute function public.resumes_guard();

alter table public.resumes enable row level security;
revoke delete on public.resumes from authenticated;
grant select, insert, update on public.resumes to authenticated;
drop policy if exists "resumes owner" on public.resumes;
drop policy if exists "candidate reads own resumes" on public.resumes;
drop policy if exists "candidate creates own resumes" on public.resumes;
drop policy if exists "candidate updates own resumes" on public.resumes;
create policy "candidate reads own resumes" on public.resumes for select to authenticated using (candidate_id = auth.uid());
create policy "candidate creates own resumes" on public.resumes for insert to authenticated with check (candidate_id = auth.uid());
create policy "candidate updates own resumes" on public.resumes for update to authenticated using (candidate_id = auth.uid()) with check (candidate_id = auth.uid());
drop policy if exists "resumes employer sees applied" on public.resumes;
create policy "resumes employer sees applied" on public.resumes for select to authenticated
  using (exists (select 1 from public.applications a where a.resume_id = resumes.id and a.employer_id = auth.uid()));
drop policy if exists "resumes admin read" on public.resumes;
create policy "resumes admin read" on public.resumes for select to authenticated using (public.is_site_admin());

create or replace function public.set_primary_resume(target uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  perform 1 from public.profiles where id = auth.uid() for update;
  if not exists(select 1 from public.resumes where id = target and candidate_id = auth.uid() and archived_at is null) then
    raise exception 'Active resume not found';
  end if;
  update public.resumes set is_primary = false where candidate_id = auth.uid() and archived_at is null and is_primary;
  update public.resumes set is_primary = true where id = target and candidate_id = auth.uid() and archived_at is null;
end; $$;
revoke all on function public.set_primary_resume(uuid) from public;
grant execute on function public.set_primary_resume(uuid) to authenticated;

create or replace function public.applications_fill() returns trigger
language plpgsql security definer set search_path = public as $$
declare vacancy public.vacancies%rowtype;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  new.candidate_id := auth.uid();
  new.vacancy_id := coalesce(new.job_id, new.vacancy_id);
  new.job_id := new.vacancy_id;
  select * into vacancy from public.vacancies where id = new.vacancy_id for share;
  if not found or vacancy.status <> 'ACTIVE' or vacancy.moderation <> 'APPROVED'
    or (vacancy.expires_at is not null and vacancy.expires_at < now()) then
    raise exception 'Vacancy is not open for applications';
  end if;
  if vacancy.employer_id = auth.uid() then raise exception 'Employers cannot apply to their own vacancy'; end if;
  if not exists(select 1 from public.profiles where id = auth.uid() and role::text = 'CANDIDATE' and not coalesce(banned, false)) then
    raise exception 'Only active candidate accounts can apply';
  end if;
  if exists(select 1 from public.applications where candidate_id = auth.uid() and job_id = vacancy.id) then
    raise exception 'You have already applied to this vacancy';
  end if;
  if new.resume_id is null or not exists(
    select 1 from public.resumes r where r.id = new.resume_id and r.candidate_id = auth.uid() and r.archived_at is null
  ) then raise exception 'Choose one of your active resumes'; end if;
  new.employer_id := vacancy.employer_id;
  new.job_title := vacancy.title;
  new.company := vacancy.company;
  new.status := 'NEW';
  new.created_at := coalesce(new.created_at, now());
  return new;
end; $$;
drop trigger if exists applications_fill_trg on public.applications;
create trigger applications_fill_trg before insert on public.applications for each row execute function public.applications_fill();

notify pgrst, 'reload schema';
