import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth";
import { createPlatformCheckoutSession } from "@/lib/stripe/platform-billing";

export const runtime = "nodejs";

export async function POST() {
  const session = await getSessionContext();
  if (!session || !session.tenantId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const checkoutSession = await createPlatformCheckoutSession({
    tenantId: session.tenantId,
    customerEmail: session.email,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
