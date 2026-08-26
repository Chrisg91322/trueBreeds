# TrueBreeds

A multi-tenant SaaS website builder for dog & cat breeders. Every breeder gets
a polished public site (litters, waitlist, deposits, testimonials) plus a
dashboard to run their kennel: a lead CRM, Stripe-powered deposits, an Amazon
storefront, social auto-posting, and team/settings management. Platform staff
get their own admin panel for tenant health, MRR, and support.

Pricing: **$297 one-time setup** plus **Basic $49.99 / Pro $69.99 / Premium $99.99 per month**, billed via Stripe
subscriptions on the *platform's* Stripe account — separate from the Stripe
Connect accounts breeders use to collect their own buyer deposits).

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router, React Server Components, Server Actions) |
| Language | TypeScript |
| Styling / UI | Tailwind CSS + shadcn/ui (`@base-ui/react` primitives) |
| Database | PostgreSQL (Supabase or Neon) via Prisma ORM |
| Auth | Supabase Auth (email/password + Google OAuth) |
| Payments | Stripe (platform billing) + Stripe Connect Express (breeder deposits) |
| Email | Resend |
| Unit tests | Vitest |
| E2E tests | Playwright |

## Multi-tenancy model

Tenant isolation is enforced in **two independent layers**, so a bug in one
doesn't leak data across tenants:

1. **Application layer** — every tenant-scoped Prisma query goes through
   `forTenant(tenantId)` in [`src/lib/db.ts`](src/lib/db.ts), a Prisma Client
   Extension that injects/validates `tenantId` on every operation
   (`create`, `findMany`, `update`, `upsert`, etc.) via the pure, unit-tested
   helpers `scopeArgsForTenant` and `filterUniqueResultForTenant`.
2. **Database layer** — Postgres Row-Level Security policies in
   [`prisma/rls.sql`](prisma/rls.sql), keyed off an `app.tenant_id` session
   variable, so even a raw SQL query or a bug that bypasses `forTenant` can't
   cross tenant boundaries.

Tenants are resolved per-request in [`src/middleware.ts`](src/middleware.ts)
by hostname: `{slug}.<root-domain>` or a verified custom domain gets rewritten
to `/{slug}/...` (served from the `(sites)` route group), while the root
domain serves the marketing site, auth, dashboard, and admin panel.

## Getting started

### Prerequisites

