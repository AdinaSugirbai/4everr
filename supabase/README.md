# Supabase setup

Apply the SQL migrations in `migrations/` to the Supabase project connected to this app, in filename order. Keep a database backup before applying schema changes to a database that already contains user records.

Paste each migration into the Supabase SQL Editor in filename order. If the Supabase CLI is configured for this project, use `supabase db push` after reviewing the migration list. The migrations add admin editing and audit features, employer identity review and vacancy moderation, and compatible multi-resume/application storage while preserving existing records. The new user archive flow is reversible; it does not hard-delete a profile.

Employer identity verification requires an admin to enter an official verification source before approval. Each vacancy is separately moderated. Resume records are capped at five active resumes per candidate, can be archived, and can be selected individually when applying.

The migrations `20261128000004_auth_profile_sync.sql` and `20261128000005_admin_profile_visibility.sql` synchronize existing and newly registered Supabase Auth accounts into `public.profiles`, and grant the site admin read access to that directory through RLS. Apply these migrations in order from the Supabase Dashboard's SQL Editor (or with the configured Supabase CLI). The sync only inserts missing profile rows; it does not overwrite existing profiles or delete Auth users. New registrations will not appear in the admin directory until these migrations have been applied successfully. Never put a Supabase `service_role` key in browser or `NEXT_PUBLIC_*` environment variables.
