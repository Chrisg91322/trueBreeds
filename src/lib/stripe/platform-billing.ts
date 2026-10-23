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
import {
  canChangeMembershipPlan,
  chargeSetupFeeOnCheckout,
  monthlyPriceUpdate,
  type MembershipItem,
} from "@/lib/billing/plan-change";
import { sendSubscriptionLifecycleNotices } from "@/lib/billing/subscription-notices";
import { syncPremiumProvisioning } from "@/lib/entitlements";

export const GRACE_PERIOD_DAYS = 14;
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
  returnTo = "onboarding",
}: {
  tenantId: string;
  customerEmail: string;
  plan: PlanTier;
  returnTo?: "onboarding" | "billing";
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
  if (canChangeMembershipPlan(subscription)) {
    throw new Error("You already have a membership. Upgrade or downgrade it from Billing settings.");
  }

  let stripeCustomerId = subscription?.stripeCustomerId ?? undefined;
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: customerEmail,
      name: tenant.kennelName,
      metadata: { tenantId },
    });
    stripeCustomerId = customer.id;
  }

  const includeSetupFee = chargeSetupFeeOnCheckout(!!subscription?.setupFeePaid);
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: stripeCustomerId,
    line_items: includeSetupFee
      ? [await setupFeeLineItem(), await lineItemForPlan(plan)]
      : [await lineItemForPlan(plan)],
    subscription_data: {
      metadata: { tenantId, plan },
    },
    metadata: {
      tenantId,
      plan,
      kind: PLATFORM_CHECKOUT_KIND,
    },
    success_url:
      returnTo === "billing"
        ? `${appUrl}/dashboard/settings/billing`
        : `${appUrl}/onboarding?step=publish&status=success`,
    cancel_url:
      returnTo === "billing"
        ? `${appUrl}/dashboard/settings/billing`
        : `${appUrl}/onboarding?step=billing&status=cancelled`,
    allow_promotion_codes: true,
  });

  await prisma.platformSubscription.upsert({
    where: { tenantId },
    update: subscription?.setupFeePaid
      ? { stripeCustomerId }
      : { stripeCustomerId, plan, stripePriceId: priceId },
    create: { tenantId, stripeCustomerId, plan, stripePriceId: priceId, status: "incomplete" },
  });

  return session;
}

/**
 * Upgrade or downgrade an existing membership. Only the monthly price changes.
 * The one-time setup fee is not added again.
 */
export async function changePlatformSubscriptionPlan({
  tenantId,
  plan,
}: {
  tenantId: string;
  plan: PlanTier;
}) {
  if (!isPlanTier(plan)) throw new Error("Invalid membership plan");

  const subscription = await prisma.platformSubscription.findUnique({ where: { tenantId } });
  if (!subscription?.stripeSubscriptionId || !canChangeMembershipPlan(subscription)) {
    throw new Error("There's no active membership to change. Subscribe from Billing settings first.");
  }
  if (subscription.plan === plan) {
    return { unchanged: true as const, plan };
  }

  const nextPriceId = await resolveStripePriceId(
    stripePriceIdForPlan(plan),
    `STRIPE_PRICE_${plan.toUpperCase()}`
  );
  if (!nextPriceId) {
    throw new Error(
      `Set STRIPE_PRICE_${plan.toUpperCase()} to the Stripe Price ID before changing plans.`
    );
  }

  const setupPriceId =
    (await resolveStripePriceId(stripePriceIdForSetupFee(), "STRIPE_PRICE_SETUP_FEE")) ?? null;
  const current = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);
  const updateItem = monthlyPriceUpdate({
    items: membershipItems(current),
    setupPriceId,
    nextPriceId,
  });

  const updated = await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
    items: [updateItem],
    proration_behavior: "always_invoice",
    payment_behavior: "error_if_incomplete",
    cancel_at_period_end: false,
    metadata: { tenantId, plan },
  });

  const periodEnd = updated.items.data[0]?.current_period_end
    ? new Date(updated.items.data[0].current_period_end * 1000)
    : subscription.currentPeriodEnd;

  try {
    await sendSubscriptionLifecycleNotices({
      tenantId,
      previousPlan: subscription.plan,
      nextPlan: plan,
      previousCancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      cancelAtPeriodEnd: updated.cancel_at_period_end,
      status: updated.status,
      eventType: "customer.subscription.updated",
      periodEnd,
      stripeSubscriptionId: updated.id,
    });
  } catch (err) {
    console.error("[billing] plan-change email failed", err);
  }

  await prisma.$transaction([
    prisma.platformSubscription.update({
      where: { tenantId },
      data: {
        plan,
        stripePriceId: nextPriceId,
        stripeSubscriptionId: updated.id,
        cancelAtPeriodEnd: updated.cancel_at_period_end,
        currentPeriodEnd: periodEnd,
        status: "active",
        gracePeriodEndsAt: null,
      },
    }),
    prisma.tenant.update({ where: { id: tenantId }, data: { status: "active" } }),
  ]);

  if (plan === "premium") {
    await syncPremiumProvisioning(tenantId, plan);
  }

  return { unchanged: false as const, plan };
}

function membershipItems(subscription: Stripe.Subscription): MembershipItem[] {
  return subscription.items.data.map((item) => {
    const price = item.price;
    return {
      id: item.id,
      priceId: price?.id ?? null,
      recurring: !!price?.recurring,
      unitAmount: price?.unit_amount ?? null,
      productName: productName(price?.product),
    };
  });
}

function productName(product: Stripe.Price["product"] | undefined) {
  if (!product || typeof product === "string") return null;
  if ("deleted" in product && product.deleted) return null;
  return product.name;
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

  return gracePeriodEndsAt;
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
