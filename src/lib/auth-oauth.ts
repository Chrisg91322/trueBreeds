/** Shared OAuth helpers for browser auth forms. */

export function authCallbackUrl(origin = window.location.origin) {
  return `${origin}/auth/callback`;
}

/**
 * Start Google OAuth. Returns an error message when the provider is disabled
 * or the redirect fails — callers previously ignored this and looked "broken".
 */
export async function signInWithGoogle(
  supabase: {
    auth: {
      signInWithOAuth: (args: {
        provider: "google";
        options: { redirectTo: string };
      }) => Promise<{ data: { url: string | null }; error: { message: string } | null }>;
    };
  },
  redirectTo = authCallbackUrl()
): Promise<string | null> {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });

  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("provider is not enabled") || msg.includes("unsupported provider")) {
      return "Google sign-in isn’t enabled yet. Use email/password, or enable Google in Supabase Auth → Providers.";
    }
    return error.message;
  }

  if (!data.url) {
    return "Couldn’t start Google sign-in. Try email/password instead.";
  }

  return null;
}
