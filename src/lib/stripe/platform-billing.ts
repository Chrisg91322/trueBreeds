import "server-only";
import type Stripe from "stripe";
import { stripe } from "./client";
import { prisma } from "@/lib/prisma";
import {
  getPlan,
  isPlanTier,
  planFromPriceId,
  stripePriceIdForPlan,
  stripePriceIdForSetupFee,
  SETUP_FEE,
  type PlanTier,
} from "@/lib/plans";

const GRACE_PERIOD_DAYS = 14;
const PLATFORM_CHECKOUT_KIND = "platform_subscription";

/**
 * Checkout line items need Stripe Price IDs (`price_…`). If someone pasted a
 * Product ID (`prod_…`) into env by mistake, resolve its default price.
 */
async function resolveStripePriceId(
  raw: string | undefined,
  label: string
): Promise<string | undefined> {
  const match = raw?.match(/(?:price|prod)_[A-Za-z0-9]+/);
  const value = match?.[0];
  if (!value) return undefined;

  if (value.startsWith("price_")) return value;

  if (value.startsWith("prod_")) {
    const product = await stripe.products.retrieve(value);
    const defaultPrice =
      typeof product.default_price === "string"
        ? product.default_price
        : product.default_price?.id;
    if (!defaultPrice) {
      throw new Error(
        `${label} is a Product ID (${value}) with no default price. In Stripe → Products → that product, copy the Price ID (price_…) into your env instead.`
      );
    }
    return defaultPrice;
  }

  throw new Error(
    `${label} must be a Stripe Price ID starting with price_ (got "${raw?.slice(0, 24)}"). Open the product in Stripe and copy the Price ID, not the Product ID.`
  );
}

async function lineItemForPlan(
  plan: PlanTier
): Promise<Stripe.Checkout.SessionCreateParams.LineItem> {
  const priceId = await resolveStripePriceId(
    stripePriceIdForPlan(plan),
    `STRIPE_PRICE_${plan.toUpperCase()}`
  );
  if (priceId) return { price: priceId, quantity: 1 };

  const definition = getPlan(plan);
  return {
    quantity: 1,
    price_data: {
      currency: "usd",
      unit_amount: definition.unitAmount,
      recurring: { interval: "month" },
      product_data: {
        name: definition.stripeProductName,
        description: definition.description,
      },
    },
  };
}

async function setupFeeLineItem(): Promise<Stripe.Checkout.SessionCreateParams.LineItem> {
  const priceId = await resolveStripePriceId(
    stripePriceIdForSetupFee(),
    "STRIPE_PRICE_SETUP_FEE"
  );
  if (priceId) return { price: priceId, quantity: 1 };
  return {
    quantity: 1,
    price_data: {
      currency: "usd",
      unit_amount: SETUP_FEE.unitAmount,
      product_data: {
        name: SETUP_FEE.stripeProductName,
        description: "One-time onboarding and site setup",
      },
    },
  };
}

/**
 * $297 one-time setup fee plus a Basic / Pro / Premium membership.
 */
export async function createPlatformCheckoutSession({
  tenantId,
  customerEmail,
  plan,
}: {
  tenantId: string;
  customerEmail: string;
  plan: PlanTier;
}) {
  if (!isPlanTier(plan)) {
    throw new Error("Invalid membership plan");
  }

  const secret = process.env.STRIPE_SECRET_KEY?.trim() || "";
  if (!secret || secret.includes("placeholder") || secret.endsWith("…")) {
    throw new Error(
      "Stripe is not configured. Set a valid STRIPE_SECRET_KEY (sk_test_… or sk_live_…) in your environment."
    );
  }

  const tenant = await prisma.tenant.findUniqueOrThrow({ where: { id: tenantId } });
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3002";
  const priceId = await resolveStripePriceId(
    stripePriceIdForPlan(plan),
    `STRIPE_PRICE_${plan.toUpperCase()}`
  );

  const subscription = await prisma.platformSubscription.findUnique({ where: { tenantId } });

  let stripeCustomerId = subscription?.stripeCustomerId ?? undefined;
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: customerEmail,
      name: tenant.kennelName,
      metadata: { tenantId },
    });
    stripeCustomerId = customer.id;
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: stripeCustomerId,
    line_items: [await setupFeeLineItem(), await lineItemForPlan(plan)],
    subscription_data: {
      metadata: { tenantId, plan },
    },
    metadata: {
      tenantId,
      plan,
      kind: PLATFORM_CHECKOUT_KIND,
    },
    success_url: `${appUrl}/onboarding?step=publish&status=success`,
    cancel_url: `${appUrl}/onboarding?step=billing&status=cancelled`,
    allow_promotion_codes: true,
  });

  await prisma.platformSubscription.upsert({
    where: { tenantId },
    update: { stripeCustomerId, plan, stripePriceId: priceId },
    create: { tenantId, stripeCustomerId, plan, stripePriceId: priceId, status: "incomplete" },
  });

  return session;
}

export async function createBillingPortalSession(tenantId: string) {
  const subscription = await prisma.platformSubscription.findUniqueOrThrow({
    where: { tenantId },
  });
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3002";

  if (!subscription.stripeCustomerId) {
    throw new Error("Tenant has no Stripe customer yet");
  }

  return stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: `${appUrl}/dashboard/settings/billing`,
  });
}

/** Called from the platform Stripe webhook when a subscription invoice fails. Starts the 14-day grace period; data is never deleted. */
export async function startGracePeriod(tenantId: string) {
  const gracePeriodEndsAt = new Date();
  gracePeriodEndsAt.setDate(gracePeriodEndsAt.getDate() + GRACE_PERIOD_DAYS);

  await prisma.$transaction([
    prisma.platformSubscription.update({
      where: { tenantId },
      data: { status: "grace_period", gracePeriodEndsAt },
    }),
    prisma.tenant.update({ where: { id: tenantId }, data: { status: "past_due" } }),
  ]);
}

/** Called by a scheduled job (Inngest) once the grace period has elapsed with no successful payment. */
export async function suspendTenantForNonPayment(tenantId: string) {
  await prisma.$transaction([
    prisma.platformSubscription.update({
      where: { tenantId },
      data: { status: "suspended" },
    }),
    prisma.tenant.update({ where: { id: tenantId }, data: { status: "suspended" } }),
  ]);
}

export async function reactivateTenant(tenantId: string) {
  await prisma.$transaction([
    prisma.platformSubscription.update({
      where: { tenantId },
      data: { status: "active", gracePeriodEndsAt: null },
    }),
    prisma.tenant.update({ where: { id: tenantId }, data: { status: "active" } }),
  ]);
}

export function planFromStripeSubscription(subscription: Stripe.Subscription): PlanTier | null {
  const fromMetadata = subscription.metadata?.plan;
  if (isPlanTier(fromMetadata)) return fromMetadata;
  return planFromPriceId(subscription.items.data[0]?.price?.id);
}
