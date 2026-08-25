import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export function tenantCacheTag(slug: string) {
  return `tenant:${slug}`;
}

/** Full public-site payload for a tenant, cached + revalidated by tag whenever dashboard content changes (see revalidateTenant()). */
export const getPublicTenant = unstable_cache(
  async (slug: string) => {
    const tenant = await prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) return null;

    const [animals, litters, testimonials, faqItems, media, affiliateProducts] =
      await Promise.all([
        prisma.animal.findMany({
          where: { tenantId: tenant.id, isRetired: false },
          orderBy: { createdAt: "desc" },
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
  },
  ["public-tenant"],
  { revalidate: 60, tags: ["tenant"] }
);

export type PublicTenantData = NonNullable<Awaited<ReturnType<typeof getPublicTenant>>>;
