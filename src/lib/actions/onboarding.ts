"use server";

import { revalidatePath } from "next/cache";
import slugify from "slugify";
import { nanoid } from "nanoid";
import { getSessionContext } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ThemePresetKey } from "@/lib/theme";

/** Creates a placeholder tenant for a freshly signed-up user, if they don't have one yet. Idempotent. */
export async function ensureTenantForCurrentUser() {
  const session = await getSessionContext();
  if (!session) throw new Error("Not authenticated");
  if (session.tenantId) return session.tenantId;

  const baseSlug = slugify(session.email.split("@")[0], { lower: true, strict: true }) || "kennel";
  let slug = baseSlug;
  let attempt = 0;
  while (await prisma.tenant.findUnique({ where: { slug } })) {
    attempt += 1;
    slug = `${baseSlug}-${nanoid(4).toLowerCase()}`;
    if (attempt > 5) break;
  }

  const tenant = await prisma.tenant.create({
    data: {
      slug,
      kennelName: "My Kennel",
      status: "onboarding",
      onboarding: { create: {} },
      members: { create: { userId: session.userId, role: "owner" } },
    },
  });

  return tenant.id;
}

export async function updateTenantProfile(
  tenantId: string,
  data: { kennelName: string; slug: string; species: "dog" | "cat"; breeds: string[] }
) {
  const existingSlugOwner = await prisma.tenant.findUnique({ where: { slug: data.slug } });
  if (existingSlugOwner && existingSlugOwner.id !== tenantId) {
    throw new Error("That URL is already taken — try another.");
  }

  await prisma.tenant.update({ where: { id: tenantId }, data });

  await prisma.onboardingProgress.upsert({
    where: { tenantId },
    update: { profileComplete: true },
    create: { tenantId, profileComplete: true },
  });

  revalidatePath("/onboarding");
  revalidatePath("/dashboard");
}

export async function updateTenantTheme(
  tenantId: string,
  data: {
    themePreset: ThemePresetKey;
    accentColor: string;
    logoUrl?: string | null;
    heroImageUrl?: string | null;
    faviconUrl?: string | null;
    tagline?: string;
  }
) {
  await prisma.tenant.update({ where: { id: tenantId }, data });
  await prisma.onboardingProgress.upsert({
    where: { tenantId },
    update: { themeComplete: true },
    create: { tenantId, themeComplete: true },
  });
  revalidatePath("/onboarding");
}

export async function markOnboardingStep(
  tenantId: string,
  step: "firstLitterComplete" | "stripeConnected" | "socialsComplete"
) {
  await prisma.onboardingProgress.upsert({
    where: { tenantId },
    update: { [step]: true },
    create: { tenantId, [step]: true },
  });
  revalidatePath("/onboarding");
}

export async function createFirstLitter(
  tenantId: string,
  data: { species: "dog" | "cat"; breed?: string; status: "planned" | "expecting" | "active" }
) {
  const litter = await prisma.litter.create({
    data: {
      tenantId,
      species: data.species,
      breed: data.breed || null,
      status: data.status,
    },
  });

  await prisma.onboardingProgress.upsert({
    where: { tenantId },
    update: { firstLitterComplete: true },
    create: { tenantId, firstLitterComplete: true },
  });

  revalidatePath("/onboarding");
  return litter;
}

export async function publishTenant(tenantId: string) {
  const session = await getSessionContext();
  if (!session?.tenantId || session.tenantId !== tenantId) {
    throw new Error("Not authorized");
  }

  const progress = await prisma.onboardingProgress.findUnique({ where: { tenantId } });
  if (!progress?.billingComplete) {
    throw new Error("Subscribe to a membership before publishing your site.");
  }

  await prisma.$transaction([
    prisma.tenant.update({ where: { id: tenantId }, data: { status: "active" } }),
    prisma.onboardingProgress.upsert({
      where: { tenantId },
      update: { published: true },
      create: { tenantId, published: true, billingComplete: true },
    }),
  ]);
  revalidatePath("/onboarding");
  revalidatePath("/dashboard");
}

/**
 * Sites that were marked published without a paid membership go back to
 * onboarding so public pages stay offline until they subscribe and publish.
 */
export async function revokeUnpaidPublish(tenantId: string) {
  const progress = await prisma.onboardingProgress.findUnique({ where: { tenantId } });
  if (!progress || progress.billingComplete || !progress.published) return;

  await prisma.$transaction([
    prisma.tenant.update({
      where: { id: tenantId },
      data: { status: "onboarding" },
    }),
    prisma.onboardingProgress.update({
      where: { tenantId },
      data: { published: false },
    }),
  ]);
}

/** Marks the first-run dashboard welcome tour as finished or skipped. */
export async function completeDashboardTour() {
  const session = await getSessionContext();
  if (!session?.tenantId) throw new Error("Not authenticated");

  await prisma.onboardingProgress.upsert({
    where: { tenantId: session.tenantId },
    update: { dashboardTourSeen: true },
    create: { tenantId: session.tenantId, dashboardTourSeen: true },
  });
  revalidatePath("/dashboard");
}

/** Re-opens the tour by clearing the seen flag (e.g. Help → Replay tour). */
export async function resetDashboardTour() {
  const session = await getSessionContext();
  if (!session?.tenantId) throw new Error("Not authenticated");

  await prisma.onboardingProgress.upsert({
    where: { tenantId: session.tenantId },
    update: { dashboardTourSeen: false },
    create: { tenantId: session.tenantId, dashboardTourSeen: false },
  });
  revalidatePath("/dashboard");
}
