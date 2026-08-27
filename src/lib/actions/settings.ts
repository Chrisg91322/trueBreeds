"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionContext, requireTenantSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPremiumGrowthTools } from "@/lib/entitlements";
import { sendTeamInvite } from "@/lib/messenger/notifications";
import type { ThemePresetKey } from "@/lib/theme";
import type { TenantMemberRole } from "@prisma/client";

export async function updateGeneralSettings(formData: FormData) {
  const session = await requireTenantSession();
  const kennelName = String(formData.get("kennelName") || "").trim();
  const slug = String(formData.get("slug") || "").trim().toLowerCase();
  const species = String(formData.get("species") || "dog") as "dog" | "cat";
  const breeds = String(formData.get("breeds") || "")
    .split(",")
    .map((b) => b.trim())
    .filter(Boolean);

  if (!kennelName) throw new Error("Kennel name is required");
  if (!/^[a-z0-9-]+$/.test(slug)) {
    throw new Error("URL can only contain lowercase letters, numbers, and hyphens");
  }

  const existing = await prisma.tenant.findUnique({ where: { slug } });
  if (existing && existing.id !== session.tenantId) {
    throw new Error("That URL is already taken — try another.");
  }

  await prisma.tenant.update({
    where: { id: session.tenantId },
    data: { kennelName, slug, species, breeds },
  });

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
}

export async function updateContactSettings(formData: FormData) {
  const session = await requireTenantSession();

  await prisma.tenant.update({
    where: { id: session.tenantId },
    data: {
      tagline: String(formData.get("tagline") || "") || null,
      contactEmail: String(formData.get("contactEmail") || "") || null,
      contactPhone: String(formData.get("contactPhone") || "") || null,
      address: String(formData.get("address") || "") || null,
      instagramUrl: String(formData.get("instagramUrl") || "") || null,
      facebookUrl: String(formData.get("facebookUrl") || "") || null,
      aboutHtml: String(formData.get("aboutHtml") || "") || null,
    },
  });

  revalidatePath("/dashboard/settings/contact");
  revalidatePath(`/${session.tenantSlug}`);
  revalidatePath(`/${session.tenantSlug}/about`);
  revalidatePath(`/${session.tenantSlug}/contact`);
}

export async function updatePolicySettings(formData: FormData) {
  const session = await requireTenantSession();

  await prisma.tenant.update({
    where: { id: session.tenantId },
    data: {
      depositPolicy: String(formData.get("depositPolicy") || "") || null,
      healthGuaranteeHtml: String(formData.get("healthGuaranteeHtml") || "") || null,
      contractHtml: String(formData.get("contractHtml") || "") || null,
      spayNeuterHtml: String(formData.get("spayNeuterHtml") || "") || null,
      faqHtml: String(formData.get("faqHtml") || "") || null,
    },
  });

  revalidatePath("/dashboard/settings/policies");
  revalidatePath(`/${session.tenantSlug}/faq`);
}

export async function updateThemeSettings(data: {
  themePreset: ThemePresetKey;
  accentColor: string;
  logoUrl?: string | null;
  heroImageUrl?: string | null;
  faviconUrl?: string | null;
  tagline?: string;
}) {
  const session = await requireTenantSession();
  await prisma.tenant.update({ where: { id: session.tenantId }, data });
  await prisma.onboardingProgress.upsert({
    where: { tenantId: session.tenantId },
    update: { themeComplete: true },
    create: { tenantId: session.tenantId, themeComplete: true },
  });
  revalidatePath("/dashboard/settings/theme");
  revalidatePath(`/${session.tenantSlug}`);
}

export async function updateSeoSettings(data: {
  seoTitle?: string | null;
  seoDescription?: string | null;
  googleSiteVerification?: string | null;
  gaMeasurementId?: string | null;
}) {
  const session = await requireTenantSession();
  const sub = await prisma.platformSubscription.findUnique({
    where: { tenantId: session.tenantId },
  });
  if (!hasPremiumGrowthTools(sub)) {
    throw new Error("SEO & Analytics requires Premium");
  }

  const ga = data.gaMeasurementId?.trim() || null;
  if (ga && !/^G-[A-Z0-9]+$/i.test(ga)) {
    throw new Error("GA4 Measurement ID should look like G-XXXXXXXXXX");
  }

  await prisma.tenant.update({
    where: { id: session.tenantId },
    data: {
      seoTitle: data.seoTitle?.slice(0, 70) || null,
      seoDescription: data.seoDescription?.slice(0, 160) || null,
      googleSiteVerification: data.googleSiteVerification?.slice(0, 120) || null,
      gaMeasurementId: ga,
    },
  });

  revalidatePath("/dashboard/settings/seo");
  revalidatePath(`/${session.tenantSlug}`);
}

