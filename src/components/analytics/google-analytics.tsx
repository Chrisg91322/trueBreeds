import { GoogleAnalytics as NextGoogleAnalytics } from "@next/third-parties/google";

/**
 * GA4 loader matching Google's gtag.js snippet. Pass a Measurement ID (G-XXXXXXXX).
 * Used for the platform marketing site and Premium tenant sites with their own property.
 */
export function GoogleAnalytics({ measurementId }: { measurementId?: string | null }) {
  const id = measurementId?.trim();
  if (!id || !/^G-[A-Z0-9]+$/i.test(id)) return null;

  return <NextGoogleAnalytics gaId={id} />;
}
