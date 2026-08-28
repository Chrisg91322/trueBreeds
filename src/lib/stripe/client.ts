import "server-only";
import Stripe from "stripe";

declare global {
  var __stripe: Stripe | undefined;
}

/**
 * Single Stripe client for the *platform's own* Stripe account. Used for:
 *  - Platform billing (Basic / Pro / Premium memberships tenants pay us)
 *  - Creating & managing Stripe Connect Express accounts on breeders' behalf
 *
 * Charges to *buyers* (deposits, balance invoices) are created with
 * `{ stripeAccount: connectedAccountId }` so funds land directly in the
 * breeder's own Connect account — see lib/stripe/connect.ts.
 */
function stripeSecretKey() {
  // Trim quotes/whitespace and a trailing period people sometimes paste from docs.
  return (process.env.STRIPE_SECRET_KEY || "sk_test_placeholder")
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\.$/, "");
}

export const stripe =
  global.__stripe ??
  new Stripe(stripeSecretKey(), {
    apiVersion: "2026-07-29.dahlia",
    typescript: true,
  });

if (process.env.NODE_ENV !== "production") {
  global.__stripe = stripe;
}
