import "server-only";
import { prisma } from "@/lib/prisma";
import type { PlanTier, PlatformSubscription, SubscriptionStatus } from "@prisma/client";

const ACTIVE_STATUSES: SubscriptionStatus[] = ["active", "trialing", "grace_period"];

export function subscriptionIsActive(
  sub: Pick<PlatformSubscription, "status"> | null | undefined
) {
  return !!sub && ACTIVE_STATUSES.includes(sub.status);
}

export function hasPremiumGrowthTools(
  sub: Pick<PlatformSubscription, "plan" | "status"> | null | undefined
) {
  return subscriptionIsActive(sub) && sub?.plan === "premium";
}

export async function getTenantSubscription(tenantId: string) {
  return prisma.platformSubscription.findUnique({ where: { tenantId } });
}

export async function tenantHasPremiumGrowth(tenantId: string) {
  const sub = await getTenantSubscription(tenantId);
  return hasPremiumGrowthTools(sub);
}

/**
 * When a tenant buys or upgrades to Premium, seed SEO defaults so their
 * public site immediately has stronger titles/descriptions. Breeders can
 * refine these later in Settings → SEO & Analytics.
 */
export async function provisionPremiumSeoAnalytics(tenantId: string) {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) return;

  const speciesLabel = tenant.species === "cat" ? "cats" : "dogs";
  const breedLabel =
    tenant.breeds.length > 0 ? tenant.breeds.slice(0, 3).join(", ") : speciesLabel;

  const seoTitle =
    tenant.seoTitle?.trim() ||
    `${tenant.kennelName} | ${breedLabel} breeder`;

  const seoDescription =
    tenant.seoDescription?.trim() ||
    tenant.tagline?.trim() ||
    `${tenant.kennelName} raises health-tested ${breedLabel}. See available puppies, past litters, and contact the kennel.`;

  await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      seoTitle: seoTitle.slice(0, 70),
      seoDescription: seoDescription.slice(0, 160),
      seoProvisionedAt: tenant.seoProvisionedAt ?? new Date(),
    },
  });
}

export async function syncPremiumProvisioning(
  tenantId: string,
  plan: PlanTier | null | undefined
) {
  if (plan === "premium") {
    await provisionPremiumSeoAnalytics(tenantId);
  }
}
