import { NextResponse, type NextRequest } from "next/server";
import { depositCheckoutSchema } from "@/lib/validations/public";
import { createDepositCheckoutSession } from "@/lib/stripe/connect";
import { createReservationRequest, tenantAcceptsCardPayments } from "@/lib/reservations";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = depositCheckoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const canCharge = await tenantAcceptsCardPayments(parsed.data.tenantId);

    if (canCharge) {
      try {
        const session = await createDepositCheckoutSession(parsed.data);
        await prisma.analyticsEvent.create({
          data: {
            tenantId: parsed.data.tenantId,
            type: "deposit_started",
            metadata: { offspringId: parsed.data.offspringId, mode: "stripe" },
          },
        });
        return NextResponse.json({ url: session.url, mode: "checkout" });
      } catch (stripeErr) {
        // Invalid/incomplete Connect accounts should not hard-fail the buyer —
        // fall through to a soft reservation the breeder can follow up on.
        console.error("stripe deposit checkout failed; falling back to reservation", stripeErr);
      }
    }

    const reservation = await createReservationRequest(parsed.data);
    return NextResponse.json(reservation);
  } catch (err) {
    console.error("deposit/reservation failed", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Checkout failed" },
      { status: 400 }
    );
  }
}
