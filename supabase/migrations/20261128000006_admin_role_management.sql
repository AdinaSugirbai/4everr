-- Only a site admin may change candidate/employer roles. Admin roles are not
-- assignable through this endpoint, and employers must be re-verified afterward.
create or replace function public.admin_set_role(target uuid, new_role text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_role text;
  next_role public.profiles.role%type;
  target_archived timestamptz;
  target_banned boolean;
begin
  if not public.is_site_admin() then raise exception 'Admin access required'; end if;
  if target = auth.uid() then raise exception 'You cannot change your own role'; end if;
  if upper(coalesce(new_role, '')) not in ('CANDIDATE', 'EMPLOYER') then
    raise exception 'Only candidate and employer roles can be assigned here';
  end if;

  select role::text, archived_at, banned
    into current_role, target_archived, target_banned
  from public.profiles
  where id = target
  for update;
  if not found then raise exception 'Profile not found'; end if;
  if current_role = 'ADMIN' then raise exception 'Administrator roles cannot be changed here'; end if;
  if target_archived is not null or coalesce(target_banned, false) then
    raise exception 'Restore and unblock the account before changing its role';
  end if;
  if current_role = upper(new_role) then return; end if;

  next_role := (jsonb_populate_record(
    null::public.profiles,
    jsonb_build_object('role', upper(new_role))
  )).role;

  update public.profiles
  set role = next_role,
      verified = false,
      verification_requested_at = null,
      verification_checked_at = null,
      verification_checked_by = null,
      verification_reference = '',
      verification_notes = ''
  where id = target;

  -- Preserve vacancy/application history but keep old employer listings out of public search.
  update public.vacancies
  set moderation = case when upper(new_role) = 'EMPLOYER' then 'PENDING' else 'REJECTED' end
  where employer_id = target;

  insert into public.admin_log(action, target_id, details, actor_id)
  values ('CHANGE_USER_ROLE', target, current_role || ' -> ' || upper(new_role), auth.uid());
end;
$$;

revoke all on function public.admin_set_role(uuid, text) from public, anon;
grant execute on function public.admin_set_role(uuid, text) to authenticated;

notify pgrst, 'reload schema';
