# Supabase setup

Before using the admin content editor and the new admin edit/delete actions, apply the migration in `migrations/20261121000001_admin_content_and_editing.sql` to the Supabase project connected to this app.

Paste the migration into the Supabase SQL Editor. If the Supabase CLI is configured for this project, you can also apply it with `supabase db push`. The migration adds a public read-only translation table, restricts edits to authenticated admins, and adds admin-only RPCs for profile names, vacancies, and application deletion.
