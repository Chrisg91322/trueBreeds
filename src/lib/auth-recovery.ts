/** Password-reset link helpers. Kept free of server-only imports so tests can use them. */

const RECOVERY_WINDOW_MS = 24 * 60 * 60 * 1000;

export function passwordResetOrigin(requestOrigin: string | null, appUrl?: string | null) {
  const origin = (requestOrigin || "").replace(/\/$/, "");
  const configured = (appUrl || "").replace(/\/$/, "");
  if (origin && /localhost|127\.0\.0\.1/.test(origin)) return origin;
  if (origin.startsWith("https://")) return origin;
  if (configured) return configured;
  return origin || "https://www.truebreeds.com";
}

/** Link opened from the reset email. One query string, no nested `?` for GoTrue. */
export function passwordResetUrl(origin: string, tokenHash: string) {
  const url = new URL("/reset-password", origin);
  url.searchParams.set("token_hash", tokenHash);
  url.searchParams.set("type", "recovery");
  return url.toString();
}

export function passwordResetEmail(link: string) {
  const href = link.replace(/&/g, "&amp;");
  return {
    subject: "Reset your TrueBreeds password",
    text: `Choose a new TrueBreeds password:\n${link}\n\nIf you didn’t ask for this, you can ignore this email.`,
    html: `<p>Choose a new password for your TrueBreeds account.</p>
<p><a href="${href}">Reset password</a></p>
<p>If you didn’t ask for this, you can ignore this email.</p>`,
  };
}

export function isUnknownAccountError(error: { message?: string; status?: number; code?: string }) {
  if (error.status === 404) return true;
  const text = `${error.code || ""} ${error.message || ""}`.toLowerCase();
  return text.includes("not found") || text.includes("user_not_found");
}

export function isPkceVerifierMissing(error: { message?: string; code?: string }) {
  if (error.code === "pkce_code_verifier_not_found") return true;
  const text = (error.message || "").toLowerCase();
  return text.includes("code verifier");
}

/** Supabase email-link failures, as opposed to a Google OAuth denial. */
export function isEmailLinkFailure(errorCode: string | null, description: string | null) {
  const code = (errorCode || "").toLowerCase();
  const desc = (description || "").toLowerCase();
  return (
    code.includes("otp") ||
    code.includes("flow_state") ||
    desc.includes("email link") ||
    desc.includes("code verifier") ||
    desc.includes("flow state")
  );
}

export function friendlyResetError(message: string) {
  const text = message.toLowerCase();
  if (
    text.includes("expired") ||
    text.includes("invalid") ||
    text.includes("otp") ||
    text.includes("flow state")
  ) {
    return "This reset link is invalid or has expired. Request a new one.";
  }
  if (text.includes("code verifier") || text.includes("pkce")) {
    return "This reset link didn’t finish in this browser. Request a new one and open it here.";
  }
  return "This reset link is missing or expired. Request a new one.";
}

export function isRecentRecovery(recoverySentAt: string | null | undefined, now = Date.now()) {
  if (!recoverySentAt) return false;
  const sent = new Date(recoverySentAt).getTime();
  if (Number.isNaN(sent)) return false;
  return now - sent < RECOVERY_WINDOW_MS;
}

/**
 * Where a stray `?code=` on the platform domain should go.
 * `/reset-password` keeps the code so the browser can finish the link.
 */
export function authCodeForward(
  pathname: string,
  params: { code: string | null; type: string | null }
): "/auth/callback" | "/reset-password" | null {
  if (!params.code) return null;
  if (pathname.startsWith("/auth/")) return null;
  if (pathname === "/reset-password") return null;
  if (params.type === "recovery") return "/reset-password";
  return "/auth/callback";
}
