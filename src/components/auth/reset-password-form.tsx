"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import type { EmailOtpType } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { friendlyResetError, isRecentRecovery } from "@/lib/auth-recovery";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const OTP_TYPES = new Set<EmailOtpType>([
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email",
  "email_change",
]);

const recoveryAttempts = new Map<string, Promise<string | null>>();

function once(key: string, run: () => Promise<string | null>) {
  const existing = recoveryAttempts.get(key);
  if (existing) return existing;
  const promise = run();
  recoveryAttempts.set(key, promise);
  return promise;
}

export function ResetPasswordForm() {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "ready" | "error">("checking");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function establish() {
      const params = new URLSearchParams(window.location.search);
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const code = params.get("code");
      const tokenHash = params.get("token_hash");
      const typeParam = params.get("type") || hash.get("type");
      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");
      const linkError = params.get("error_description") || hash.get("error_description") || params.get("error");

      if (linkError && !code && !tokenHash && !accessToken) {
        if (!cancelled) {
          setError(friendlyResetError(linkError));
          setStatus("error");
        }
        return;
      }

      const supabase = createSupabaseBrowserClient();
      const attemptKey = code || tokenHash || accessToken || "session";
      const sessionError = await once(attemptKey, async () => {
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          return exchangeError?.message ?? null;
        }
        if (tokenHash) {
          const otpType = OTP_TYPES.has(typeParam as EmailOtpType)
            ? (typeParam as EmailOtpType)
            : "recovery";
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: otpType,
          });
          return verifyError?.message ?? null;
        }
        if (accessToken && refreshToken) {
          const { error: sessionSetError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          return sessionSetError?.message ?? null;
        }
        return null;
      });

      if (code || tokenHash || accessToken) {
        window.history.replaceState({}, "", "/reset-password");
      }

      const { data } = await supabase.auth.getUser();
      if (cancelled) return;

      if (!data.user) {
        setError(
          sessionError
            ? friendlyResetError(sessionError)
            : "This reset link is missing or expired. Request a new one."
        );
        setStatus("error");
        return;
      }

      const openedFromLink = Boolean(code || tokenHash || accessToken);
      const recovery =
        typeParam === "recovery" || isRecentRecovery(data.user.recovery_sent_at);
      if (openedFromLink && !recovery) {
        router.replace("/auth/continue");
        return;
      }

      setStatus("ready");
    }

    void establish();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password"));
    const confirm = String(form.get("confirm"));
    if (password !== confirm) {
      setError("Those passwords don’t match.");
      setLoading(false);
      return;
    }

    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      setError("This reset link is missing or expired. Request a new one.");
      setStatus("error");
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    router.push("/auth/continue");
    router.refresh();
  }

  if (status === "checking") {
    return (
      <div className="flex w-full max-w-sm items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Checking your reset link…
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="w-full max-w-sm space-y-4 text-center">
        <h1 className="text-2xl font-semibold">Reset link didn’t work</h1>
        <p className="text-sm text-destructive">{error}</p>
        <p className="text-sm text-muted-foreground">
          <Link href="/forgot-password" className="font-medium text-primary hover:underline">
            Request a new link
          </Link>
          <span> · </span>
          <Link href="/login" className="font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Choose a new password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Use at least 8 characters. You’ll be signed in after saving it.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="password">New password</Label>
          <Input id="password" name="password" type="password" minLength={8} required className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="confirm">Confirm password</Label>
          <Input id="confirm" name="confirm" type="password" minLength={8} required className="mt-1.5" />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save password
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/forgot-password" className="font-medium text-primary hover:underline">
          Request a new link
        </Link>
      </p>
    </div>
  );
}
