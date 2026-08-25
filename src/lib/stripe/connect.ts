import "server-only";
import { stripe } from "./client";
import { prisma } from "@/lib/prisma";

/**
 * Stripe Connect (Express) onboarding. Each breeder gets their own Express
 * account so buyer payments (deposits, balance invoices) flow directly to
 * the breeder — the platform is never a money transmitter for pet sales.
 * An optional platform application fee (basis points, default 0) can be
 * taken on top of each charge; the lever exists in code even though it's
 * off at launch.
 */
export async function getOrCreateConnectAccount(tenantId: string) {
  const existing = await prisma.stripeConnectAccount.findUnique({ where: { tenantId } });
  if (existing) return existing;

  const tenant = await prisma.tenant.findUniqueOrThrow({ where: { id: tenantId } });

  const account = await stripe.accounts.create({
    type: "express",
    business_type: "individual",
    business_profile: {
      name: tenant.kennelName,
      mcc: "0742", // Veterinary services (closest standard MCC for animal breeders)
    },
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    metadata: { tenantId },
  });

  return prisma.stripeConnectAccount.create({
    data: { tenantId, stripeAccountId: account.id },
  });
}

export async function createConnectOnboardingLink(tenantId: string) {
  const connectAccount = await getOrCreateConnectAccount(tenantId);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const accountLink = await stripe.accountLinks.create({
    account: connectAccount.stripeAccountId,
    refresh_url: `${appUrl}/dashboard/settings/payments?refresh=1`,
    return_url: `${appUrl}/dashboard/settings/payments?connected=1`,
    type: "account_onboarding",
  });

  return accountLink.url;
}

export async function syncConnectAccountStatus(stripeAccountId: string) {
  const account = await stripe.accounts.retrieve(stripeAccountId);
  const updated = await prisma.stripeConnectAccount.update({
    where: { stripeAccountId },
    data: {
      chargesEnabled: !!account.charges_enabled,
      payoutsEnabled: !!account.payouts_enabled,
      detailsSubmitted: !!account.details_submitted,
    },
  });

  if (updated.chargesEnabled) {
    await prisma.onboardingProgress.upsert({
      where: { tenantId: updated.tenantId },
      update: { stripeConnected: true },
      create: { tenantId: updated.tenantId, stripeConnected: true },
    });
  }

  return account;
}

/**
 * Deposit checkout — money flows straight to the breeder's connected
 * account. `applicationFeeBps` (0 by default) lets the platform take a cut
 * later without any code changes.
 */
export async function createDepositCheckoutSession({
  tenantId,
  offspringId,
  buyerName,
  buyerEmail,
  buyerPhone,
}: {
  tenantId: string;
  offspringId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone?: string;
}) {
  const [tenant, connectAccount, offspring] = await Promise.all([
    prisma.tenant.findUniqueOrThrow({ where: { id: tenantId } }),
    prisma.stripeConnectAccount.findUniqueOrThrow({ where: { tenantId } }),
    prisma.offspring.findUniqueOrThrow({
      where: { id: offspringId },
      include: { litter: true },
    }),
  ]);

  if (!connectAccount.chargesEnabled) {
    throw new Error("Breeder has not finished connecting Stripe yet");
  }

  const amount = offspring.depositAmount ?? offspring.litter.defaultDepositAmount ?? 0;
  if (!amount || amount <= 0) {
    throw new Error("No deposit amount configured for this offspring");
  }

  const amountCents = Math.round(amount * 100);
  const applicationFeeAmount = connectAccount.applicationFeeBps
    ? Math.round((amountCents * connectAccount.applicationFeeBps) / 10000)
    : undefined;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const acceptedAt = new Date();

  const deposit = await prisma.deposit.create({
    data: {
      tenantId,
      offspringId,
      buyerName,
      buyerEmail,
      buyerPhone,
      amount,
      status: "pending",
      applicationFeeAmount: applicationFeeAmount ? applicationFeeAmount / 100 : 0,
      policyAcceptedAt: acceptedAt,
      policySnapshot: tenant.depositPolicy,
    },
  });

  const session = await stripe.checkout.sessions.create(
    {
      mode: "payment",
      customer_email: buyerEmail,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: amountCents,
            product_data: {
              name: `Deposit — ${offspring.name ?? "Puppy"} (${tenant.kennelName})`,
              description: tenant.depositPolicy ?? undefined,
            },
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: applicationFeeAmount,
        metadata: { tenantId, offspringId, depositId: deposit.id },
      },
      metadata: { tenantId, offspringId, depositId: deposit.id },
      success_url: `${appUrl}/deposit/success?depositId=${deposit.id}`,
      cancel_url: `${appUrl}/deposit/cancelled?depositId=${deposit.id}`,
    },
    { stripeAccount: connectAccount.stripeAccountId }
  );

  await prisma.deposit.update({
    where: { id: deposit.id },
    data: { stripeCheckoutSessionId: session.id },
  });

  return session;
}

/** Refunds a paid deposit from the dashboard, requiring a reason (spec §3). */
export async function refundDeposit(tenantId: string, depositId: string, reason: string) {
  const [deposit, connectAccount] = await Promise.all([
    prisma.deposit.findFirstOrThrow({ where: { id: depositId, tenantId } }),
    prisma.stripeConnectAccount.findUniqueOrThrow({ where: { tenantId } }),
  ]);

  if (deposit.status !== "paid") {
    throw new Error("Only paid deposits can be refunded");
  }
  if (!deposit.stripePaymentIntentId) {
    throw new Error("No payment on record for this deposit");
  }

  await stripe.refunds.create(
    { payment_intent: deposit.stripePaymentIntentId },
    { stripeAccount: connectAccount.stripeAccountId }
  );

  return prisma.deposit.update({
    where: { id: depositId },
    data: { status: "refunded", refundReason: reason, refundedAt: new Date() },
  });
}
