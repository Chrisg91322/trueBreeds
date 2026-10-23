import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import { getSessionContext } from "@/lib/auth";
import { isPlanTier } from "@/lib/plans";
import { changePlatformSubscriptionPlan } from "@/lib/stripe/platform-billing";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionContext();
    if (!session?.tenantId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    if (!isPlanTier(body.plan)) {
      return NextResponse.json({ error: "Choose a membership plan" }, { status: 400 });
    }

    const result = await changePlatformSubscriptionPlan({
      tenantId: session.tenantId,
      plan: body.plan,
    });

    return NextResponse.json(result);
  } catch (err) {
    const message =
      err instanceof Stripe.errors.StripeError
        ? err.message
        : err instanceof Error
          ? err.message
          : "Could not change plan";
    console.error("[billing/plan]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
