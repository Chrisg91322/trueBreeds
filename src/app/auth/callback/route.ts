import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/** Handles the redirect back from Supabase OAuth (Google) + email confirmation links. */
export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const code = url.searchParams.get("code");
  const oauthError = url.searchParams.get("error_description") || url.searchParams.get("error");

  if (oauthError) {
    const login = new URL("/login", url.origin);
    login.searchParams.set("error", "auth");
    return NextResponse.redirect(login);
  }

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      const login = new URL("/login", url.origin);
      login.searchParams.set("error", "auth");
      return NextResponse.redirect(login);
    }
  }

  // Never put extra query params on the Supabase redirect URL — GoTrue rejects
  // nested `?` as "Invalid path specified in request URL". Role-based routing
  // happens in /auth/continue.
  return NextResponse.redirect(new URL("/auth/continue", url.origin));
}
