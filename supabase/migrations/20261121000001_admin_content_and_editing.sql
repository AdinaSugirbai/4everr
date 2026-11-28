create table if not exists public.site_translations (
  source text primary key,
  kk text not null default '',
  ru text not null default '',
  en text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.site_translations enable row level security;

grant select on public.site_translations to anon, authenticated;
grant insert, update, delete on public.site_translations to authenticated;

create or replace function public.is_site_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'ADMIN'
  );
$$;

revoke all on function public.is_site_admin() from public;
grant execute on function public.is_site_admin() to authenticated;

drop policy if exists "site translations are public" on public.site_translations;
create policy "site translations are public"
  on public.site_translations for select to anon, authenticated using (true);

drop policy if exists "admins manage site translations" on public.site_translations;
create policy "admins manage site translations"
  on public.site_translations for all to authenticated
  using (public.is_site_admin()) with check (public.is_site_admin());

create or replace function public.admin_update_profile_name(target uuid, new_name text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_site_admin() then raise exception 'Admin access required'; end if;
  if length(trim(coalesce(new_name, ''))) < 2 then raise exception 'Name must contain at least 2 characters'; end if;
  update public.profiles set name = trim(new_name) where id = target;
  if not found then raise exception 'Profile not found'; end if;
  insert into public.admin_log(action, target_id, details)
  values ('UPDATE_PROFILE', target, 'name=' || trim(new_name));
end;
$$;

revoke all on function public.admin_update_profile_name(uuid, text) from public;
grant execute on function public.admin_update_profile_name(uuid, text) to authenticated;

create or replace function public.admin_update_vacancy(
  target uuid, new_title text, new_company text, new_city text, new_salary text, new_level text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_site_admin() then raise exception 'Admin access required'; end if;
  if length(trim(coalesce(new_title, ''))) = 0 then raise exception 'Vacancy title is required'; end if;
  update public.vacancies
  set title = trim(new_title), company = trim(new_company), city = trim(new_city),
      salary = trim(new_salary), level = trim(new_level)
  where id = target;
  if not found then raise exception 'Vacancy not found'; end if;
  insert into public.admin_log(action, target_id, details)
  values ('UPDATE_VACANCY', target, trim(new_title));
end;
$$;

revoke all on function public.admin_update_vacancy(uuid, text, text, text, text, text) from public;
grant execute on function public.admin_update_vacancy(uuid, text, text, text, text, text) to authenticated;

create or replace function public.admin_delete_application(target uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_site_admin() then raise exception 'Admin access required'; end if;
  delete from public.applications where id = target;
  if not found then raise exception 'Application not found'; end if;
  insert into public.admin_log(action, target_id, details)
  values ('DELETE_APPLICATION', target, null);
end;
$$;

revoke all on function public.admin_delete_application(uuid) from public;
grant execute on function public.admin_delete_application(uuid) to authenticated;
