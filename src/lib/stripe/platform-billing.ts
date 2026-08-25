import "server-only";
import type Stripe from "stripe";
import { stripe } from "./client";
import { prisma } from "@/lib/prisma";
import {
  getPlan,
  isPlanTier,
  planFromPriceId,
  stripePriceIdForPlan,
  type PlanTier,
} from "@/lib/plans";

const GRACE_PERIOD_DAYS = 14;
const PLATFORM_CHECKOUT_KIND = "platform_subscription";

function lineItemForPlan(plan: PlanTier): Stripe.Checkout.SessionCreateParams.LineItem {
  const priceId = stripePriceIdForPlan(plan);
  if (priceId) return { price: priceId, quantity: 1 };

  const definition = getPlan(plan);
  return {
    quantity: 1,
    price_data: {
      currency: "usd",
      unit_amount: definition.unitAmount,
      recurring: { interval: "month" },
      product_data: {
        name: `TrueBreeds ${definition.name}`,
        description: definition.description,
      },
    },
  };
}

/**
 * Recurring membership checkout for Basic / Pro / Premium.
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

  const tenant = await prisma.tenant.findUniqueOrThrow({ where: { id: tenantId } });
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const priceId = stripePriceIdForPlan(plan);

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
    line_items: [lineItemForPlan(plan)],
    subscription_data: {
      metadata: { tenantId, plan },
    },
    metadata: {
      tenantId,
      plan,
      kind: PLATFORM_CHECKOUT_KIND,
    },
    success_url: `${appUrl}/onboarding?step=billing&status=success`,
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
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

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
