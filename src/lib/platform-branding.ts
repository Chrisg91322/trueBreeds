const PHOTOS_BUCKET = "photos";

function platformPhotoUrl(filename: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return "";
  return `${base}/storage/v1/object/public/${PHOTOS_BUCKET}/${encodeURIComponent(filename)}`;
}

export const PLATFORM_NAME = "trueBreeds";

/** Brand mark in the Supabase `photos` bucket. Favicon files in `src/app/` are derived from the same image. */
export const PLATFORM_LOGO_SRC = platformPhotoUrl("logo2.png");

/** Marketing homepage hero background in the Supabase `photos` bucket. */
export const PLATFORM_HERO_URL = platformPhotoUrl("pupsAndKittens4.png");
