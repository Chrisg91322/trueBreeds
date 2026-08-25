"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { IMPERSONATION_COOKIE, requirePlatformAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
