import "server-only";
import { headers } from "next/headers";
import { unstable_cache, unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/lib/prisma";
import { PREVIEW_HEADER } from "@/lib/preview";

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

function cachedPublicTenant(slug: string) {
  return unstable_cache(() => loadTenantSiteData(slug), ["public-tenant", slug], {
    revalidate: 60,
    tags: [tenantCacheTag(slug), "tenant"],
  })();
}

/**
 * Full public-site payload for a tenant. Cached for live sites; always fresh
 * during owner /preview so onboarding changes show up immediately.
 * Tagged per-slug so reservations/leads can bust the cache immediately.
 */
export async function getPublicTenant(slug: string) {
  const headerStore = await headers();
  if (headerStore.get(PREVIEW_HEADER) === "1") {
    noStore();
    return loadTenantSiteData(slug);
  }
  return cachedPublicTenant(slug);
}

export type PublicTenantData = NonNullable<Awaited<ReturnType<typeof getPublicTenant>>>;
