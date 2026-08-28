import "server-only";
import { headers } from "next/headers";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export function tenantCacheTag(slug: string) {
  return `tenant:${slug}`;
}

async function loadTenantSiteData(slug: string) {
  const tenant = await prisma.tenant.findUnique({ where: { slug } });
  if (!tenant) return null;

  const [animals, litters, testimonials, faqItems, media, affiliateProducts] =
    await Promise.all([
      prisma.animal.findMany({
        where: { tenantId: tenant.id },
        orderBy: [{ isRetired: "asc" }, { createdAt: "desc" }],
      }),
      prisma.litter.findMany({
        where: { tenantId: tenant.id },
        include: {
          sire: true,
          dam: true,
          offspring: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.testimonial.findMany({
        where: { tenantId: tenant.id, isPublished: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.faqItem.findMany({
        where: { tenantId: tenant.id },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.media.findMany({
        where: { tenantId: tenant.id, entityType: "tenant" },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.affiliateProduct.findMany({
        where: { tenantId: tenant.id, isPublished: true },
        orderBy: { sortOrder: "asc" },
      }),
    ]);

  const availableOffspring = litters.flatMap((l) =>
    l.offspring
      .filter((o) => o.status === "available" || o.status === "deposit_received")
      .map((o) => ({ ...o, litter: l }))
  );

  const pastLitters = litters.filter((l) => l.status === "complete");
  const upcomingLitters = litters.filter(
    (l) => l.status === "planned" || l.status === "expecting"
  );

  return {
    tenant,
    animals,
    litters,
    availableOffspring,
    pastLitters,
    upcomingLitters,
    testimonials,
    faqItems,
    galleryMedia: media,
    affiliateProducts,
  };
}

const getCachedPublicTenant = unstable_cache(loadTenantSiteData, ["public-tenant"], {
  revalidate: 60,
  tags: ["tenant"],
});

/**
 * Full public-site payload for a tenant. Cached for live sites; always fresh
 * during owner /preview so onboarding changes show up immediately.
 */
export async function getPublicTenant(slug: string) {
  const headerStore = await headers();
  if (headerStore.get("x-truebreeds-preview") === "1") {
    return loadTenantSiteData(slug);
  }
  return getCachedPublicTenant(slug);
}

export type PublicTenantData = NonNullable<Awaited<ReturnType<typeof getPublicTenant>>>;
