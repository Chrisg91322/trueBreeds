import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth";

export const runtime = "nodejs";

/** After sign-in / email confirm, send admins to /admin and everyone else onward. */
export async function GET(req: Request) {
  const origin = new URL(req.url).origin;

  try {
    const session = await getSessionContext();

    if (!session) {
      return NextResponse.redirect(new URL("/login?error=session", origin));
    }

    if (session.platformRole === "platform_admin") {
      return NextResponse.redirect(new URL("/admin", origin));
    }

    if (session.tenantId) {
      return NextResponse.redirect(new URL("/dashboard", origin));
    }

    return NextResponse.redirect(new URL("/onboarding", origin));
  } catch (err) {
    console.error("auth/continue failed", err);
    // Usually missing/invalid DATABASE_URL on Vercel, or Prisma can't reach
    // the Supabase Postgres instance that stores app user rows.
    return NextResponse.redirect(new URL("/login?error=database", origin));
  }
}
