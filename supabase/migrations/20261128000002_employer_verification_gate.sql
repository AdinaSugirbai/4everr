-- Add a review trail for employer identity. An employer must be approved before
-- any vacancy can be created, and every vacancy remains subject to moderation.
alter table public.profiles
  add column if not exists company_industry text not null default '',
  add column if not exists company_size text not null default '',
  add column if not exists company_website text not null default '',
  add column if not exists verification_requested_at timestamptz,
  add column if not exists verification_checked_at timestamptz,
  add column if not exists verification_checked_by uuid references public.profiles(id) on delete set null,
  add column if not exists verification_reference text not null default '',
  add column if not exists verification_notes text not null default '';

-- Wrap the profile editor so changing a company's identity always clears an old approval.
do $$
begin
  if to_regprocedure('public.admin_update_profile_details_v1(uuid,text,text,text,text,text,text,text)') is null
     and to_regprocedure('public.admin_update_profile_details(uuid,text,text,text,text,text,text,text)') is not null then
    alter function public.admin_update_profile_details(uuid, text, text, text, text, text, text, text)
      rename to admin_update_profile_details_v1;
  end if;
end; $$;

create or replace function public.admin_update_profile_details(
  target uuid, p_name text, p_phone text, p_city text,
  p_company_name text, p_company_about text, p_contact_phone text, p_bin text
) returns void
language plpgsql security definer set search_path = public as $$
declare before_name text; before_bin text; after_name text; after_bin text;
begin
  if not public.is_site_admin() then raise exception 'Admin access required'; end if;
  select company_name, bin into before_name, before_bin from public.profiles where id = target for update;
  if not found then raise exception 'Profile not found'; end if;
  perform public.admin_update_profile_details_v1(
    target, p_name, p_phone, p_city, p_company_name, p_company_about, p_contact_phone, p_bin
  );
  select company_name, bin into after_name, after_bin from public.profiles where id = target;
  if before_name is distinct from after_name or before_bin is distinct from after_bin then
    update public.profiles set
      verified = false, verification_requested_at = null, verification_checked_at = null,
      verification_checked_by = null, verification_reference = '', verification_notes = ''
    where id = target and role::text = 'EMPLOYER';
    update public.vacancies set company = coalesce(after_name, ''), moderation = 'PENDING'
    where employer_id = target;
  end if;
