# Auth setup — Google + confirmation email

TrueBreeds uses **Supabase Auth** for login. App mail (leads, deposits) uses
**Resend**. Signup confirmation emails are **not** sent by Resend unless you
wire Resend as Supabase’s custom SMTP.

## What’s broken today (project `mzmpjbyvqmtaysjmzsup`)

| Symptom | Cause |
|--------|--------|
| Continue with Google fails | Google provider is **disabled** (`external.google: false`) |
| No confirmation email / “Check your email” then nothing | Built-in Supabase mail is rate-limited (`over_email_send_rate_limit`) and unreliable; needs custom SMTP |

## 1. Enable Google OAuth

1. [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
   → create an **OAuth 2.0 Client ID** (Web application).
2. Authorized redirect URI — use the exact URL shown in Supabase under
   *Authentication → Providers → Google* (looks like
   `https://mzmpjbyvqmtaysjmzsup.supabase.co/auth/v1/callback`).
3. Supabase → *Authentication → Providers → Google* → enable → paste Client ID
   and Client Secret → Save.
4. *Authentication → URL Configuration* — Site URL
   `https://www.truebreeds.com`, and Redirect URLs include:
   - `https://www.truebreeds.com/auth/callback`
   - `https://truebreeds.com/auth/callback`
   - `http://localhost:3002/auth/callback`
   - `http://127.0.0.1:3002/auth/callback`

## 2. Confirmation emails (custom SMTP via Resend)

1. Create a real Resend API key and verify your domain (see README §3).
2. Put `RESEND_API_KEY` / `EMAIL_FROM` in `.env` **and** Vercel (app mail).
3. Supabase → *Project Settings → Authentication → SMTP Settings* (or
   *Authentication → Emails → SMTP*):
   - Host: `smtp.resend.com`
   - Port: `465`
   - Username: `resend`
   - Password: your `re_…` API key
   - Sender email: an address on your verified Resend domain
     (e.g. `noreply@mail.truebreeds.com`)
4. Keep *Confirm email* enabled for production. Until SMTP is configured,
   expect rate limits and missing inbox delivery on the default provider.

## 3. Unblock a stuck signup right now

If an account was created but never confirmed, confirm it in Supabase
(*Authentication → Users → user → Confirm*), or with the Admin API
(`email_confirm: true`). Password login then works without the email link.

## Quick verify

```bash
# Google must redirect to accounts.google.com (not 400 "provider is not enabled")
curl -sI "https://mzmpjbyvqmtaysjmzsup.supabase.co/auth/v1/authorize?provider=google&redirect_to=https%3A%2F%2Fwww.truebreeds.com%2Fauth%2Fcallback" | head -5

# Auth settings (anon key)
curl -s "https://mzmpjbyvqmtaysjmzsup.supabase.co/auth/v1/settings" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" | jq '{google: .external.google, autoconfirm: .mailer_autoconfirm}'
```
