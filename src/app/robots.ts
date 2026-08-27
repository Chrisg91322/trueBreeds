import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { classifyHostname } from "@/lib/tenant-resolve";
import { appOrigin, tenantSiteOrigin } from "@/lib/seo";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = (await headers()).get("host") || "";
  const resolution = classifyHostname(host);

  if (resolution.kind === "subdomain" || resolution.kind === "custom-domain") {
    const tenant =
      resolution.kind === "subdomain"
        ? await prisma.tenant.findUnique({
            where: { slug: resolution.slug },
            include: { onboarding: true, subscription: true },
          })
        : await prisma.tenant.findFirst({
            where: {
              customDomain: resolution.hostname,
              customDomainStatus: "verified",
            },
            include: { onboarding: true, subscription: true },
          });

    const published =
      !!tenant?.onboarding?.published &&
      !!tenant?.onboarding?.billingComplete &&
      tenant.status !== "suspended" &&
      tenant.status !== "cancelled";

    if (!tenant || !published) {
      return { rules: { userAgent: "*", disallow: "/" } };
    }

    const origin = tenantSiteOrigin(tenant.slug, tenant.customDomain);
    return {
      rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/preview"] },
      sitemap: `${origin}/sitemap.xml`,
      host: origin.replace(/^https?:\/\//, ""),
    };
  }

  const origin = appOrigin();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/onboarding", "/admin", "/api/", "/preview", "/auth/"],
    },
    sitemap: `${origin}/sitemap.xml`,
    host: origin.replace(/^https?:\/\//, ""),
  };
}
