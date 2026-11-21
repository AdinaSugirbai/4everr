create table if not exists public.site_assessment_overrides (
  kind text not null check (kind in ('test', 'survey')),
  item_id text not null,
  payload jsonb,
  enabled boolean not null default true,
  updated_at timestamptz not null default now(),
  primary key (kind, item_id)
);

alter table public.site_assessment_overrides enable row level security;
grant select on public.site_assessment_overrides to anon, authenticated;
grant insert, update, delete on public.site_assessment_overrides to authenticated;

drop policy if exists "assessment catalog is public" on public.site_assessment_overrides;
create policy "assessment catalog is public"
  on public.site_assessment_overrides for select to anon, authenticated using (true);

drop policy if exists "admins manage assessments" on public.site_assessment_overrides;
create policy "admins manage assessments"
  on public.site_assessment_overrides for all to authenticated
  using (public.is_site_admin()) with check (public.is_site_admin());
