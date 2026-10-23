"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { IMPERSONATION_COOKIE, requirePlatformAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe/client";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { PHOTOS_BUCKET } from "@/lib/storage";
import { websiteCreateBlock, websiteSlugFromName } from "@/lib/admin-site";
import { isPlanTier } from "@/lib/plans";
import { isSpecies } from "@/lib/species";
import { syncPremiumProvisioning } from "@/lib/entitlements";
import { requestPasswordReset } from "@/lib/actions/password-reset";

export type CreateWebsiteState = { error: string } | null;

/**
 * Creates a kennel, owner login, and manual membership, then opens that dashboard.
 */
export async function createWebsite(
  _prev: CreateWebsiteState,
  formData: FormData,
): Promise<CreateWebsiteState> {
  const admin = await requirePlatformAdmin();
  const kennelName = String(formData.get("kennelName") || "").trim();
  const ownerName = String(formData.get("ownerName") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const phone = String(formData.get("phone") || "").trim();
  const planValue = String(formData.get("plan") || "");
  const speciesValue = String(formData.get("species") || "");
  const slug = websiteSlugFromName(String(formData.get("slug") || kennelName));
  const sendLogin = formData.get("sendLogin") === "on";

  if (!kennelName) return { error: "Enter a kennel name." };
  if (!ownerName) return { error: "Enter the owner’s name." };
  if (!email.includes("@")) return { error: "Enter a valid email." };
  if (!phone) return { error: "Enter a phone number." };
  if (!slug) return { error: "Enter a site address." };
  if (!isPlanTier(planValue)) return { error: "Choose Basic, Pro, or Premium." };
  if (!isSpecies(speciesValue)) return { error: "Choose dog, cat, or livestock." };

  const [slugOwner, emailOwner] = await Promise.all([
    prisma.tenant.findUnique({ where: { slug }, select: { id: true } }),
    prisma.user.findUnique({ where: { email }, select: { id: true } }),
  ]);
  const blocked = websiteCreateBlock({
    slugTaken: !!slugOwner,
    emailTaken: !!emailOwner,
  });
  if (blocked) return { error: blocked };

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { error: "Site creation is unavailable until the service role key is configured." };
  }

  const supabase = createSupabaseServiceRoleClient();
  const { data: created, error: authError } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { full_name: ownerName },
  });
  if (authError || !created.user) {
    const message = authError?.message.toLowerCase() ?? "";
    if (message.includes("already") || message.includes("registered") || message.includes("exists")) {
      return { error: "That email already has a login." };
    }
    console.error("admin create user failed", authError?.message);
    return { error: "Couldn’t create the owner login. Try again." };
  }

  let tenantId: string;
  try {
    const tenant = await prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          id: created.user.id,
          email,
          fullName: ownerName,
          platformRole: "breeder_owner",
        },
      });
      const createdTenant = await tx.tenant.create({
        data: {
          slug,
          kennelName,
          species: speciesValue,
          status: "onboarding",
          contactEmail: email,
          contactPhone: phone,
          members: { create: { userId: created.user.id, role: "owner" } },
          onboarding: {
            create: {
              profileComplete: true,
              billingComplete: true,
              dashboardTourSeen: true,
            },
          },
          subscription: {
            create: {
              plan: planValue,
              status: "active",
              setupFeePaid: true,
            },
          },
        },
      });
      await tx.auditLog.create({
        data: {
          actorId: admin.userId,
          tenantId: createdTenant.id,
          action: "tenant.created",
          metadata: { slug, plan: planValue, species: speciesValue },
        },
      });
      return createdTenant;
    });
    tenantId = tenant.id;
  } catch (err) {
    await supabase.auth.admin.deleteUser(created.user.id);
    console.error("admin create website failed", err);
    const code = typeof err === "object" && err && "code" in err ? (err as { code?: string }).code : undefined;
    if (code === "P2002") {
      return { error: "That site address or email is already in use." };
    }
    return { error: "Couldn’t create the website. Try again." };
  }

  if (planValue === "premium") {
    await syncPremiumProvisioning(tenantId, planValue);
  }

  if (sendLogin) {
    const sent = await requestPasswordReset(email);
    if (!sent.ok) console.error("owner login email failed", sent.error);
  }

  await startImpersonation(tenantId);
  return null;
}

export async function sendOwnerLoginLink(formData: FormData) {
  await requirePlatformAdmin();
  const tenantId = String(formData.get("tenantId") || "");
  const owner = await prisma.tenantMember.findFirst({
    where: { tenantId, role: "owner" },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });
  if (!owner) redirect(`/admin/tenants/${tenantId}?login=missing`);
  const result = await requestPasswordReset(owner.user.email);
  redirect(`/admin/tenants/${tenantId}?login=${result.ok ? "sent" : "failed"}`);
}

export async function startImpersonation(tenantId: string) {
  await requirePlatformAdmin();
  (await cookies()).set(IMPERSONATION_COOKIE, tenantId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 2, // 2 hours
  });
  redirect("/dashboard");
}

export async function stopImpersonation() {
  (await cookies()).delete(IMPERSONATION_COOKIE);
  redirect("/admin/tenants");
}

export async function suspendTenant(tenantId: string) {
  const admin = await requirePlatformAdmin();
  await prisma.tenant.update({ where: { id: tenantId }, data: { status: "suspended" } });
  await prisma.auditLog.create({
    data: { actorId: admin.userId, tenantId, action: "tenant.suspended" },
  });
  revalidatePath("/admin/tenants");
  revalidatePath(`/admin/tenants/${tenantId}`);
}

