-- Keep accounts and their application history recoverable instead of deleting rows.
alter table public.profiles
  add column if not exists archived_at timestamptz,
  add column if not exists archived_by uuid references public.profiles(id) on delete set null,
  add column if not exists archive_reason text not null default '';

create table if not exists public.admin_log (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  target_id uuid,
  details text not null default '',
  actor_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.admin_log add column if not exists actor_id uuid references public.profiles(id) on delete set null;
alter table public.admin_log add column if not exists action text not null default 'UNKNOWN';
alter table public.admin_log add column if not exists target_id uuid;
alter table public.admin_log add column if not exists details text not null default '';
alter table public.admin_log add column if not exists created_at timestamptz not null default now();
alter table public.admin_log enable row level security;
grant select on public.admin_log to authenticated;
drop policy if exists "admins read admin log" on public.admin_log;
create policy "admins read admin log" on public.admin_log
  for select to authenticated using (public.is_site_admin());

create or replace function public.admin_update_profile_details(
  target uuid,
  p_name text,
  p_phone text,
  p_city text,
  p_company_name text,
  p_company_about text,
  p_contact_phone text,
  p_bin text
) returns void
language plpgsql security definer set search_path = public as $$
declare current_role text;
begin
  if not public.is_site_admin() then raise exception 'Admin access required'; end if;
  if length(trim(coalesce(p_name, ''))) < 2 then raise exception 'Name must contain at least 2 characters'; end if;
  if nullif(trim(coalesce(p_bin, '')), '') is not null and trim(p_bin) !~ '^[0-9]{12}$' then
    raise exception 'БИН 12 саннан тұруы керек|БИН должен состоять из 12 цифр|BIN must be 12 digits';
  end if;

  select role::text into current_role from public.profiles where id = target for update;
  if not found then raise exception 'Profile not found'; end if;

  update public.profiles set
    name = trim(p_name),
    phone = nullif(trim(coalesce(p_phone, '')), ''),
    city = nullif(trim(coalesce(p_city, '')), ''),
    company_name = case when current_role = 'EMPLOYER' then nullif(trim(coalesce(p_company_name, '')), '') else company_name end,
    company_about = case when current_role = 'EMPLOYER' then coalesce(p_company_about, '') else company_about end,
    contact_phone = case when current_role = 'EMPLOYER' then nullif(trim(coalesce(p_contact_phone, '')), '') else contact_phone end,
    bin = case when current_role = 'EMPLOYER' then nullif(trim(coalesce(p_bin, '')), '') else bin end,
    verified = case
      when current_role = 'EMPLOYER' and (company_name is distinct from nullif(trim(coalesce(p_company_name, '')), '') or bin is distinct from nullif(trim(coalesce(p_bin, '')), '')) then false
      else verified
    end
  where id = target;

  insert into public.admin_log(action, target_id, details, actor_id)
  values ('UPDATE_PROFILE', target, 'Profile details updated', auth.uid());
end; $$;
revoke all on function public.admin_update_profile_details(uuid, text, text, text, text, text, text, text) from public;
grant execute on function public.admin_update_profile_details(uuid, text, text, text, text, text, text, text) to authenticated;

create or replace function public.admin_archive_user(target uuid, reason text) returns void
language plpgsql security definer set search_path = public as $$
declare target_role text;
begin
  if not public.is_site_admin() then raise exception 'Admin access required'; end if;
  if target = auth.uid() then raise exception 'You cannot archive your own account'; end if;
  if length(trim(coalesce(reason, ''))) < 8 then raise exception 'Archive reason must contain at least 8 characters'; end if;
  select role::text into target_role from public.profiles where id = target for update;
  if not found then raise exception 'Profile not found'; end if;
  if target_role = 'ADMIN' then raise exception 'Administrator accounts cannot be archived here'; end if;

  update public.profiles
  set archived_at = coalesce(archived_at, now()), archived_by = auth.uid(),
      archive_reason = left(trim(reason), 500), banned = true
  where id = target;
  insert into public.admin_log(action, target_id, details, actor_id)
  values ('ARCHIVE_USER', target, left(trim(reason), 500), auth.uid());
end; $$;
revoke all on function public.admin_archive_user(uuid, text) from public;
grant execute on function public.admin_archive_user(uuid, text) to authenticated;

create or replace function public.admin_restore_user(target uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_site_admin() then raise exception 'Admin access required'; end if;
  if target = auth.uid() then raise exception 'You cannot restore your own account here'; end if;
  update public.profiles
  set archived_at = null, archived_by = null, archive_reason = '', banned = false
  where id = target and archived_at is not null and role::text <> 'ADMIN';
  if not found then raise exception 'Archived account not found'; end if;
  insert into public.admin_log(action, target_id, details, actor_id)
  values ('RESTORE_USER', target, 'Account restored', auth.uid());
end; $$;
revoke all on function public.admin_restore_user(uuid) from public;
grant execute on function public.admin_restore_user(uuid) to authenticated;

create or replace function public.admin_set_banned(target uuid, is_banned boolean) returns void
language plpgsql security definer set search_path = public as $$
declare target_role text;
begin
  if not public.is_site_admin() then raise exception 'Admin access required'; end if;
  if target = auth.uid() then raise exception 'You cannot change your own account status'; end if;
  select role::text into target_role from public.profiles where id = target for update;
  if not found then raise exception 'Profile not found'; end if;
  if target_role = 'ADMIN' then raise exception 'Administrator accounts cannot be blocked here'; end if;
  update public.profiles set banned = is_banned where id = target and archived_at is null;
  if not found then raise exception 'Archived accounts must be restored from the archive'; end if;
  insert into public.admin_log(action, target_id, details, actor_id)
  values ('SET_BANNED', target, 'banned=' || is_banned, auth.uid());
end; $$;
revoke all on function public.admin_set_banned(uuid, boolean) from public;
grant execute on function public.admin_set_banned(uuid, boolean) to authenticated;

-- Keep any previously installed permanent-delete RPC out of the authenticated API.
do $$
begin
  if to_regprocedure('public.admin_delete_user(uuid)') is not null then
    execute 'revoke all on function public.admin_delete_user(uuid) from public, anon, authenticated';
  end if;
end; $$;

notify pgrst, 'reload schema';
