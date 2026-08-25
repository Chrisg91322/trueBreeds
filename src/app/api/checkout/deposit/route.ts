import { NextResponse, type NextRequest } from "next/server";
import { depositCheckoutSchema } from "@/lib/validations/public";
import { createDepositCheckoutSession } from "@/lib/stripe/connect";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = depositCheckoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const session = await createDepositCheckoutSession(parsed.data);
    await prisma.analyticsEvent.create({
      data: {
        tenantId: parsed.data.tenantId,
        type: "deposit_started",
        metadata: { offspringId: parsed.data.offspringId },
      },
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("createDepositCheckoutSession failed", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Checkout failed" },
      { status: 400 }
    );
  }
}