export async function reactivateTenant(tenantId: string) {
  const admin = await requirePlatformAdmin();
  await prisma.tenant.update({ where: { id: tenantId }, data: { status: "active" } });
  await prisma.auditLog.create({
    data: { actorId: admin.userId, tenantId, action: "tenant.reactivated" },
  });
  revalidatePath("/admin/tenants");
  revalidatePath(`/admin/tenants/${tenantId}`);
}

export type DeleteAccountState = { error: string } | null;

/**
 * Permanently deletes a kennel account. Platform admins only.
 * Also removes logins that belong only to this kennel.
 */
export async function deleteTenant(
  _prev: DeleteAccountState,
  formData: FormData,
): Promise<DeleteAccountState> {
  const admin = await requirePlatformAdmin();
  const tenantId = String(formData.get("tenantId") || "");
  if (!tenantId) return { error: "Account not found" };

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: {
      subscription: true,
      members: { include: { user: true } },
    },
  });
  if (!tenant) return { error: "Account not found" };

  const usersToDelete: (typeof tenant.members)[number]["user"][] = [];
  for (const member of tenant.members) {
    const user = member.user;
    if (user.id === admin.userId || user.platformRole === "platform_admin") continue;
    const otherMemberships = await prisma.tenantMember.count({
      where: { userId: user.id, tenantId: { not: tenantId } },
    });
    if (otherMemberships === 0) usersToDelete.push(user);
  }

  const authError = await deleteAuthUsers(usersToDelete.map((user) => user.id));
  if (authError) return { error: authError };

  try {
    await prisma.$transaction(async (tx) => {
      await tx.deposit.deleteMany({ where: { tenantId } });
      await tx.balanceInvoice.deleteMany({ where: { tenantId } });
      await tx.leadNote.deleteMany({ where: { lead: { tenantId } } });
      await tx.lead.deleteMany({ where: { tenantId } });
      await tx.offspring.deleteMany({ where: { tenantId } });
      const animals = await tx.animal.findMany({
        where: { tenantId },
        select: { id: true },
      });
      const animalIds = animals.map((animal) => animal.id);
      if (animalIds.length > 0) {
        await tx.litter.updateMany({
          where: { sireId: { in: animalIds } },
          data: { sireId: null },
        });
        await tx.litter.updateMany({
          where: { damId: { in: animalIds } },
          data: { damId: null },
        });
      }
      await tx.litter.deleteMany({ where: { tenantId } });
      await tx.animal.deleteMany({ where: { tenantId } });
      await tx.auditLog.deleteMany({ where: { tenantId } });
      await tx.tenant.delete({ where: { id: tenantId } });

      for (const user of usersToDelete) {
        await tx.leadNote.updateMany({
          where: { authorId: user.id },
          data: { authorId: null },
        });
        await tx.auditLog.updateMany({
          where: { actorId: user.id },
          data: { actorId: null },
        });
        await tx.tenantInvite.updateMany({
          where: { invitedById: user.id },
          data: { invitedById: admin.userId },
        });
        await tx.user.delete({ where: { id: user.id } });
      }

      await tx.auditLog.create({
        data: {
          actorId: admin.userId,
          action: "tenant.deleted",
          metadata: {
            tenantId,
            kennelName: tenant.kennelName,
            slug: tenant.slug,
            deletedUsers: usersToDelete.map((user) => user.email),
          },
        },
      });
    });
  } catch (err) {
    console.error("Failed to delete tenant", tenantId, err);
    return {
      error:
        usersToDelete.length > 0
          ? "The login was removed, but the kennel record could not be deleted. Try again."
          : "Could not delete this account.",
    };
  }

  await cancelStripeSubscription(tenant.subscription?.stripeSubscriptionId);
  await removeTenantPhotos(tenantId);

  const cookieStore = await cookies();
  if (cookieStore.get(IMPERSONATION_COOKIE)?.value === tenantId) {
    cookieStore.delete(IMPERSONATION_COOKIE);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/users");
  revalidatePath("/admin/tenants");
  redirect("/admin/tenants");
}

async function deleteAuthUsers(userIds: string[]) {
  if (userIds.length === 0) return null;
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return "Account deletion is unavailable until the service role key is configured.";
  }

  const supabase = createSupabaseServiceRoleClient();
  for (const userId of userIds) {
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error && !/not found/i.test(error.message)) {
      return "Could not remove the login for this account. It was not deleted.";
    }
  }
  return null;
}

async function cancelStripeSubscription(subscriptionId: string | null | undefined) {
  const key = process.env.STRIPE_SECRET_KEY || "";
  if (!subscriptionId || !key || key.includes("placeholder")) return;
  try {
    await stripe.subscriptions.cancel(subscriptionId);
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (/No such subscription/i.test(message)) return;
    console.error("Stripe cancel failed during account delete", err);
  }
}

async function removeTenantPhotos(tenantId: string) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return;
  try {
    const bucket = createSupabaseServiceRoleClient().storage.from(PHOTOS_BUCKET);
    const pending = [tenantId];
    const files: string[] = [];

    while (pending.length > 0) {
      const prefix = pending.pop()!;
      const { data, error } = await bucket.list(prefix, { limit: 1000 });
      if (error || !data) break;
      for (const item of data) {
        const path = `${prefix}/${item.name}`;
        if (item.id) files.push(path);
        else pending.push(path);
      }
    }

    for (let i = 0; i < files.length; i += 100) {
      await bucket.remove(files.slice(i, i + 100));
    }
  } catch (err) {
    console.error("Photo cleanup failed during account delete", err);
  }
}
