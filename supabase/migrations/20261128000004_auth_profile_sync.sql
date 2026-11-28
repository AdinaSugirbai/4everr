-- Keep every Supabase Auth account represented in the app's public profile table.
-- The trigger is intentionally insert-only and never copies credentials or overwrites
-- an existing profile when a user signs in again.
create or replace function public.sync_auth_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  profile_name text;
  profile_role public.profiles.role%type;
  requested_role text;
begin
  profile_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
    nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
    'User'
  );

  requested_role := upper(coalesce(new.raw_user_meta_data ->> 'role', 'CANDIDATE'));
  if requested_role not in ('CANDIDATE', 'EMPLOYER') then
    requested_role := 'CANDIDATE';
  end if;
  -- Resolve a role enum or text column without assuming the live schema's type.
  profile_role := (jsonb_populate_record(
    null::public.profiles,
    jsonb_build_object('role', requested_role)
  )).role;

  insert into public.profiles (id, name, email, role)
  values (new.id, profile_name, new.email, profile_role)
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke all on function public.sync_auth_user_profile() from public, anon, authenticated;

drop trigger if exists sync_auth_user_profile_after_insert on auth.users;
create trigger sync_auth_user_profile_after_insert
  after insert on auth.users
  for each row execute function public.sync_auth_user_profile();

-- Backfill Auth accounts that were created before the sync trigger was installed.
insert into public.profiles (id, name, email, role)
select
  u.id,
  coalesce(
    nullif(trim(u.raw_user_meta_data ->> 'name'), ''),
    nullif(trim(u.raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(u.raw_user_meta_data ->> 'display_name'), ''),
    nullif(split_part(coalesce(u.email, ''), '@', 1), ''),
    'User'
  ),
  u.email,
  (jsonb_populate_record(
    null::public.profiles,
    jsonb_build_object(
      'role', case
        when upper(coalesce(u.raw_user_meta_data ->> 'role', 'CANDIDATE')) in ('CANDIDATE', 'EMPLOYER')
          then upper(coalesce(u.raw_user_meta_data ->> 'role', 'CANDIDATE'))
        else 'CANDIDATE'
      end
    )
  )).role
from auth.users u
on conflict (id) do nothing;

notify pgrst, 'reload schema';
