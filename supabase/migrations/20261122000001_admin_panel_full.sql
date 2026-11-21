-- Employer verification & company info
alter table public.profiles
  add column if not exists company_name text,
  add column if not exists company_logo text,
  add column if not exists company_about text,
  add column if not exists contact_phone text,
  add column if not exists verified boolean not null default false;

-- Vacancy moderation, expiry, views, IT direction
alter table public.vacancies
  add column if not exists moderation text not null default 'APPROVED' check (moderation in ('PENDING','APPROVED','REJECTED')),
  add column if not exists expires_at timestamptz,
  add column if not exists views integer not null default 0,
  add column if not exists direction text;

-- IT directions
create table if not exists public.it_directions (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text not null default '',
  skills text not null default '',
  materials text not null default '',
  position int not null default 0
);
alter table public.it_directions enable row level security;
grant select on public.it_directions to anon, authenticated;
grant insert, update, delete on public.it_directions to authenticated;
drop policy if exists "directions public" on public.it_directions;
create policy "directions public" on public.it_directions for select to anon, authenticated using (true);
drop policy if exists "admins manage directions" on public.it_directions;
create policy "admins manage directions" on public.it_directions for all to authenticated
  using (public.is_site_admin()) with check (public.is_site_admin());
insert into public.it_directions(name, position) values
  ('Frontend',1),('Backend',2),('UI/UX Design',3),('Data Science',4),
  ('Cybersecurity',5),('Mobile Development',6),('DevOps',7)
on conflict (name) do nothing;

-- Reviews, complaints, suggestions
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  kind text not null default 'REVIEW' check (kind in ('REVIEW','COMPLAINT','SUGGESTION')),
  rating int check (rating between 1 and 5),
  body text not null,
  status text not null default 'VISIBLE' check (status in ('VISIBLE','HIDDEN','RESOLVED')),
  created_at timestamptz not null default now()
);
alter table public.reviews enable row level security;
grant select, insert on public.reviews to authenticated;
grant update, delete on public.reviews to authenticated;
drop policy if exists "reviews visible" on public.reviews;
create policy "reviews visible" on public.reviews for select to authenticated
  using (status = 'VISIBLE' or user_id = auth.uid() or public.is_site_admin());
drop policy if exists "users add reviews" on public.reviews;
create policy "users add reviews" on public.reviews for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "admins manage reviews" on public.reviews;
create policy "admins manage reviews" on public.reviews for all to authenticated
  using (public.is_site_admin()) with check (public.is_site_admin());

-- Site settings (name, logo, notifications)
create table if not exists public.site_settings (
  key text primary key,
  value text not null default ''
);
alter table public.site_settings enable row level security;
grant select on public.site_settings to anon, authenticated;
grant insert, update, delete on public.site_settings to authenticated;
drop policy if exists "settings public" on public.site_settings;
create policy "settings public" on public.site_settings for select to anon, authenticated using (true);
drop policy if exists "admins manage settings" on public.site_settings;
create policy "admins manage settings" on public.site_settings for all to authenticated
  using (public.is_site_admin()) with check (public.is_site_admin());

-- Daily site visits
create table if not exists public.site_visits (
  day date primary key,
  count int not null default 0
);
alter table public.site_visits enable row level security;
grant select on public.site_visits to authenticated;
drop policy if exists "admins read visits" on public.site_visits;
create policy "admins read visits" on public.site_visits for select to authenticated using (public.is_site_admin());

create or replace function public.track_visit() returns void
language sql security definer set search_path = public as $$
  insert into public.site_visits(day, count) values (current_date, 1)
  on conflict (day) do update set count = public.site_visits.count + 1;
$$;
grant execute on function public.track_visit() to anon, authenticated;

create or replace function public.track_vacancy_view(target uuid) returns void
language sql security definer set search_path = public as $$
  update public.vacancies set views = views + 1 where id = target;
$$;
grant execute on function public.track_vacancy_view(uuid) to anon, authenticated;

-- Admin RPCs
create or replace function public.admin_set_employer_verified(target uuid, is_verified boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_site_admin() then raise exception 'Admin access required'; end if;
  update public.profiles set verified = is_verified where id = target and role = 'EMPLOYER';
  if not found then raise exception 'Employer not found'; end if;
  insert into public.admin_log(action, target_id, details) values ('VERIFY_EMPLOYER', target, 'verified=' || is_verified);
end; $$;
grant execute on function public.admin_set_employer_verified(uuid, boolean) to authenticated;

create or replace function public.admin_set_vacancy_moderation(target uuid, new_moderation text, new_expires timestamptz) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_site_admin() then raise exception 'Admin access required'; end if;
  if new_moderation not in ('PENDING','APPROVED','REJECTED') then raise exception 'Bad moderation value'; end if;
  update public.vacancies set moderation = new_moderation, expires_at = new_expires where id = target;
  if not found then raise exception 'Vacancy not found'; end if;
  insert into public.admin_log(action, target_id, details) values ('MODERATE_VACANCY', target, new_moderation);
end; $$;
grant execute on function public.admin_set_vacancy_moderation(uuid, text, timestamptz) to authenticated;
