import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe/client";
import { prisma } from "@/lib/prisma";
import { startGracePeriod, reactivateTenant, planFromStripeSubscription } from "@/lib/stripe/platform-billing";
import { isPlanTier } from "@/lib/plans";

export const runtime = "nodejs";

/**
 * Webhook for the PLATFORM's own Stripe account — billing events only
 * (membership subscription). Deposit/Connect events are handled by
 * /api/webhooks/stripe-connect.
 */
export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Platform webhook signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (
        session.metadata?.kind === "platform_subscription" ||
        session.metadata?.kind === "platform_setup_and_subscription"
      ) {
        const tenantId = session.metadata.tenantId;
        const plan = isPlanTier(session.metadata.plan) ? session.metadata.plan : undefined;
        await prisma.platformSubscription.update({
          where: { tenantId },
          data: {
            stripeSubscriptionId:
              typeof session.subscription === "string" ? session.subscription : undefined,
            status: "active",
            setupFeePaid: true,
            ...(plan ? { plan } : {}),
          },
        });
        await prisma.tenant.update({ where: { id: tenantId }, data: { status: "active" } });
        await prisma.onboardingProgress.upsert({
          where: { tenantId },
          update: { billingComplete: true },
          create: { tenantId, billingComplete: true },
        });
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId =
        typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
      if (customerId) {
        const sub = await prisma.platformSubscription.findUnique({
          where: { stripeCustomerId: customerId },
        });
        if (sub) await startGracePeriod(sub.tenantId);
      }
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId =
        typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
      if (customerId) {
        const sub = await prisma.platformSubscription.findUnique({
          where: { stripeCustomerId: customerId },
        });
        if (sub && (sub.status === "grace_period" || sub.status === "past_due")) {
          await reactivateTenant(sub.tenantId);
        }
      }
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const sub = await prisma.platformSubscription.findUnique({
        where: { stripeSubscriptionId: subscription.id },
      });
      if (sub) {
        const plan = planFromStripeSubscription(subscription);
        await prisma.platformSubscription.update({
          where: { tenantId: sub.tenantId },
          data: {
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            status: subscription.status === "canceled" ? "cancelled" : sub.status,
            currentPeriodEnd: subscription.items.data[0]?.current_period_end
              ? new Date(subscription.items.data[0].current_period_end * 1000)
              : undefined,
            stripePriceId: subscription.items.data[0]?.price?.id,
            ...(plan ? { plan } : {}),
          },
        });
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