- Node.js 20+
- A PostgreSQL database (e.g. a free [Supabase](https://supabase.com) or
  [Neon](https://neon.tech) project)
- A [Stripe](https://stripe.com) account (test mode is fine) with Connect enabled
- A [Resend](https://resend.com) account for transactional email (optional for local dev)

### Setup

```bash
npm install
cp .env.example .env.local   # fill in DATABASE_URL, Supabase, Stripe, Resend keys
npx prisma migrate dev       # create tables
npx prisma db execute --file prisma/rls.sql --schema prisma/schema.prisma
npm run db:seed              # optional: seeds a demo tenant, "Blue Moon Labradors"
npm run dev
```

Visit `http://localhost:3002` for the marketing site. Tenant sites are served
from subdomains — in local dev, visit `http://<slug>.localhost:3002` (most
browsers resolve `*.localhost` to `127.0.0.1` automatically).

### Environment variables

See [`.env.example`](.env.example) for the full list with comments. At minimum
you need `DATABASE_URL`/`DIRECT_URL`, the `NEXT_PUBLIC_SUPABASE_*` keys, and
`STRIPE_SECRET_KEY`. Feature areas (social auto-posting, Amazon recs) degrade
gracefully / are feature-flagged when their keys are unset.

## Scripts

```bash
npm run dev         # start the dev server
npm run build        # production build
npm run start         # serve the production build
npm run lint          # ESLint
npm run test           # unit tests (Vitest)
npm run test:watch      # unit tests in watch mode
npm run test:e2e         # Playwright smoke tests (builds + starts the app automatically)
npm run db:seed           # seed the demo tenant
```

## Testing

- **Unit tests** (`tests/*.test.ts`, run via `npm run test`) cover:
  - Tenant-isolation logic in `src/lib/db.ts` — every Prisma operation type
    gets tenant-scoped correctly, and a caller can't override `tenantId`.
  - Both Stripe webhook handlers (`/api/webhooks/stripe`,
    `/api/webhooks/stripe-connect`) with `prisma`/`stripe` mocked, covering
    signature verification failures, deposit → lead → analytics event
    fan-out, and subscription grace-period/reactivation transitions.
  - The offspring and lead CRM status pipelines (`src/lib/offspring-status.ts`,
    `src/lib/lead-status.ts`).
- **E2E smoke tests** (`tests/e2e/*.spec.ts`, run via `npm run test:e2e`) hit
  the marketing homepage, auth pages, and legal pages against a production
  build. They intentionally avoid the dashboard/tenant-site flows, which
  need a live Postgres + Supabase project to exercise meaningfully.

## Project structure

```
prisma/
  schema.prisma         # full multi-tenant data model
  rls.sql                # Postgres Row-Level Security policies
  seed.ts                  # demo tenant seed script
src/
  middleware.ts          # hostname-based tenant resolution + Supabase session refresh
  lib/
    db.ts                  # tenant-scoped Prisma client extension
    auth.ts                 # session/role helpers, impersonation
    stripe/                  # platform billing + Connect
    messenger/                 # Resend email templates/senders
    actions/                    # server actions (one file per domain area)
  app/
    page.tsx               # marketing homepage
    (login|signup)/           # auth pages
    (sites)/[tenant]/           # public breeder sites (rewritten to by middleware)
    dashboard/                    # breeder dashboard (CRM, litters, settings, ...)
    admin/                          # platform admin panel
    api/                              # webhooks + public form endpoints
tests/
  *.test.ts                # Vitest unit tests
  e2e/*.spec.ts               # Playwright smoke tests
```

## Deploying to production

This walks through standing up a real TrueBreeds instance on Vercel with a
production Supabase project and Stripe account. Do it roughly in this order —
later steps (webhooks, OAuth redirect URLs) need the production URL from
earlier steps.

### 1. Database + Auth — Supabase

1. Create a project at the [Supabase dashboard](https://supabase.com/dashboard).
2. **Get your connection strings**: project → *Connect* (or *Settings → Database*)
   → copy the **Transaction pooler** URI into `DATABASE_URL` (append
   `&pgbouncer=true` if not already present) and the **Direct connection** URI
   into `DIRECT_URL`.
3. **Get your API keys**: *Settings → API* → copy `Project URL` into
   `NEXT_PUBLIC_SUPABASE_URL`, the `anon` `public` key into
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and the `service_role` `secret` key into
   `SUPABASE_SERVICE_ROLE_KEY`.
4. **Configure auth URLs**: *Authentication → URL Configuration*
   - **Site URL**: `https://www.truebreeds.com` (production). Do **not** leave
     this as `http://localhost:3000` or confirmation emails will bounce you
     back to localhost.
   - **Redirect URLs** (add all of these):
     - `https://www.truebreeds.com/auth/callback`
     - `https://truebreeds.com/auth/callback`
     - `http://localhost:3002/auth/callback`
     - `http://127.0.0.1:3002/auth/callback`
5. **(Optional) Enable Google sign-in**: *Authentication → Providers → Google*.
   Create an OAuth client in the
   [Google Cloud Console credentials page](https://console.cloud.google.com/apis/credentials),
   add Supabase's callback URL (shown on that provider settings page) as an
   authorized redirect URI, then paste the client ID/secret back into Supabase.
6. From your machine, with `DATABASE_URL`/`DIRECT_URL` pointed at this
   project, run:
   ```bash
   npx prisma db push
   npx prisma db execute --file prisma/rls.sql --schema prisma/schema.prisma
   ```
   Put those same Postgres URLs into Vercel (`DATABASE_URL` = pooler,
   `DIRECT_URL` = direct) so signup/onboarding can write `users` / `tenants`.

### 2. Payments — Stripe

TrueBreeds uses **two** roles of the same Stripe account setup: the
platform's own account (membership subscription) and Stripe Connect
(Express accounts breeders use to collect deposits directly).

1. Create/log into a Stripe account at the [Stripe Dashboard](https://dashboard.stripe.com).
   Do all of the below in **Test mode** first, then repeat for **Live mode**
   before launch.
2. **API keys**: [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys)
   → copy the secret key into `STRIPE_SECRET_KEY` and the publishable key
   into `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
3. **Create products/prices**: [dashboard.stripe.com/products](https://dashboard.stripe.com/products)
   → create a one-time **$297 setup fee** plus recurring monthly prices for
   **Basic ($49.99)**, **Pro ($69.99)**, and **Premium ($99.99)**. Copy their
   price IDs into `STRIPE_PRICE_SETUP_FEE`, `STRIPE_PRICE_BASIC`,
   `STRIPE_PRICE_PRO`, and `STRIPE_PRICE_PREMIUM`. If those env vars are
   unset, Checkout still creates the correct prices inline.
4. **Enable Connect**: [dashboard.stripe.com/settings/connect](https://dashboard.stripe.com/settings/connect)
   → turn on Express accounts (this app uses embedded onboarding, so the
   optional `STRIPE_CONNECT_CLIENT_ID` OAuth setting isn't required).
5. **Webhooks** — create *two* endpoints at
   [dashboard.stripe.com/workbench/webhooks](https://dashboard.stripe.com/workbench/webhooks):
   - `https://truebreeds.com/api/webhooks/stripe` listening for
     `checkout.session.completed`, `invoice.payment_failed`,
     `invoice.payment_succeeded`, `customer.subscription.updated`,
     `customer.subscription.deleted` on your **platform account** → copy its
     signing secret into `STRIPE_WEBHOOK_SECRET`.
   - `https://truebreeds.com/api/webhooks/stripe-connect` listening for
     `checkout.session.completed`, `account.updated`, `charge.refunded` on
     **connected accounts** (toggle "Listen to events on Connected accounts"
     when creating it) → copy its signing secret into
     `STRIPE_CONNECT_WEBHOOK_SECRET`.
   - For local testing before you have a public URL, use the
     [Stripe CLI](https://docs.stripe.com/stripe-cli) (`stripe listen --forward-to localhost:3002/api/webhooks/stripe`).

### 3. Transactional email — Resend

1. Create an account at [resend.com](https://resend.com) and an API key at
   [resend.com/api-keys](https://resend.com/api-keys) → `RESEND_API_KEY`.
2. Verify a sending domain at [resend.com/domains](https://resend.com/domains)
   (add the DNS records it gives you), then set `EMAIL_FROM` to an address on
   that domain, e.g. `TrueBreeds <notifications@mail.truebreeds.com>`.

### 4. Hosting — Vercel

1. Push this repo to GitHub/GitLab/Bitbucket, then import it at
   [vercel.com/new](https://vercel.com/new).
2. **Environment variables**: project → *Settings → Environment Variables* —
   paste in everything from your `.env` (use the Live-mode Stripe keys and
   production URLs for a Production environment). At minimum: `DATABASE_URL`,
   `DIRECT_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`,
   `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`,
   `STRIPE_CONNECT_WEBHOOK_SECRET`, `STRIPE_PRICE_SETUP_FEE`, `STRIPE_PRICE_BASIC`,
   `STRIPE_PRICE_PRO`, `STRIPE_PRICE_PREMIUM`, `RESEND_API_KEY`, `EMAIL_FROM`,
   `TOKEN_ENCRYPTION_KEY` (generate with `openssl rand -hex 32`),
   `NEXT_PUBLIC_ROOT_DOMAIN`, `NEXT_PUBLIC_APP_URL`, and
   `PLATFORM_ADMIN_EMAILS` (your own email, so your first sign-in gets
   `platform_admin`).
3. **Domains**: project → *Settings → Domains* — add your root domain (e.g.
   `truebreeds.com`) and follow Vercel's DNS instructions, then add a
   **wildcard domain** `*.truebreeds.com` the same way so every tenant
   subdomain resolves. See
   [Vercel's wildcard domain docs](https://vercel.com/docs/projects/domains/working-with-domains#adding-a-wildcard-domain)
   (wildcard domains require a Pro or Enterprise plan). Vercel issues SSL
   certificates for both automatically.
4. Deploy. `src/middleware.ts` is configured to run in the Node.js runtime
   (not Edge) so it can query Postgres directly via Prisma for tenant
   resolution — no extra Vercel config needed for that.
5. Go back to Supabase and Stripe and double-check every redirect/webhook URL
   above now points at your real production domain, not `localhost`.

### 5. Launch checklist

- [ ] Sign up through the production URL with your own email (matching
      `PLATFORM_ADMIN_EMAILS`) and confirm you land in `/admin`.
- [ ] Complete the onboarding wizard end-to-end with a **Stripe test card**
      in Test mode first, then repeat once with real payment methods in Live
      mode.
- [ ] Connect a Stripe Express account from *Dashboard → Settings →
      Payments* and confirm `account.updated` webhooks flip
      `chargesEnabled`.
- [ ] Submit a test deposit checkout and confirm the webhook marks it paid,
      moves the offspring to `deposit_received`, and creates a lead.
- [ ] Visit `https://<slug>.truebreeds.com` and confirm the tenant site
      renders.
- [ ] Run `npm run db:seed` against a staging database (never production) if
      you want a realistic demo tenant to show prospects.

### Notes on custom tenant domains

A breeder can point their own domain at TrueBreeds from *Dashboard →
Settings → Domain* (`src/components/dashboard/domain-settings-form.tsx`),
which asks them to add a `CNAME` record to your root domain and sets
`customDomainStatus` to `pending`. Automatically polling DNS and flipping it
to `verified` (and provisioning it in Vercel via their
[Domains API](https://vercel.com/docs/rest-api/reference/endpoints/domains))
is not yet wired up — for now, verify manually and update the tenant's
`customDomainStatus` to `verified` (e.g. via Prisma Studio or a quick admin
script) once the CNAME resolves. `src/middleware.ts` already treats any
verified custom domain exactly like a subdomain.
