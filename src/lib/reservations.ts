import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * Soft reservation when Stripe Connect isn't taking payments yet.
 * Creates a pending deposit + lead so breeders can demo the full Premium
 * buyer flow without charging a card.
 */
export async function createReservationRequest({
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
  const [tenant, offspring] = await Promise.all([
    prisma.tenant.findUniqueOrThrow({ where: { id: tenantId } }),
    prisma.offspring.findUniqueOrThrow({
      where: { id: offspringId },
      include: { litter: true },
    }),
  ]);

  if (offspring.tenantId !== tenantId) {
    throw new Error("Listing not found");
  }
  if (offspring.status !== "available" && offspring.status !== "upcoming") {
    throw new Error("This listing is no longer available to reserve");
  }

  const amount = offspring.depositAmount ?? offspring.litter.defaultDepositAmount ?? 0;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3002";
  const acceptedAt = new Date();
  const offspringName = offspring.name ?? `${offspring.litter.breed ?? "Puppy"}`;

  const deposit = await prisma.$transaction(async (tx) => {
    const created = await tx.deposit.create({
      data: {
        tenantId,
        offspringId,
        buyerName,
        buyerEmail,
        buyerPhone: buyerPhone || null,
        amount,
        status: "pending",
        policyAcceptedAt: acceptedAt,
        policySnapshot: tenant.depositPolicy,
      },
    });

    await tx.lead.create({
      data: {
        tenantId,
        name: buyerName,
        email: buyerEmail,
        phone: buyerPhone || null,
        source: "deposit",
        status: "new",
        offspringId,
        message: amount
          ? `Reservation request for ${offspringName} — $${amount.toLocaleString()} deposit (payment pending).`
          : `Reservation request for ${offspringName}.`,
      },
    });

    await tx.offspring.update({
      where: { id: offspringId },
      data: { status: "reserved" },
    });

    await tx.analyticsEvent.create({
      data: {
        tenantId,
        type: "deposit_started",
        metadata: { offspringId, depositId: created.id, mode: "reservation_request" },
      },
    });

    return created;
  });

  return {
    depositId: deposit.id,
    url: `${appUrl}/deposit/success?depositId=${deposit.id}&mode=request`,
    mode: "request" as const,
  };
}

export async function tenantAcceptsCardPayments(tenantId: string) {
  const account = await prisma.stripeConnectAccount.findUnique({ where: { tenantId } });
  return !!account?.chargesEnabled;
}
