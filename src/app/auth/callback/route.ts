import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/** Handles the redirect back from Supabase OAuth (Google) + email confirmation links. */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (code) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Never put extra query params on the Supabase redirect URL — GoTrue rejects
  // nested `?` as "Invalid path specified in request URL". Role-based routing
  // happens in /auth/continue.
  return NextResponse.redirect(new URL("/auth/continue", req.nextUrl.origin));
}
