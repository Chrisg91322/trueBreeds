"use server";

import { revalidatePath } from "next/cache";
import { requireTenantSession } from "@/lib/auth";
import { forTenant } from "@/lib/db";
import type { SocialProviderType } from "@prisma/client";

/**
 * NOTE: Real OAuth (Meta Graph API, YouTube Data API, TikTok API) requires
 * registered developer apps + app review that this platform doesn't have
 * configured yet. Until then, "connecting" an account just records the
 * handle so posts can be drafted here; publishing happens by the breeder
 * copying the caption/media and posting manually (see `awaiting_manual`
 * status below). Swapping in real OAuth later only touches this file.
 */
export async function connectSocialAccount(formData: FormData) {
  const session = await requireTenantSession();
  const db = forTenant(session.tenantId);

  const provider = String(formData.get("provider") || "") as SocialProviderType;
  const accountName = String(formData.get("accountName") || "").trim();
  if (!accountName) throw new Error("Enter your account handle");

  await db.socialConnection.upsert({
    where: { tenantId_provider: { tenantId: session.tenantId, provider } },
    update: { accountName, status: "connected" },
    create: { tenantId: session.tenantId, provider, accountName, status: "connected" },
  });

  revalidatePath("/dashboard/social");
}

export async function disconnectSocialAccount(connectionId: string) {
  const session = await requireTenantSession();
  const db = forTenant(session.tenantId);
  await db.socialConnection.delete({ where: { id: connectionId } });
  revalidatePath("/dashboard/social");
}

export async function createSocialPost(formData: FormData) {
  const session = await requireTenantSession();
  const db = forTenant(session.tenantId);

  const caption = String(formData.get("caption") || "").trim();
  if (!caption) throw new Error("Write a caption first");

  const mediaUrls = String(formData.get("mediaUrls") || "")
    .split("\n")
    .map((u) => u.trim())
    .filter(Boolean);

  const connectionIds = formData.getAll("connectionIds").map(String);
  if (connectionIds.length === 0) throw new Error("Pick at least one account to post to");

  const scheduledAtRaw = String(formData.get("scheduledAt") || "");
  const scheduledAt = scheduledAtRaw ? new Date(scheduledAtRaw) : null;

  const connections = await db.socialConnection.findMany({
    where: { id: { in: connectionIds } },
  });

  await db.socialPost.create({
    data: {
      tenantId: session.tenantId,
      caption,
      mediaUrls,
      scheduledAt,
      status: scheduledAt ? "scheduled" : "awaiting_manual",
      targets: {
        create: connections.map((c) => ({
          connectionId: c.id,
          provider: c.provider,
          status: scheduledAt ? "scheduled" : "awaiting_manual",
        })),
      },
    },
  });

  revalidatePath("/dashboard/social");
}

export async function markPostTargetPosted(targetId: string) {
  const session = await requireTenantSession();
  const db = forTenant(session.tenantId);

  // SocialPostTarget isn't directly tenant-scoped in the schema; verify via
  // its parent post before mutating.
  const target = await db.socialPostTarget.findUniqueOrThrow({
    where: { id: targetId },
    include: { post: true },
  });
  if (target.post.tenantId !== session.tenantId) throw new Error("Not found");

  await db.socialPostTarget.update({
    where: { id: targetId },
    data: { status: "posted", publishedAt: new Date() },
  });

  const remaining = await db.socialPostTarget.count({
    where: { postId: target.postId, status: { not: "posted" } },
  });
  if (remaining === 0) {
    await db.socialPost.update({ where: { id: target.postId }, data: { status: "posted" } });
  }

  revalidatePath("/dashboard/social");
}

export async function deleteSocialPost(postId: string) {
  const session = await requireTenantSession();
  const db = forTenant(session.tenantId);
  await db.socialPost.delete({ where: { id: postId } });
  revalidatePath("/dashboard/social");
}
