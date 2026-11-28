-- Align the profile table with the safe archive workflow and permit admins to
-- read the account directory. No delete access is granted by this migration.
alter table public.profiles
  add column if not exists archived_at timestamptz,
  add column if not exists archived_by uuid references public.profiles(id) on delete set null,
  add column if not exists archive_reason text not null default '';

alter table public.profiles enable row level security;
grant select on public.profiles to authenticated;

drop policy if exists "site admins read profile directory" on public.profiles;
create policy "site admins read profile directory"
  on public.profiles
  for select
  to authenticated
  using (public.is_site_admin());

notify pgrst, 'reload schema';
