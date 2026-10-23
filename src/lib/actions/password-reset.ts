"use server";

import { headers } from "next/headers";
import { messenger } from "@/lib/messenger/notifications";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import {
  isUnknownAccountError,
  passwordResetEmail,
  passwordResetOrigin,
  passwordResetUrl,
} from "@/lib/auth-recovery";

export async function requestPasswordReset(
  email: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const normalized = email.trim().toLowerCase();
  if (!normalized.includes("@")) {
    return { ok: false, error: "Enter the email on your account." };
  }

  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") || headerList.get("host");
  const proto = headerList.get("x-forwarded-proto") || "http";
  const requestOrigin = host ? `${proto}://${host}` : null;
  const origin = passwordResetOrigin(requestOrigin, process.env.NEXT_PUBLIC_APP_URL);

  const supabase = createSupabaseServiceRoleClient();
  let { data, error } = await supabase.auth.admin.generateLink({
    type: "recovery",
    email: normalized,
    options: { redirectTo: `${origin}/auth/callback` },
  });

  if (error && /redirect|invalid path|url/i.test(error.message)) {
    const retry = await supabase.auth.admin.generateLink({
      type: "recovery",
      email: normalized,
    });
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    const message = error.message.toLowerCase();
    if (message.includes("rate limit") || message.includes("too many")) {
      return {
        ok: false,
        error: "Too many reset emails were sent. Wait a few minutes, then try again.",
      };
    }
    if (isUnknownAccountError(error)) return { ok: true };
    console.error("password reset link failed", error.message);
    return { ok: false, error: "Couldn’t send the reset email. Try again in a minute." };
  }

  const tokenHash = data.properties?.hashed_token;
  if (!tokenHash) return { ok: true };

  const message = passwordResetEmail(passwordResetUrl(origin, tokenHash));
  try {
    const sent = await messenger.send({
      to: normalized,
      subject: message.subject,
      html: message.html,
      text: message.text,
    });
    if ("skipped" in sent) {
      return { ok: false, error: "Couldn’t send the reset email. Try again in a minute." };
    }
  } catch (err) {
    console.error("password reset email failed", err instanceof Error ? err.message : "send failed");
    return { ok: false, error: "Couldn’t send the reset email. Try again in a minute." };
  }

  return { ok: true };
}
