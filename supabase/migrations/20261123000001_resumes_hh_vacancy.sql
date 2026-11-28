-- Resumes (max 5 per user), HeadHunter-style vacancy fields, company BIN, admin user editing
alter table public.profiles add column if not exists phone text, add column if not exists city text, add column if not exists bin text;
create unique index if not exists profiles_bin_unique on public.profiles (bin) where bin is not null and bin <> '';

alter table public.vacancies
  add column if not exists salary_from integer, add column if not exists salary_to integer,
  add column if not exists salary_tax text not null default 'GROSS',
  add column if not exists experience text not null default 'NONE',
  add column if not exists employment text not null default 'FULL',
  add column if not exists address text not null default '',
  add column if not exists questions jsonb not null default '[]';

create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null default '', position text not null default '', city text not null default '',
  phone text not null default '', about text not null default '', education text not null default '',
  photo text not null default '', skills jsonb not null default '[]', salary integer,
  visibility text not null default 'ALL' check (visibility in ('ALL','APPLIED','HIDDEN')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.applications
  add column if not exists resume_id uuid references public.resumes(id) on delete set null,
  add column if not exists answers jsonb not null default '[]';

create or replace function public.resumes_guard() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    if auth.uid() is not null then new.user_id := auth.uid(); end if;
    if (select count(*) from public.resumes where user_id = new.user_id) >= 5 then
      raise exception 'Резюме лимиті: 5|Лимит резюме: 5|Resume limit: 5';
    end if;
  else
    new.user_id := old.user_id;
  end if;
  new.updated_at := now();
  return new;
end; $$;
drop trigger if exists resumes_guard_trg on public.resumes;
create trigger resumes_guard_trg before insert or update on public.resumes for each row execute function public.resumes_guard();

alter table public.resumes enable row level security;
grant select, insert, update, delete on public.resumes to authenticated;
drop policy if exists "resumes owner" on public.resumes;
create policy "resumes owner" on public.resumes for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "resumes employer sees applied" on public.resumes;
create policy "resumes employer sees applied" on public.resumes for select to authenticated
  using (exists (select 1 from public.applications a where a.resume_id = resumes.id and a.employer_id = auth.uid()));
drop policy if exists "resumes admin read" on public.resumes;
create policy "resumes admin read" on public.resumes for select to authenticated using (public.is_site_admin());

-- A candidate can only attach their own resume
create or replace function public.applications_fill() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null then new.candidate_id := auth.uid(); end if;
  select v.employer_id, v.title, v.company into new.employer_id, new.job_title, new.company
    from public.vacancies v where v.id = new.vacancy_id;
  if not found then raise exception 'Vacancy not found'; end if;
  if new.resume_id is not null and not exists
    (select 1 from public.resumes r where r.id = new.resume_id and r.user_id = new.candidate_id) then
    raise exception 'Resume not found';
  end if;
  new.status := 'NEW';
  return new;
end; $$;

-- The company name on a vacancy always comes from the employer's own profile
create or replace function public.vacancies_guard() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if public.is_site_admin() or auth.uid() is null or current_setting('app.bypass_guard', true) = '1' then
    return new;
  end if;
  if tg_op = 'INSERT' then
    new.moderation := 'PENDING'; new.views := 0; new.employer_id := auth.uid();
    select coalesce(nullif(p.company_name, ''), p.name) into new.company from public.profiles p where p.id = auth.uid();
  else
    new.moderation := old.moderation; new.views := old.views; new.employer_id := old.employer_id;
    new.expires_at := old.expires_at; new.company := old.company;
  end if;
  return new;
end; $$;

drop function if exists public.update_my_company(text, text, text, text);
create or replace function public.update_my_company(p_name text, p_logo text, p_about text, p_phone text, p_bin text) returns void
language plpgsql security definer set search_path = public as $$
declare cur text;
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  if coalesce(p_bin, '') <> '' and p_bin !~ '^[0-9]{12}$' then
    raise exception 'БИН 12 саннан тұруы керек|БИН должен состоять из 12 цифр|BIN must be 12 digits';
  end if;
  select company_name into cur from public.profiles where id = auth.uid() and role::text = 'EMPLOYER';
  if not found then raise exception 'Employers only'; end if;
  update public.profiles set company_name = p_name, company_logo = p_logo, company_about = p_about,
    contact_phone = p_phone, bin = nullif(p_bin, ''),
    verified = case when coalesce(cur, '') <> '' and (cur is distinct from p_name or bin is distinct from nullif(p_bin, '')) then false else verified end
  where id = auth.uid();
  perform set_config('app.bypass_guard', '1', true);
  update public.vacancies set company = p_name where employer_id = auth.uid();
end; $$;
grant execute on function public.update_my_company(text, text, text, text, text) to authenticated;

-- Admin can approve only vacancies of verified companies; default life is 30 days
create or replace function public.admin_set_vacancy_moderation(target uuid, new_moderation text, new_expires timestamptz) returns void
language plpgsql security definer set search_path = public as $$
declare emp uuid;
begin
  if not public.is_site_admin() then raise exception 'Admin access required'; end if;
  if new_moderation not in ('PENDING','APPROVED','REJECTED') then raise exception 'Bad moderation value'; end if;
  select employer_id into emp from public.vacancies where id = target;
  if not found then raise exception 'Vacancy not found'; end if;
  if new_moderation = 'APPROVED' and emp is not null
     and not exists (select 1 from public.profiles where id = emp and verified) then
    raise exception 'Компания расталмаған|Компания не подтверждена|Company is not verified';
  end if;
  update public.vacancies set moderation = new_moderation,
    expires_at = case when new_moderation = 'APPROVED' then coalesce(new_expires, now() + interval '30 days') else new_expires end
  where id = target;
  insert into public.admin_log(action, target_id, details) values ('MODERATE_VACANCY', target, new_moderation);
end; $$;
grant execute on function public.admin_set_vacancy_moderation(uuid, text, timestamptz) to authenticated;

create or replace function public.admin_update_user(target uuid, p_name text, p_phone text, p_city text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_site_admin() then raise exception 'Admin access required'; end if;
  update public.profiles set name = p_name, phone = p_phone, city = p_city where id = target;
  if not found then raise exception 'User not found'; end if;
  insert into public.admin_log(action, target_id, details) values ('UPDATE_USER', target, p_name);
end; $$;
grant execute on function public.admin_update_user(uuid, text, text, text) to authenticated;

notify pgrst, 'reload schema';
