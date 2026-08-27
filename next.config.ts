import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the Next.js "N" badge off the sidebar "View live site" button.
  devIndicators: {
    position: "bottom-right",
  },
  images: {
    // Breeders upload to Supabase Storage and may also paste arbitrary
    // image URLs (logos, hero photos, Amazon product images), so we allow
    // any https host rather than maintaining an allowlist.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
