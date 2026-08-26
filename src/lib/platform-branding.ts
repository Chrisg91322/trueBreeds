const PHOTOS_BUCKET = "photos";

/**
 * Project URL only — never include `/rest/v1`. Some Vercel↔Supabase
 * integrations set NEXT_PUBLIC_SUPABASE_URL to the REST base by mistake.
 */
function supabaseProjectUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) return "";
  return raw.replace(/\/+$/, "").replace(/\/rest\/v1$/i, "");
}

function platformPhotoUrl(filename: string): string {
  const base = supabaseProjectUrl();
  if (!base) return "";
  return `${base}/storage/v1/object/public/${PHOTOS_BUCKET}/${encodeURIComponent(filename)}`;
}

export const PLATFORM_NAME = "trueBreeds";

/**
 * Prefer first-party `/public` assets so production never depends on a
 * Storage bucket existing. Fall back to the Supabase `photos` bucket when
 * those files are absent (e.g. older deploys).
 */
export const PLATFORM_LOGO_SRC = "/branding/logo2.png";

/** Marketing homepage hero. */
export const PLATFORM_HERO_URL = "/branding/pupsAndKittens4.png";

/** Optional remote copies (for tools / migration). */
export const PLATFORM_LOGO_REMOTE = platformPhotoUrl("logo2.png");
export const PLATFORM_HERO_REMOTE = platformPhotoUrl("pupsAndKittens4.png");