export async function updateDomainSettings(formData: FormData) {
  const session = await requireTenantSession();
  const domain = String(formData.get("customDomain") || "").trim().toLowerCase();

  if (!domain) {
    await prisma.tenant.update({
      where: { id: session.tenantId },
      data: { customDomain: null, customDomainStatus: "none" },
    });
    revalidatePath("/dashboard/settings/domain");
    return;
  }

  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain)) {
    throw new Error("Enter a valid domain, e.g. www.yourkennel.com");
  }

  const existing = await prisma.tenant.findUnique({ where: { customDomain: domain } });
  if (existing && existing.id !== session.tenantId) {
    throw new Error("That domain is already connected to another site.");
  }

  await prisma.tenant.update({
    where: { id: session.tenantId },
    data: { customDomain: domain, customDomainStatus: "pending" },
  });

  revalidatePath("/dashboard/settings/domain");
}

export async function inviteTeamMember(formData: FormData) {
  const session = await requireTenantSession();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const role = (String(formData.get("role") || "staff") as TenantMemberRole) ?? "staff";

  if (!email || !email.includes("@")) throw new Error("Enter a valid email address");

  const [tenant, inviter, existingMember] = await Promise.all([
    prisma.tenant.findUniqueOrThrow({ where: { id: session.tenantId } }),
    prisma.user.findUniqueOrThrow({ where: { id: session.userId } }),
    prisma.tenantMember.findFirst({
      where: { tenantId: session.tenantId, user: { email } },
    }),
  ]);

  if (existingMember) throw new Error("That person is already a team member");

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const invite = await prisma.tenantInvite.create({
    data: {
      tenantId: session.tenantId,
      email,
      role,
      invitedById: session.userId,
      expiresAt,
    },
  });

  await sendTeamInvite({
    toEmail: email,
    tenant,
    invitedByName: inviter.fullName || inviter.email,
    role,
    token: invite.token,
  });

  revalidatePath("/dashboard/settings/team");
}

export async function cancelInvite(inviteId: string) {
  const session = await requireTenantSession();
  await prisma.tenantInvite.deleteMany({ where: { id: inviteId, tenantId: session.tenantId } });
  revalidatePath("/dashboard/settings/team");
}

export async function removeTeamMember(memberId: string) {
  const session = await requireTenantSession();
  const member = await prisma.tenantMember.findFirst({
    where: { id: memberId, tenantId: session.tenantId },
  });
  if (!member) throw new Error("Member not found");
  if (member.role === "owner") throw new Error("The owner cannot be removed");

  await prisma.tenantMember.delete({ where: { id: memberId } });
  revalidatePath("/dashboard/settings/team");
}

export async function changeMemberRole(memberId: string, role: TenantMemberRole) {
  const session = await requireTenantSession();
  await prisma.tenantMember.updateMany({
    where: { id: memberId, tenantId: session.tenantId, role: { not: "owner" } },
    data: { role },
  });
  revalidatePath("/dashboard/settings/team");
}

/** Accepts a team invite for the currently-signed-in user, joining that tenant. */
export async function acceptInvite(token: string) {
  const session = await getSessionContext();
  if (!session) redirect(`/login?next=/invite/${token}`);

  const invite = await prisma.tenantInvite.findUnique({ where: { token } });
  if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) {
    throw new Error("This invite is invalid or has expired");
  }
  if (invite.email.toLowerCase() !== session.email.toLowerCase()) {
    throw new Error(`This invite was sent to ${invite.email} — sign in with that email instead`);
  }

  await prisma.$transaction([
    prisma.tenantMember.upsert({
      where: { tenantId_userId: { tenantId: invite.tenantId, userId: session.userId } },
      update: { role: invite.role },
      create: { tenantId: invite.tenantId, userId: session.userId, role: invite.role },
    }),
    prisma.tenantInvite.update({ where: { id: invite.id }, data: { acceptedAt: new Date() } }),
  ]);

  redirect("/dashboard");
}
