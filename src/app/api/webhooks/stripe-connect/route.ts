import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe/client";
import { prisma } from "@/lib/prisma";
import { syncConnectAccountStatus } from "@/lib/stripe/connect";
import { sendDepositConfirmation } from "@/lib/messenger/notifications";

export const runtime = "nodejs";

/**
 * Webhook for events on CONNECTED accounts (each breeder's Stripe Express
 * account) — deposit payments and onboarding status changes.
 */
export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature!,
      process.env.STRIPE_CONNECT_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Connect webhook signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const depositId = session.metadata?.depositId;
      if (depositId && session.payment_status === "paid") {
        const deposit = await prisma.deposit.update({
          where: { id: depositId },
          data: {
            status: "paid",
            stripePaymentIntentId:
              typeof session.payment_intent === "string" ? session.payment_intent : undefined,
          },
          include: { offspring: { include: { litter: true } }, tenant: true },
        });

        await prisma.offspring.update({
          where: { id: deposit.offspringId },
          data: { status: "deposit_received" },
        });

        await prisma.lead.create({
          data: {
            tenantId: deposit.tenantId,
            name: deposit.buyerName,
            email: deposit.buyerEmail,
            phone: deposit.buyerPhone,
            source: "deposit",
            status: "deposit",
            offspringId: deposit.offspringId,
            message: `Paid a $${deposit.amount} deposit on ${deposit.offspring.name ?? "a puppy"}.`,
          },
        });

        await prisma.analyticsEvent.create({
          data: {
            tenantId: deposit.tenantId,
            type: "deposit_completed",
            metadata: { depositId: deposit.id, amount: deposit.amount },
          },
        });

        await sendDepositConfirmation(deposit);
      }
      break;
    }

    case "account.updated": {
      const account = event.data.object as Stripe.Account;
      await syncConnectAccountStatus(account.id);
      break;
    }

    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      const paymentIntentId =
        typeof charge.payment_intent === "string" ? charge.payment_intent : undefined;
      if (paymentIntentId) {
        await prisma.deposit.updateMany({
          where: { stripePaymentIntentId: paymentIntentId },
          data: { status: "refunded", refundedAt: new Date() },
        });
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