end; $$;
revoke all on function public.admin_update_profile_details(uuid, text, text, text, text, text, text, text) from public;
revoke all on function public.admin_update_profile_details_v1(uuid, text, text, text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.admin_update_profile_details(uuid, text, text, text, text, text, text, text) to authenticated;

create or replace function public.update_my_company_profile(
  p_name text,
  p_industry text,
  p_city text,
  p_size text,
  p_website text,
  p_about text,
  p_phone text,
  p_bin text
) returns void
language plpgsql security definer set search_path = public as $$
declare
  old_name text;
  old_bin text;
  old_website text;
  changed_identity boolean;
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  if length(trim(coalesce(p_name, ''))) < 2 then raise exception 'Company name must contain at least 2 characters'; end if;
  if length(trim(coalesce(p_industry, ''))) < 2 then raise exception 'Industry is required'; end if;
  if length(trim(coalesce(p_city, ''))) < 2 then raise exception 'City is required'; end if;
  if nullif(trim(coalesce(p_bin, '')), '') is not null and trim(p_bin) !~ '^[0-9]{12}$' then
    raise exception 'БИН 12 саннан тұруы керек|БИН должен состоять из 12 цифр|BIN must contain 12 digits';
  end if;
  if length(trim(coalesce(p_website, ''))) > 200 then raise exception 'Website is too long'; end if;

  select company_name, bin, company_website into old_name, old_bin, old_website
  from public.profiles where id = auth.uid() and role::text = 'EMPLOYER' for update;
  if not found then raise exception 'Employers only'; end if;
  changed_identity := old_name is distinct from nullif(trim(coalesce(p_name, '')), '')
    or old_bin is distinct from nullif(trim(coalesce(p_bin, '')), '')
    or old_website is distinct from trim(coalesce(p_website, ''));

  update public.profiles set
    company_name = trim(p_name),
    company_industry = trim(p_industry),
    city = trim(p_city),
    company_size = trim(coalesce(p_size, '')),
    company_website = trim(coalesce(p_website, '')),
    company_about = trim(coalesce(p_about, '')),
    contact_phone = nullif(trim(coalesce(p_phone, '')), ''),
    bin = nullif(trim(coalesce(p_bin, '')), ''),
    verified = case when changed_identity then false else verified end,
    verification_requested_at = case when changed_identity then null else verification_requested_at end,
    verification_checked_at = case when changed_identity then null else verification_checked_at end,
    verification_checked_by = case when changed_identity then null else verification_checked_by end,
    verification_reference = case when changed_identity then '' else verification_reference end,
    verification_notes = case when changed_identity then '' else verification_notes end
  where id = auth.uid();

  if changed_identity then
    update public.vacancies set company = trim(p_name), moderation = 'PENDING'
    where employer_id = auth.uid();
  end if;

  insert into public.admin_log(action, target_id, details, actor_id)
  values ('UPDATE_COMPANY', auth.uid(), 'Company profile updated', auth.uid());
end; $$;
revoke all on function public.update_my_company_profile(text, text, text, text, text, text, text, text) from public;
grant execute on function public.update_my_company_profile(text, text, text, text, text, text, text, text) to authenticated;

create or replace function public.request_my_employer_verification() returns void
language plpgsql security definer set search_path = public as $$
declare
  current_name text;
  current_bin text;
  current_role text;
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  select company_name, bin, role::text into current_name, current_bin, current_role
  from public.profiles where id = auth.uid() for update;
  if not found or current_role <> 'EMPLOYER' then raise exception 'Employers only'; end if;
  if length(trim(coalesce(current_name, ''))) < 2 then raise exception 'Company details are incomplete'; end if;
  if coalesce(current_bin, '') !~ '^[0-9]{12}$' then raise exception 'A valid 12-digit BIN is required'; end if;
  if exists (select 1 from public.profiles where bin = current_bin and id <> auth.uid()) then raise exception 'This BIN is already linked to another account'; end if;

  update public.profiles set verification_requested_at = now(), verification_notes = ''
  where id = auth.uid() and verified = false;
  if not found then raise exception 'Company is already verified'; end if;
  insert into public.admin_log(action, target_id, details, actor_id)
  values ('REQUEST_EMPLOYER_VERIFICATION', auth.uid(), 'Employer requested company verification', auth.uid());
end; $$;
revoke all on function public.request_my_employer_verification() from public;
grant execute on function public.request_my_employer_verification() to authenticated;

create or replace function public.admin_review_employer(
  target uuid,
  is_verified boolean,
  p_reference text,
  p_notes text
) returns void
language plpgsql security definer set search_path = public as $$
declare
  target_bin text;
  target_name text;
  requested_at timestamptz;
begin
  if not public.is_site_admin() then raise exception 'Admin access required'; end if;
  select bin, company_name, verification_requested_at
    into target_bin, target_name, requested_at
  from public.profiles where id = target and role::text = 'EMPLOYER' for update;
  if not found then raise exception 'Employer not found'; end if;
  if is_verified then
    if requested_at is null then raise exception 'Employer has not requested verification'; end if;
    if length(trim(coalesce(target_name, ''))) < 2 or coalesce(target_bin, '') !~ '^[0-9]{12}$' then raise exception 'Company details are incomplete'; end if;
    if length(trim(coalesce(p_reference, ''))) < 5 then raise exception 'Enter the official source or verification reference'; end if;
  elsif length(trim(coalesce(p_notes, ''))) < 8 then
    raise exception 'Add a reason before rejecting verification';
  end if;

  update public.profiles set
    verified = is_verified,
    verification_checked_at = now(),
    verification_checked_by = auth.uid(),
    verification_reference = case when is_verified then left(trim(p_reference), 500) else '' end,
    verification_notes = left(trim(coalesce(p_notes, '')), 1000)
  where id = target;
  insert into public.admin_log(action, target_id, details, actor_id)
  values (case when is_verified then 'VERIFY_EMPLOYER' else 'REJECT_EMPLOYER' end,
          target,
          left(case when is_verified then trim(p_reference) || ' · ' || trim(coalesce(p_notes, '')) else trim(p_notes) end, 1000),
          auth.uid());
end; $$;
revoke all on function public.admin_review_employer(uuid, boolean, text, text) from public;
grant execute on function public.admin_review_employer(uuid, boolean, text, text) to authenticated;

-- Remove the old one-click verification entry point so it cannot bypass review evidence.
do $$
begin
  if to_regprocedure('public.admin_set_employer_verified(uuid,boolean)') is not null then
    execute 'revoke all on function public.admin_set_employer_verified(uuid, boolean) from public, anon, authenticated';
  end if;
end; $$;

create or replace function public.vacancies_guard() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  current_role text;
  current_verified boolean;
  current_banned boolean;
begin
  if current_setting('app.bypass_guard', true) = '1' or public.is_site_admin() then
    return new;
  end if;
  if auth.uid() is null then raise exception 'Authentication required'; end if;

  select role::text, verified, banned into current_role, current_verified, current_banned
  from public.profiles where id = auth.uid();
  if not found or current_role <> 'EMPLOYER' then raise exception 'Employers only'; end if;
  if coalesce(current_banned, false) then raise exception 'Account is blocked'; end if;
  if not coalesce(current_verified, false) then raise exception 'Company verification is required before posting a vacancy'; end if;

  if tg_op = 'INSERT' then
    new.moderation := 'PENDING';
    new.views := 0;
    new.employer_id := auth.uid();
    select company_name into new.company from public.profiles where id = auth.uid();
  else
    if old.employer_id is distinct from auth.uid() then raise exception 'You can only update your own vacancies'; end if;
    if (new.title, new.city, new.format, new.salary, new.salary_from, new.salary_to, new.level,
        new.direction, new.tags, new.description, new.reqs, new.experience, new.employment,
        new.address, new.questions) is distinct from
       (old.title, old.city, old.format, old.salary, old.salary_from, old.salary_to, old.level,
        old.direction, old.tags, old.description, old.reqs, old.experience, old.employment,
        old.address, old.questions) then
      new.moderation := 'PENDING';
    else
      new.moderation := old.moderation;
    end if;
    new.views := old.views;
    new.employer_id := old.employer_id;
    new.expires_at := old.expires_at;
    new.company := old.company;
  end if;
  return new;
end; $$;

notify pgrst, 'reload schema';
