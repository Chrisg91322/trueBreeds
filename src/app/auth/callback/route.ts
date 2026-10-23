import { NextResponse, type NextRequest } from "next/server";
import { isEmailLinkFailure, isPkceVerifierMissing, isRecentRecovery } from "@/lib/auth-recovery";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const RESET_PARAMS = ["code", "token_hash", "type", "error_description", "error_code"] as const;

function resetRedirect(origin: string, source: URLSearchParams, keys: readonly string[]) {
  const reset = new URL("/reset-password", origin);
  for (const key of keys) {
    const value = source.get(key);
    if (value) reset.searchParams.set(key, value);
  }
  return NextResponse.redirect(reset);
}

/** Handles the redirect back from Supabase OAuth and email confirmation links. */
export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const code = url.searchParams.get("code");
  const type = url.searchParams.get("type");
  const tokenHash = url.searchParams.get("token_hash");
  const errorCode = url.searchParams.get("error_code");
  const errorDescription = url.searchParams.get("error_description");
  const oauthError = errorDescription || url.searchParams.get("error");

  // Recovery links must finish in the browser. Exchanging the code here fails
  // when the email was opened without the PKCE cookie, and that used to bounce
  // people to the login page.
  if (type === "recovery" || tokenHash) {
    return resetRedirect(url.origin, url.searchParams, RESET_PARAMS);
  }

  if (oauthError && isEmailLinkFailure(errorCode, errorDescription || oauthError)) {
    return resetRedirect(url.origin, url.searchParams, ["error_description", "error_code"]);
  }

  if (oauthError) {
    const login = new URL("/login", url.origin);
    login.searchParams.set("error", "auth");
    return NextResponse.redirect(login);
  }

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      if (isPkceVerifierMissing(error)) {
        const reset = new URL("/reset-password", url.origin);
        reset.searchParams.set("code", code);
        return NextResponse.redirect(reset);
      }
      if (isEmailLinkFailure(error.code ?? null, error.message)) {
        const reset = new URL("/reset-password", url.origin);
        reset.searchParams.set("error_description", error.message);
        return NextResponse.redirect(reset);
      }
      const login = new URL("/login", url.origin);
      login.searchParams.set("error", "auth");
      return NextResponse.redirect(login);
    }

    const redirectType = (data as { redirectType?: string | null }).redirectType;
    if (redirectType === "recovery" || isRecentRecovery(data.user?.recovery_sent_at)) {
      return NextResponse.redirect(new URL("/reset-password", url.origin));
    }
  }

  // Never put extra query params on the Supabase redirect URL — GoTrue rejects
  // nested `?` as "Invalid path specified in request URL". Role-based routing
  // happens in /auth/continue.
  return NextResponse.redirect(new URL("/auth/continue", url.origin));
}
