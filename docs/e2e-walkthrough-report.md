# E2E walkthrough report — Sunrise Beagles

**Date:** 2026-08-31  
**Environment:** Local `http://localhost:3002`, Stripe **test mode**  
**Test tenant:** Sunrise Beagles (`sunrise-beagles-e2e`)  
**Test user:** `e2e.walkthrough.1788202065890@truebreeds.dev` (Supabase Admin create + confirmed)

---

## Phase results

| Phase | Result | Notes |
|-------|--------|--------|
| 1. Prep / env | **Pass** | Dev on 3002, Stripe CLI forward (platform + Connect), `.env.local` webhook secrets |
| 2. Signup → publish | **Pass** | Admin-created user (UI signup + email confirm not fully exercised). All 7 onboarding steps; Pro Checkout `4242…`; webhook set `billingComplete`; publish → dashboard |
| 3. Kennel content | **Pass** | Animal Daisy (UI), litter/offspring/policies/contact seeded; preview + `http://sunrise-beagles-e2e.localhost:3002` show Daisy, Sunny, FAQ policies |
| 4. Leads / waitlist | **Pass** (after fix) | Contact lead saved; waitlist entries; CRM status → contacted + note |
| 5. Deposits | **Partial** | Soft reservation **Pass** (pending $300, Sunny → reserved). Paid Connect checkout + refund **blocked** (no Express account with `chargesEnabled`) |
| 6. Smoke | **Pass** | FAQ policies visible; unpaid publish gate exercised via billing requirement |

---

## Bugs fixed this pass

1. **Localhost treated as custom domain** when `NEXT_PUBLIC_ROOT_DOMAIN=truebreeds.com` — `src/lib/tenant-resolve.ts` now treats `localhost` / `127.0.0.1` as root and `{slug}.localhost` as tenant.
2. **Onboarding tenant create race (`P2002` on slug)** — `ensureTenantForCurrentUser` membership re-check + retry.
3. **Animal / litter / offspring forms** — empty numeric fields coerced to `0` and failed Zod; checkbox `"false"` coerced to `true` via `z.coerce.boolean`. Fixed in `src/lib/validations/kennel.ts` (+ action parsers).
4. **Contact / waitlist returned 500 after saving** when Resend API key is invalid — notifications are now try/catch so inquiry/waitlist still succeed (`contact` / `waitlist` routes; Connect deposit email similarly soft-failed).

---

## Your action items

1. **Resend** — Replace placeholder `RESEND_API_KEY` / `EMAIL_FROM` with a real key so breeder + buyer emails send (local and prod).
2. **Stripe Connect (test)** — Complete Express onboarding under Settings → Payments for `sunrise-beagles-e2e` (or any kennel), then retest: Reserve → Checkout → webhook → refund. Direct `accounts` v1 create is disabled on this Stripe account (Accounts v2 / Dashboard feature flag).
3. **Supabase email confirm** — If testing real `/signup`, disable confirm-email in Auth or click the confirm link (this pass used Admin API).
4. **Stripe CLI** — Keep `stripe listen` running locally with secrets in `.env.local` matching the CLI `whsec_…` (do not commit).
5. **VPN DNS** — Pause VPN if `{slug}.localhost` / `*.truebreeds.com` fails to resolve (known NXDOMAIN via some VPN DNS).

---

## Product gaps (not built this pass)

- **Digital agreements / e-sign / signed PDF vault** — Pro marketing lists “Digital breeder agreements”; only HTML policies + deposit-policy checkbox exist.
- **Stripe Pro price copy** — Checkout line item description still reads like “Basic - up to 4 pages…” (product/price metadata in Stripe Dashboard).
- **Connect skip UX** — “I’ll do this later” sets `onboarding.stripeConnected = true` (checklist complete without Connect).
- **Connect return URL** — Express return goes to dashboard payments, not back into onboarding step.
- **Paid deposit / refund** — Requires Connect `chargesEnabled`; soft reservation leaves deposit `pending` with no refund action until paid.
- **Balance invoices / tag UI** — Not exercised; still gaps relative to fuller CRM marketing.

---

## Test data reference

| Item | Value |
|------|--------|
| Tenant id | `78b80e2b-be2d-475a-8810-25f6bff276c1` |
| Slug / local URL | `sunrise-beagles-e2e` → `http://sunrise-beagles-e2e.localhost:3002` |
| Plan | Pro (`active`, setup fee paid) |
| Soft deposit | Sam Reserver / Sunny / $300 / `pending` |
| Lead + note | Alex Buyer → `contacted` + CRM note |

---

## Out of scope (per plan)

- Building DocuSign-style e-sign + vault  
- Live Stripe / production DNS  
- Full Playwright suite for onboarding  
