-- ============================================================================
-- TrueBreeds — Row-Level Security policies
--
-- Run this AFTER `prisma migrate deploy` / `prisma db push` has created the
-- tables. Apply via:
--
--   npx prisma db execute --file prisma/rls.sql --schema prisma/schema.prisma
--
-- or paste into the Supabase SQL editor.
--
-- Context
-- -------
-- The Next.js app reads/writes Postgres only via Prisma (DATABASE_URL).
-- Supabase Auth / Storage are used separately. Supabase still grants the
-- `anon` and `authenticated` PostgREST roles broad table privileges by
-- default — without RLS, anyone with the project URL + anon key can
-- read/edit/delete every row (including `users.email`).
--
-- Enabling RLS here closes that API surface. The `postgres` role used by
-- Prisma typically has BYPASSRLS, so the app keeps working. For a
-- non-bypass application role, set `app.tenant_id` per request via
-- `withTenantRls` in src/lib/db.ts.
--
-- Note: Prisma maps String IDs to Postgres `text`, so policies compare text
-- (not uuid) against `current_setting('app.tenant_id')`.
--
-- Optional hardened app role (recommended for production):
--
--   CREATE ROLE app_user LOGIN PASSWORD '...';
--   GRANT USAGE ON SCHEMA public TO app_user;
--   GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
--   ALTER DEFAULT PRIVILEGES IN SCHEMA public
--     GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user;
--
-- Then point DATABASE_URL at `app_user`.
-- ============================================================================

-- Tenant-scoped tables: isolation via session GUC app.tenant_id.
-- Unset / empty GUC → null → policy fails closed for anon/authenticated.
do $$
declare
  t text;
  tenant_tables text[] := array[
    'tenant_members', 'tenant_invites', 'animals', 'litters', 'offspring',
    'media', 'leads', 'waitlist_entries', 'testimonials', 'faq_items',
    'platform_subscriptions', 'billing_email_logs', 'stripe_connect_accounts', 'deposits',
    'balance_invoices', 'amazon_settings', 'affiliate_products',
    'affiliate_clicks', 'social_connections', 'social_posts',
    'analytics_events', 'onboarding_progress'
  ];
begin
  foreach t in array tenant_tables loop
    execute format('alter table %I enable row level security;', t);
    execute format('drop policy if exists tenant_isolation on %I;', t);
    execute format(
      $p$create policy tenant_isolation on %I
        using (
          "tenantId" = nullif(current_setting('app.tenant_id', true), '')
        )
        with check (
          "tenantId" = nullif(current_setting('app.tenant_id', true), '')
        );$p$,
      t
    );
  end loop;
end $$;

-- lead_notes and social_post_targets are scoped indirectly through their
-- parent (lead / social_post), so isolate via a join-based policy instead.
alter table lead_notes enable row level security;
drop policy if exists tenant_isolation on lead_notes;
create policy tenant_isolation on lead_notes
  using (exists (
    select 1 from leads
    where leads.id = lead_notes."leadId"
      and leads."tenantId" = nullif(current_setting('app.tenant_id', true), '')
  ))
  with check (exists (
    select 1 from leads
    where leads.id = lead_notes."leadId"
      and leads."tenantId" = nullif(current_setting('app.tenant_id', true), '')
  ));

alter table social_post_targets enable row level security;
drop policy if exists tenant_isolation on social_post_targets;
create policy tenant_isolation on social_post_targets
  using (exists (
    select 1 from social_posts
    where social_posts.id = social_post_targets."postId"
      and social_posts."tenantId" = nullif(current_setting('app.tenant_id', true), '')
  ))
  with check (exists (
    select 1 from social_posts
    where social_posts.id = social_post_targets."postId"
      and social_posts."tenantId" = nullif(current_setting('app.tenant_id', true), '')
  ));

-- tenants: writable only for the active tenant session. No open SELECT for
-- anon — public sites load tenant rows through Prisma (bypass), not PostgREST.
alter table tenants enable row level security;
drop policy if exists tenants_read on tenants;
drop policy if exists tenants_write on tenants;
drop policy if exists tenant_isolation on tenants;
create policy tenant_isolation on tenants
  using (id = nullif(current_setting('app.tenant_id', true), ''))
  with check (id = nullif(current_setting('app.tenant_id', true), ''));

-- users + audit_logs: enable RLS with no policies for anon/authenticated.
-- Default deny closes Supabase "sensitive columns exposed" / public access
-- alerts. Prisma (bypass) and service_role still have full access.
alter table users enable row level security;
drop policy if exists tenant_isolation on users;
drop policy if exists users_self on users;

alter table audit_logs enable row level security;
drop policy if exists tenant_isolation on audit_logs;
drop policy if exists audit_logs_admin on audit_logs;
