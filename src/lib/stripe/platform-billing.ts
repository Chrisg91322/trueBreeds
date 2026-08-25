import "server-only";
import { stripe } from "./client";
import { prisma } from "@/lib/prisma";

const GRACE_PERIOD_DAYS = 14;

/**
 * $297 one-time setup fee + $29/mo subscription in a single Checkout
 * Session (one-time line item + recurring price, per spec §4).
 */
export async function createPlatformCheckoutSession({
  tenantId,
  customerEmail,
}: {
  tenantId: string;
  customerEmail: string;
}) {
  const tenant = await prisma.tenant.findUniqueOrThrow({ where: { id: tenantId } });
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  let subscription = await prisma.platformSubscription.findUnique({ where: { tenantId } });

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
    line_items: [
      { price: process.env.STRIPE_PRICE_SETUP_FEE!, quantity: 1 },
      { price: process.env.STRIPE_PRICE_SUBSCRIPTION!, quantity: 1 },
    ],
    subscription_data: {
      metadata: { tenantId },
    },
    metadata: { tenantId, kind: "platform_setup_and_subscription" },
    success_url: `${appUrl}/onboarding?step=billing&status=success`,
    cancel_url: `${appUrl}/onboarding?step=billing&status=cancelled`,
    allow_promotion_codes: true,
  });

  subscription = await prisma.platformSubscription.upsert({
    where: { tenantId },
    update: { stripeCustomerId },
    create: { tenantId, stripeCustomerId, status: "incomplete" },
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
