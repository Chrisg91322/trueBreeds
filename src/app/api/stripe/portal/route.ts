import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth";
import { createBillingPortalSession } from "@/lib/stripe/platform-billing";

export const runtime = "nodejs";

export async function POST() {
  const session = await getSessionContext();
  if (!session || !session.tenantId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const portalSession = await createBillingPortalSession(session.tenantId);
  return NextResponse.json({ url: portalSession.url });
}
