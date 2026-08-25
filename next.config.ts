import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Breeders paste arbitrary image URLs (logos, hero photos, animal
    // photos, Amazon product images) — there's no managed upload/CDN yet,
    // so we allow any https host rather than maintaining an allowlist.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
