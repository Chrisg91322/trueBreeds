import { describe, expect, it } from "vitest";
import {
  authCodeForward,
  friendlyResetError,
  isEmailLinkFailure,
  isPkceVerifierMissing,
  isRecentRecovery,
  isUnknownAccountError,
  passwordResetEmail,
  passwordResetOrigin,
  passwordResetUrl,
} from "@/lib/auth-recovery";

describe("password reset links", () => {
  it("builds a single-query reset url the browser can verify", () => {
    const link = passwordResetUrl("https://www.truebreeds.com", "abc123");
    const url = new URL(link);
    expect(url.origin + url.pathname).toBe("https://www.truebreeds.com/reset-password");
    expect(url.searchParams.get("token_hash")).toBe("abc123");
    expect(url.searchParams.get("type")).toBe("recovery");
    expect(link.split("?").length).toBe(2);
  });

  it("keeps local requests on localhost and production requests on https", () => {
    expect(passwordResetOrigin("http://localhost:3002", "https://www.truebreeds.com")).toBe(
      "http://localhost:3002"
    );
    expect(passwordResetOrigin("https://www.truebreeds.com", "http://localhost:3002")).toBe(
      "https://www.truebreeds.com"
    );
  });

  it("escapes the link in the email html", () => {
    const link = passwordResetUrl("https://www.truebreeds.com", "tok");
    const email = passwordResetEmail(link);
    expect(email.html).toContain("token_hash=tok&amp;type=recovery");
    expect(email.text).toContain(link);
  });
});

describe("auth code forwarding", () => {
  it("leaves the reset page alone and sends recovery codes there", () => {
    expect(authCodeForward("/reset-password", { code: "c", type: null })).toBeNull();
    expect(authCodeForward("/auth/callback", { code: "c", type: "recovery" })).toBeNull();
    expect(authCodeForward("/", { code: "c", type: "recovery" })).toBe("/reset-password");
    expect(authCodeForward("/", { code: "c", type: null })).toBe("/auth/callback");
    expect(authCodeForward("/login", { code: null, type: "recovery" })).toBeNull();
  });
});

describe("reset link errors", () => {
  it("recognizes email-link failures and a missing pkce verifier", () => {
    expect(isEmailLinkFailure("otp_expired", "Email link is invalid or has expired")).toBe(true);
    expect(isEmailLinkFailure(null, "The user denied the request")).toBe(false);
    expect(isPkceVerifierMissing({ code: "pkce_code_verifier_not_found" })).toBe(true);
    expect(isPkceVerifierMissing({ message: "Invalid login credentials" })).toBe(false);
    expect(friendlyResetError("Email link is invalid or has expired")).toMatch(/expired/);
    expect(isUnknownAccountError({ status: 404, message: "User not found" })).toBe(true);
    expect(isRecentRecovery(new Date().toISOString())).toBe(true);
    expect(isRecentRecovery(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString())).toBe(
      false
    );
  });
});
