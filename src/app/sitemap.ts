import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { classifyHostname } from "@/lib/tenant-resolve";
import { appOrigin, tenantSiteOrigin } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const host = (await headers()).get("host") || "";
  const resolution = classifyHostname(host);

  if (resolution.kind === "subdomain" || resolution.kind === "custom-domain") {
    const tenant =
      resolution.kind === "subdomain"
        ? await prisma.tenant.findUnique({
            where: { slug: resolution.slug },
            include: {
              onboarding: true,
              animals: { where: { isRetired: false }, select: { id: true, updatedAt: true } },
              offspring: {
                where: { status: { in: ["available", "deposit_received"] } },
                select: { id: true, updatedAt: true },
              },
              affiliateProducts: { where: { isPublished: true }, select: { id: true }, take: 1 },
            },
          })
        : await prisma.tenant.findFirst({
            where: {
              customDomain: resolution.hostname,
              customDomainStatus: "verified",
            },
            include: {
              onboarding: true,
              animals: { where: { isRetired: false }, select: { id: true, updatedAt: true } },
              offspring: {
                where: { status: { in: ["available", "deposit_received"] } },
                select: { id: true, updatedAt: true },
              },
              affiliateProducts: { where: { isPublished: true }, select: { id: true }, take: 1 },
            },
          });

    const published =
      !!tenant?.onboarding?.published &&
      !!tenant?.onboarding?.billingComplete &&
      tenant.status !== "suspended" &&
      tenant.status !== "cancelled";

    if (!tenant || !published) return [];

    const origin = tenantSiteOrigin(tenant.slug, tenant.customDomain);
    const now = tenant.updatedAt;
    const entries: MetadataRoute.Sitemap = [
      { url: origin, lastModified: now, changeFrequency: "weekly", priority: 1 },
      { url: `${origin}/our-dogs`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
      { url: `${origin}/available`, lastModified: now, changeFrequency: "daily", priority: 0.95 },
      { url: `${origin}/past-litters`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
      { url: `${origin}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
      { url: `${origin}/testimonials`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
      { url: `${origin}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
      { url: `${origin}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    ];

    if (tenant.affiliateProducts.length > 0) {
      entries.push({
        url: `${origin}/recommended`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }

    for (const animal of tenant.animals) {
      entries.push({
        url: `${origin}/our-dogs/${animal.id}`,
        lastModified: animal.updatedAt,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
    for (const pup of tenant.offspring) {
      entries.push({
        url: `${origin}/available/${pup.id}`,
        lastModified: pup.updatedAt,
        changeFrequency: "daily",
        priority: 0.85,
      });
    }

    return entries;
  }

  const origin = appOrigin();
  return [
    { url: origin, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${origin}/signup`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${origin}/login`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${origin}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${origin}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
  ];
}
