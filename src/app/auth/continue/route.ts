import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth";

export const runtime = "nodejs";

/** After sign-in / email confirm, send admins to /admin and everyone else onward. */
export async function GET(req: Request) {
  const session = await getSessionContext();
  const origin = new URL(req.url).origin;

  if (!session) {
    return NextResponse.redirect(new URL("/login", origin));
  }

  if (session.platformRole === "platform_admin") {
    return NextResponse.redirect(new URL("/admin", origin));
  }

  if (session.tenantId) {
    return NextResponse.redirect(new URL("/dashboard", origin));
  }

  return NextResponse.redirect(new URL("/onboarding", origin));
}
