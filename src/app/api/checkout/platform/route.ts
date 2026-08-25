import { NextResponse, type NextRequest } from "next/server";
import { getSessionContext } from "@/lib/auth";
import { isPlanTier } from "@/lib/plans";
import { createPlatformCheckoutSession } from "@/lib/stripe/platform-billing";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const session = await getSessionContext();
  if (!session || !session.tenantId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const plan = body.plan;
  if (!isPlanTier(plan)) {
    return NextResponse.json({ error: "Choose a membership plan" }, { status: 400 });
  }

  const checkoutSession = await createPlatformCheckoutSession({
    tenantId: session.tenantId,
    customerEmail: session.email,
    plan,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
