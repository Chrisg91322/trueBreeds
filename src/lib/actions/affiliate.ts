"use server";

import { revalidatePath } from "next/cache";
import { requireTenantSession } from "@/lib/auth";
import { forTenant } from "@/lib/db";
import { prisma } from "@/lib/prisma";

/** Appends/replaces the Amazon Associates `tag` query param on a product URL. */
function buildAffiliateUrl(originalUrl: string, associatesTag: string) {
  const url = new URL(originalUrl);
  url.searchParams.set("tag", associatesTag);
  return url.toString();
}

export async function updateAmazonSettings(formData: FormData) {
  const session = await requireTenantSession();
  const associatesTag = String(formData.get("associatesTag") || "").trim();

  const settings = await prisma.amazonSettings.upsert({
    where: { tenantId: session.tenantId },
    update: { associatesTag: associatesTag || null, isConfigured: !!associatesTag },
    create: { tenantId: session.tenantId, associatesTag: associatesTag || null, isConfigured: !!associatesTag },
  });

  if (associatesTag) {
    const products = await prisma.affiliateProduct.findMany({ where: { tenantId: session.tenantId } });
    await Promise.all(
      products.map((p) =>
        prisma.affiliateProduct.update({
          where: { id: p.id },
          data: { affiliateUrl: buildAffiliateUrl(p.originalUrl, associatesTag) },
        })
      )
    );
  }

  revalidatePath("/dashboard/affiliate");
  return settings;
}

export async function createAffiliateProduct(formData: FormData) {
  const session = await requireTenantSession();
  const db = forTenant(session.tenantId);

  const originalUrl = String(formData.get("originalUrl") || "").trim();
  if (!originalUrl) throw new Error("Product URL is required");

  const settings = await prisma.amazonSettings.findUnique({ where: { tenantId: session.tenantId } });
  if (!settings?.associatesTag) {
    throw new Error("Add your Amazon Associates tag before adding products");
  }

  const count = await db.affiliateProduct.count();

  await db.affiliateProduct.create({
    data: {
      tenantId: session.tenantId,
      originalUrl,
      affiliateUrl: buildAffiliateUrl(originalUrl, settings.associatesTag),
      title: String(formData.get("title") || "") || null,
      imageUrl: String(formData.get("imageUrl") || "") || null,
      price: String(formData.get("price") || "") || null,
      category: String(formData.get("category") || "other"),
      sortOrder: count,
    },
  });

  revalidatePath("/dashboard/affiliate");
  revalidatePath(`/${session.tenantSlug}/recommended`);
}

export async function updateAffiliateProduct(productId: string, formData: FormData) {
  const session = await requireTenantSession();
  const db = forTenant(session.tenantId);

  const originalUrl = String(formData.get("originalUrl") || "").trim();
  const settings = await prisma.amazonSettings.findUnique({ where: { tenantId: session.tenantId } });

  await db.affiliateProduct.update({
    where: { id: productId },
    data: {
      originalUrl,
      affiliateUrl: settings?.associatesTag ? buildAffiliateUrl(originalUrl, settings.associatesTag) : originalUrl,
      title: String(formData.get("title") || "") || null,
      imageUrl: String(formData.get("imageUrl") || "") || null,
      price: String(formData.get("price") || "") || null,
      category: String(formData.get("category") || "other"),
    },
  });

  revalidatePath("/dashboard/affiliate");
  revalidatePath(`/${session.tenantSlug}/recommended`);
}

export async function toggleAffiliateProductPublished(productId: string, isPublished: boolean) {
  const session = await requireTenantSession();
  const db = forTenant(session.tenantId);
  await db.affiliateProduct.update({ where: { id: productId }, data: { isPublished } });
  revalidatePath("/dashboard/affiliate");
  revalidatePath(`/${session.tenantSlug}/recommended`);
}

export async function deleteAffiliateProduct(productId: string) {
  const session = await requireTenantSession();
  const db = forTenant(session.tenantId);
  await db.affiliateProduct.delete({ where: { id: productId } });
  revalidatePath("/dashboard/affiliate");
  revalidatePath(`/${session.tenantSlug}/recommended`);
}

export async function moveAffiliateProduct(productId: string, direction: "up" | "down") {
  const session = await requireTenantSession();
  const db = forTenant(session.tenantId);

  const products = await db.affiliateProduct.findMany({ orderBy: { sortOrder: "asc" } });
  const index = products.findIndex((p) => p.id === productId);
  if (index === -1) return;

  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= products.length) return;

  const a = products[index];
  const b = products[swapWith];

  await db.$transaction([
    db.affiliateProduct.update({ where: { id: a.id }, data: { sortOrder: b.sortOrder } }),
    db.affiliateProduct.update({ where: { id: b.id }, data: { sortOrder: a.sortOrder } }),
  ]);

  revalidatePath("/dashboard/affiliate");
}
