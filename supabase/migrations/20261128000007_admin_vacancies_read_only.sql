-- The admin UI is read-only for vacancies. Disable the old mutation RPCs so a
-- crafted client request cannot bypass the read-only page.
do $$
declare
  routine record;
begin
  for routine in
    select n.nspname as schema_name,
           p.proname as function_name,
           pg_get_function_identity_arguments(p.oid) as argument_types
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = any(array[
        'admin_update_vacancy',
        'admin_set_vacancy_status',
        'admin_delete_vacancy'
      ])
  loop
    execute format(
      'revoke all on function %I.%I(%s) from public, anon, authenticated',
      routine.schema_name,
      routine.function_name,
      routine.argument_types
    );
  end loop;
end;
$$;

-- Also block direct PostgREST INSERT/UPDATE/DELETE requests by signed-in admins.
-- The SECURITY DEFINER approval/rejection RPC remains available for moderation.
create or replace function public.prevent_admin_vacancy_write()
returns trigger
language plpgsql
set search_path = public, auth
as $$
begin
  if auth.uid() is not null
     and public.is_site_admin()
     and current_user in ('anon', 'authenticated') then
    raise exception 'Vacancies are read-only in the admin panel';
  end if;

  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

revoke all on function public.prevent_admin_vacancy_write() from public, anon, authenticated;
drop trigger if exists prevent_admin_vacancy_write on public.vacancies;
create trigger prevent_admin_vacancy_write
  before insert or update or delete on public.vacancies
  for each row execute function public.prevent_admin_vacancy_write();

notify pgrst, 'reload schema';
