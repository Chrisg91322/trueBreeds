import type { Metadata } from "next";

/** Allow only http(s) URLs in <link rel="icon"> so pasted javascript: values never ship. */
export function safePublicImageUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return value;
  } catch {
    return null;
  }
}

/**
 * Tenant tab icon: dedicated favicon URL, then kennel logo, otherwise inherit
 * the platform icon from the root layout.
 */
export function tenantSiteIcons(
  faviconUrl?: string | null,
  logoUrl?: string | null
): Metadata["icons"] | undefined {
  const url = safePublicImageUrl(faviconUrl) || safePublicImageUrl(logoUrl);
  if (!url) return undefined;
  return {
    icon: [{ url }],
    apple: [{ url }],
  };
}
