-- ============================================================================
-- TrueBreeds — Row-Level Security policies
--
-- Run this AFTER `prisma migrate deploy` / `prisma db push` has created the
-- tables. Apply via `psql $DIRECT_URL -f prisma/rls.sql` or paste into the
-- Supabase SQL editor.
--
-- IMPORTANT: RLS only protects you if the Postgres role in DATABASE_URL does
-- NOT have BYPASSRLS (superusers and the default Supabase `postgres` role
-- both bypass RLS). Create a dedicated, non-bypass application role:
--
--   CREATE ROLE app_user LOGIN PASSWORD '...';
--   GRANT USAGE ON SCHEMA public TO app_user;
--   GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
--   ALTER DEFAULT PRIVILEGES IN SCHEMA public
--     GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user;
--
-- Then point DATABASE_URL at `app_user`, and every request must call
-- `withTenantRls(tenantId, ...)` (see src/lib/db.ts) to set
-- `app.tenant_id` for the duration of the transaction before touching
-- tenant-scoped tables.
-- ============================================================================

do $$
declare
  t text;
  tenant_tables text[] := array[
    'tenant_members', 'tenant_invites', 'animals', 'litters', 'offspring',
    'media', 'leads', 'waitlist_entries', 'testimonials', 'faq_items',
    'platform_subscriptions', 'stripe_connect_accounts', 'deposits',
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
        using ("tenantId" = current_setting('app.tenant_id', true)::uuid)
        with check ("tenantId" = current_setting('app.tenant_id', true)::uuid);$p$,
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
      and leads."tenantId" = current_setting('app.tenant_id', true)::uuid
  ));

alter table social_post_targets enable row level security;
drop policy if exists tenant_isolation on social_post_targets;
create policy tenant_isolation on social_post_targets
  using (exists (
    select 1 from social_posts
    where social_posts.id = social_post_targets."postId"
      and social_posts."tenantId" = current_setting('app.tenant_id', true)::uuid
  ));

-- audit_logs: platform admins need cross-tenant visibility, so RLS is
-- intentionally NOT applied here — access is gated in application code by
-- the `platform_admin` role check instead (see src/lib/auth.ts).

-- tenants table itself: readable by anyone (needed for public site
-- rendering by slug/custom domain), writable only by members of that tenant.
alter table tenants enable row level security;
drop policy if exists tenants_read on tenants;
create policy tenants_read on tenants for select using (true);
drop policy if exists tenants_write on tenants;
create policy tenants_write on tenants for all
  using (id = current_setting('app.tenant_id', true)::uuid)
  with check (id = current_setting('app.tenant_id', true)::uuid);
