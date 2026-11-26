# Supabase setup

Apply the SQL migrations in `migrations/` to the Supabase project connected to this app, in filename order. Keep a database backup before applying schema changes to a database that already contains user records.

Paste each migration into the Supabase SQL Editor in filename order. If the Supabase CLI is configured for this project, use `supabase db push` after reviewing the migration list. The migrations add admin editing and audit features, employer identity review and vacancy moderation, and compatible multi-resume/application storage while preserving existing records. The new user archive flow is reversible; it does not hard-delete a profile.

Employer identity verification requires an admin to enter an official verification source before approval. Each vacancy is separately moderated. Resume records are capped at five active resumes per candidate, can be archived, and can be selected individually when applying.
