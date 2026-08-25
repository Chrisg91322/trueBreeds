import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth";
import { createConnectOnboardingLink } from "@/lib/stripe/connect";

export const runtime = "nodejs";

export async function POST() {
  const session = await getSessionContext();
  if (!session || !session.tenantId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const url = await createConnectOnboardingLink(session.tenantId);
  return NextResponse.json({ url });
}
